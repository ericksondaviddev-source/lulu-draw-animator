import type { Frame, AudioClip } from '../types/studio';
import { renderFrame } from './render';

let ffmpegLoaded = false;
let ffmpegRef: any = null;

async function loadFFmpeg(onProgress?: (p: number) => void) {
  if (ffmpegLoaded && ffmpegRef) return ffmpegRef;

  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { toBlobURL } = await import('@ffmpeg/util');

  const ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }: { progress: number }) => {
    onProgress?.(Math.round(progress * 100));
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegLoaded = true;
  ffmpegRef = ffmpeg;
  return ffmpeg;
}

export async function exportToMp4(
  frames: Frame[],
  clips: AudioClip[],
  canvasSize: { width: number; height: number },
  onProgress?: (stage: string, pct: number) => void,
): Promise<Blob> {
  const w = canvasSize.width;
  const h = canvasSize.height;

  // Step 1: Record frames as WebM using MediaRecorder
  onProgress?.('Grabando frames...', 0);

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = w;
  exportCanvas.height = h;
  const ctx = exportCanvas.getContext('2d')!;

  const stream = exportCanvas.captureStream(30);

  // Audio
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  const audioTracks: MediaStreamTrack[] = [];

  if (clips.length > 0) {
    audioCtx = new AudioContext();
    audioDest = audioCtx.createMediaStreamDestination();

    for (const clip of clips.filter((c) => c.kind === 'voice' && c.blobUrl)) {
      try {
        const resp = await fetch(clip.blobUrl!);
        const buf = await resp.arrayBuffer();
        const audioBuf = await audioCtx.decodeAudioData(buf);
        const src = audioCtx.createBufferSource();
        src.buffer = audioBuf;
        src.connect(audioDest);
        src.start(audioCtx.currentTime + clip.startMs / 1000);
      } catch { /* skip */ }
    }

    const { playSfxRecipe } = await import('./audioSynth');
    for (const clip of clips.filter((c) => c.kind === 'sfx' && c.sfxId)) {
      playSfxRecipe(audioCtx, audioDest, clip.sfxId!, audioCtx.currentTime + clip.startMs / 1000);
    }

    audioTracks.push(...audioDest.stream.getAudioTracks());
  }

  const combined = new MediaStream([...stream.getVideoTracks(), ...audioTracks]);
  const recorder = new MediaRecorder(combined, { mimeType: 'video/webm;codecs=vp9,opus' });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const totalDuration = frames.reduce((a, f) => a + f.durationMs, 0);

  const webmBlob = await new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
      audioCtx?.close();
    };
    recorder.onerror = () => reject(new Error('Error al grabar video'));

    recorder.start(100);

    requestAnimationFrame(function renderLoop() {
      let elapsed = 0;
      let lastTime: number | null = null;

      function tick(now: number) {
        if (lastTime === null) lastTime = now;
        elapsed += now - lastTime;
        lastTime = now;

        let acc = 0;
        let frameIdx = 0;
        for (let i = 0; i < frames.length; i++) {
          acc += frames[i].durationMs;
          if (elapsed < acc) { frameIdx = i; break; }
        }

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        renderFrame(ctx, frames[frameIdx], w, h);

        onProgress?.('Grabando frames...', Math.min(90, (elapsed / totalDuration) * 90));

        if (elapsed < totalDuration) {
          requestAnimationFrame(tick);
        } else {
          recorder.stop();
        }
      }
      requestAnimationFrame(tick);
    });
  });

  onProgress?.('Convirtiendo a MP4...', 92);

  // Step 2: Convert WebM to MP4 using FFmpeg.wasm
  const ffmpeg = await loadFFmpeg((p) => {
    onProgress?.('Convirtiendo a MP4...', 92 + p * 0.08);
  });

  const webmData = new Uint8Array(await webmBlob.arrayBuffer());
  await ffmpeg.writeFile('input.webm', webmData);

  await ffmpeg.exec([
    '-i', 'input.webm',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    'output.mp4',
  ]);

  const mp4Data = await ffmpeg.readFile('output.mp4');
  await ffmpeg.deleteFile('input.webm');
  await ffmpeg.deleteFile('output.mp4');

  onProgress?.('Listo!', 100);

  return new Blob([mp4Data], { type: 'video/mp4' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
