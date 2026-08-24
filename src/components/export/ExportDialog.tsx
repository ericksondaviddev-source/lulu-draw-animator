import { useState, useCallback } from 'react';
import { X, Download, Film, Loader2 } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { clsx } from 'clsx';

type ExportStatus = 'idle' | 'recording' | 'done' | 'error';

export default function ExportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const frames = useStudioStore((s) => s.project.frames);
  const clips = useStudioStore((s) => s.project.clips);
  const canvasSize = useStudioStore((s) => s.project.canvasSize);

  const handleExport = useCallback(async () => {
    setStatus('recording');
    setProgress(0);
    setVideoUrl(null);

    try {
      const { pickMimeType, EXPORT_MIME_CANDIDATES } = await import(
        '../../engine/exporter'
      );
      const { renderFrame } = await import('../../engine/render');

      const mime = pickMimeType();
      const w = canvasSize.width;
      const h = canvasSize.height;

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

        // Schedule voice clips
        for (const clip of clips.filter((c) => c.kind === 'voice' && c.blobUrl)) {
          try {
            const resp = await fetch(clip.blobUrl!);
            const buf = await resp.arrayBuffer();
            const audioBuf = await audioCtx.decodeAudioData(buf);
            const src = audioCtx.createBufferSource();
            src.buffer = audioBuf;
            src.connect(audioDest);
            src.start(audioCtx.currentTime + clip.startMs / 1000);
          } catch {
            // skip broken clip
          }
        }

        // Schedule SFX
        const { playSfxRecipe } = await import('../../engine/audioSynth');
        for (const clip of clips.filter((c) => c.kind === 'sfx' && c.sfxId)) {
          playSfxRecipe(audioCtx, audioDest, clip.sfxId!, audioCtx.currentTime + clip.startMs / 1000);
        }

        audioTracks.push(...audioDest.stream.getAudioTracks());
      }

      const combined = new MediaStream([
        ...stream.getVideoTracks(),
        ...audioTracks,
      ]);

      const recorder = new MediaRecorder(combined, { mimeType: mime });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const totalDuration = frames.reduce((a, f) => a + f.durationMs, 0);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mime });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus('done');
        audioCtx?.close();
      };

      recorder.start(100);

      // Render loop using real-time playback
      await new Promise<void>((resolve) => {
        let frameIdx = 0;
        let elapsed = 0;
        let lastTime: number | null = null;

        const renderNext = (now: number) => {
          if (lastTime === null) lastTime = now;
          const dt = now - lastTime;
          lastTime = now;
          elapsed += dt;

          // Find current frame
          let acc = 0;
          for (let i = 0; i < frames.length; i++) {
            acc += frames[i].durationMs;
            if (elapsed < acc) {
              frameIdx = i;
              break;
            }
          }

          // Render frame
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, w, h);
          renderFrame(ctx, frames[frameIdx], w, h);

          setProgress(Math.min(100, (elapsed / totalDuration) * 100));

          if (elapsed < totalDuration) {
            requestAnimationFrame(renderNext);
          } else {
            recorder.stop();
            resolve();
          }
        };

        requestAnimationFrame(renderNext);
      });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, [frames, clips, canvasSize]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `lulu-animation-${Date.now()}.webm`;
    a.click();
  }, [videoUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-[420px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-violet-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Exportar Video</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info */}
        <div className="bg-zinc-800/50 rounded-xl p-3 mb-4 text-xs text-zinc-400 space-y-1">
          <p>
            <span className="text-zinc-300">Fotogramas:</span> {frames.length}
          </p>
          <p>
            <span className="text-zinc-300">Duración:</span>{' '}
            {(frames.reduce((a, f) => a + f.durationMs, 0) / 1000).toFixed(1)}s
          </p>
          <p>
            <span className="text-zinc-300">Clips de audio:</span> {clips.length}
          </p>
          <p className="text-[10px] text-zinc-500 pt-1">
            Se exportará como WebM (compatible con todos los navegadores). Puedes
            convertir a MP4 con herramientas como HandBrake o FFmpeg.
          </p>
        </div>

        {/* Progress */}
        {status === 'recording' && (
          <div className="mb-4">
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 text-center">
              Grabando... {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 mb-4 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {status === 'idle' && (
            <button
              onClick={handleExport}
              className="flex-1 h-10 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-500 transition-all flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Exportar
            </button>
          )}

          {status === 'recording' && (
            <div className="flex-1 h-10 rounded-xl bg-zinc-800 text-zinc-400 font-medium text-sm flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Exportando...
            </div>
          )}

          {status === 'done' && (
            <button
              onClick={handleDownload}
              className="flex-1 h-10 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-500 transition-all flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Descargar Video
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={handleExport}
              className="flex-1 h-10 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-500 transition-all"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
