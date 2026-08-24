import { useState, useCallback } from 'react';
import { X, Download, Film, Loader2 } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

type ExportStatus = 'idle' | 'recording' | 'converting' | 'done' | 'error';

export default function ExportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const frames = useStudioStore((s) => s.project.frames);
  const clips = useStudioStore((s) => s.project.clips);
  const canvasSize = useStudioStore((s) => s.project.canvasSize);

  const handleExport = useCallback(async () => {
    setStatus('recording');
    setProgress(0);
    setStage('Preparando...');
    setVideoBlob(null);

    try {
      const { exportToMp4 } = await import('../../engine/mp4Exporter');

      const blob = await exportToMp4(
        frames,
        clips,
        canvasSize,
        (s, p) => {
          setStage(s);
          setProgress(p);
          if (s.includes('Convirtiendo')) setStatus('converting');
        },
      );

      setVideoBlob(blob);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error al exportar');
    }
  }, [frames, clips, canvasSize]);

  const handleDownload = useCallback(() => {
    if (!videoBlob) return;
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lulu-${Date.now()}.mp4`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [videoBlob]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-[380px] shadow-2xl">
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
            <span className="text-zinc-300">Formato:</span> MP4 (compatible con todo)
          </p>
        </div>

        {/* Progress */}
        {(status === 'recording' || status === 'converting') && (
          <div className="mb-4">
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 text-center">
              {stage} {Math.round(progress)}%
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
              className="flex-1 h-11 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download size={15} />
              Exportar MP4
            </button>
          )}

          {(status === 'recording' || status === 'converting') && (
            <div className="flex-1 h-11 rounded-xl bg-zinc-800 text-zinc-400 font-medium text-sm flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {status === 'recording' ? 'Grabando...' : 'Convirtiendo a MP4...'}
            </div>
          )}

          {status === 'done' && (
            <button
              onClick={handleDownload}
              className="flex-1 h-11 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-500 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download size={15} />
              Descargar MP4
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={handleExport}
              className="flex-1 h-11 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 transition-all active:scale-95"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
