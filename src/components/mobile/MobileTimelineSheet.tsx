import {
  Play,
  Pause,
  Copy,
  Plus,
  Trash2,
  Volume2,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { clsx } from 'clsx';

export default function MobileTimelineSheet({
  isPlaying,
  onTogglePlay,
  currentIndex,
  currentTimeMs,
  totalDurationMs,
  onClose,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentIndex: number;
  currentTimeMs: number;
  totalDurationMs: number;
  onClose: () => void;
}) {
  const frames = useStudioStore((s) => s.project.frames);
  const activeFrameId = useStudioStore((s) => s.activeFrameId);
  const clips = useStudioStore((s) => s.project.clips);
  const selectFrame = useStudioStore((s) => s.selectFrame);
  const addFrame = useStudioStore((s) => s.addFrame);
  const duplicateFrame = useStudioStore((s) => s.duplicateFrame);
  const removeFrame = useStudioStore((s) => s.removeFrame);
  const removeClip = useStudioStore((s) => s.removeClip);

  const progressPct = totalDurationMs > 0 ? (currentTimeMs / totalDurationMs) * 100 : 0;

  return (
    <div className="bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 flex flex-col" style={{ maxHeight: '45vh' }}>
      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/50 flex-shrink-0">
        <button
          onClick={onTogglePlay}
          className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90',
            isPlaying
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/40'
              : 'bg-violet-600/80 text-white',
          )}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        <button onClick={() => duplicateFrame(activeFrameId)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 bg-zinc-800 active:scale-90">
          <Copy size={13} />
        </button>
        <button onClick={addFrame} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 bg-zinc-800 active:scale-90">
          <Plus size={13} />
        </button>
        <button onClick={() => removeFrame(activeFrameId)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 bg-zinc-800 active:scale-90">
          <Trash2 size={13} />
        </button>

        <div className="flex-1" />

        <span className="text-[10px] text-zinc-400 font-mono">
          {isPlaying ? currentIndex + 1 : frames.findIndex((f) => f.id === activeFrameId) + 1} / {frames.length}
        </span>

        <span className="text-[10px] text-zinc-500 font-mono">
          {(currentTimeMs / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Frame strip — horizontal scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-2 min-h-0">
        <div className="flex gap-2 h-full" style={{ minHeight: '56px' }}>
          {frames.map((frame, i) => {
            const isActive = isPlaying ? i === currentIndex : frame.id === activeFrameId;
            return (
              <button
                key={frame.id}
                onClick={() => selectFrame(frame.id)}
                className={clsx(
                  'relative flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all active:scale-95',
                  isActive
                    ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                    : 'border-zinc-700',
                )}
              >
                {frame.thumbnailDataUrl ? (
                  <img src={frame.thumbnailDataUrl} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: frame.bgColor ?? '#fff' }}>
                    <span className="text-[10px] text-zinc-300">{i + 1}</span>
                  </div>
                )}
                <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[8px] font-bold px-1 rounded">{i + 1}</div>
              </button>
            );
          })}
          <button
            onClick={addFrame}
            className="flex-shrink-0 w-14 h-16 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Audio clips */}
      {clips.length > 0 && (
        <div className="h-8 border-t border-zinc-800/50 px-3 flex items-center gap-2 flex-shrink-0">
          <Volume2 size={10} className="text-zinc-600" />
          <div className="flex-1 relative h-full overflow-hidden">
            {clips.map((clip) => {
              const leftPct = totalDurationMs > 0 ? (clip.startMs / totalDurationMs) * 100 : 0;
              const widthPct = totalDurationMs > 0 ? (clip.durationMs / totalDurationMs) * 100 : 0;
              const color = clip.kind === 'voice' ? 'bg-emerald-600/60' : 'bg-amber-600/60';
              return (
                <div
                  key={clip.id}
                  className={`absolute top-0.5 bottom-0.5 rounded flex items-center px-1 ${color}`}
                  style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 3)}%` }}
                >
                  <span className="text-[7px] text-white/80 truncate">{clip.kind === 'voice' ? '🎤' : '🔊'} {clip.name}</span>
                </div>
              );
            })}
            {isPlaying && totalDurationMs > 0 && (
              <div className="absolute top-0 bottom-0 w-0.5 bg-violet-400" style={{ left: `${progressPct}%` }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
