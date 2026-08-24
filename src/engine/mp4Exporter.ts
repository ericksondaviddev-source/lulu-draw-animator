import type { Frame, AudioClip } from '../types/studio';
import { renderFrame } from './render';

export async function exportVideo(
  frames: Frame[],
  clips: AudioClip[],
  canvasSize: { width: number; height: number },
  onProgress?: (stage: string, pct: number) => void,
): Promise<Blob> {
  const w = canvasSize.width;
  const h = canvasSize.height;

  onProgress?.('Preparando...', 0);

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = w;
  exportCanvas.height = h;
  const ctx = exportCanvas.getContext('2d')!;

  const stream = exportCanvas.captureStream(30);

  // Audio context for mixed output
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
      } catch { /* skip broken clip */ }
    }

    const { playSfxRecipe } = await import('./audioSynth');
    for (const clip of clips.filter((c) => c.kind === 'sfx' && c.sfxId)) {
      playSfxRecipe(audioCtx, audioDest, clip.sfxId!, audioCtx.currentTime + clip.startMs / 1000);
    }

    audioTracks.push(...audioDest.stream.getAudioTracks());
  }

  const combined = new MediaStream([...stream.getVideoTracks(), ...audioTracks]);

  // Pick best supported mime type
  const mimeCandidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const mime = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm';

  const recorder = new MediaRecorder(combined, { mimeType: mime });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const totalDuration = frames.reduce((a, f) => a + f.durationMs, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mime }));
      audioCtx?.close();
    };
    recorder.onerror = () => reject(new Error('Error al grabar'));

    recorder.start(100);
    onProgress?.('Grabando...', 5);

    let elapsed = 0;
    let lastTime: number | null = null;

    function tick(now: number) {
      if (lastTime === null) lastTime = now;
      elapsed += now - lastTime;
      lastTime = now;

      // Find current frame
      let acc = 0;
      let frameIdx = 0;
      for (let i = 0; i < frames.length; i++) {
        acc += frames[i].durationMs;
        if (elapsed < acc) { frameIdx = i; break; }
      }

      // Render frame
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      renderFrame(ctx, frames[frameIdx], w, h);

      const pct = Math.min(95, (elapsed / totalDuration) * 95);
      onProgress?.('Grabando...', pct);

      if (elapsed < totalDuration) {
        requestAnimationFrame(tick);
      } else {
        onProgress?.('Finalizando...', 98);
        recorder.stop();
      }
    }

    requestAnimationFrame(tick);
  });

  onProgress?.('Listo!', 100);
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
