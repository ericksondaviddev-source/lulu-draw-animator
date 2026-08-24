import { useCallback, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Copy,
  Plus,
  Trash2,
  Film,
  Gauge,
  Volume2,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { clsx } from 'clsx';

export default function Timeline({
  isPlaying,
  onTogglePlay,
  currentIndex,
  currentTimeMs,
  totalDurationMs,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentIndex: number;
  currentTimeMs: number;
  totalDurationMs: number;
}) {
  const frames = useStudioStore((s) => s.project.frames);
  const activeFrameId = useStudioStore((s) => s.activeFrameId);
  const speed = useStudioStore((s) => s.speed);
  const clips = useStudioStore((s) => s.project.clips);
  const selectFrame = useStudioStore((s) => s.selectFrame);
  const addFrame = useStudioStore((s) => s.addFrame);
  const duplicateFrame = useStudioStore((s) => s.duplicateFrame);
  const removeFrame = useStudioStore((s) => s.removeFrame);
  const setSpeed = useStudioStore((s) => s.setSpeed);
  const removeClip = useStudioStore((s) => s.removeClip);
  const updateClip = useStudioStore((s) => s.updateClip);

  const [resizingClip, setResizingClip] = useState<string | null>(null);
  const resizeRef = useRef<{ clipId: string; startX: number; origDuration: number; origStart: number; side: 'left' | 'right' } | null>(null);

  const handleFrameClick = useCallback(
    (id: string) => { selectFrame(id); },
    [selectFrame],
  );

  const progressPct = totalDurationMs > 0 ? (currentTimeMs / totalDurationMs) * 100 : 0;

  // ── Audio clip resize handlers ──
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, clipId: string, side: 'left' | 'right') => {
      e.stopPropagation();
      const clip = clips.find((c) => c.id === clipId);
      if (!clip) return;
      resizeRef.current = { clipId, startX: e.clientX, origDuration: clip.durationMs, origStart: clip.startMs, side };
      setResizingClip(clipId);

      const trackEl = (e.target as HTMLElement).closest('[data-audio-track]') as HTMLElement | null;
      const trackWidth = trackEl?.offsetWidth ?? 600;
      const msPerPx = totalDurationMs / trackWidth;

      const onMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        const dx = ev.clientX - resizeRef.current.startX;
        const dMs = dx * msPerPx;

        if (resizeRef.current.side === 'right') {
          const newDur = Math.max(200, resizeRef.current.origDuration + dMs);
          updateClip(clipId, { durationMs: Math.round(newDur) });
        } else {
          const newStart = Math.max(0, Math.min(totalDurationMs - 200, resizeRef.current.origStart + dMs));
          const newDur = Math.max(200, resizeRef.current.origDuration - (newStart - resizeRef.current.origStart));
          updateClip(clipId, { startMs: Math.round(newStart), durationMs: Math.round(newDur) });
        }
      };

      const onUp = () => {
        resizeRef.current = null;
        setResizingClip(null);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [clips, totalDurationMs, updateClip],
  );

  return (
    <div className="h-[180px] bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 rounded-t-2xl flex flex-col">
      {/* Controls bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50">
        <button
          onClick={onTogglePlay}
          className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center transition-all',
            isPlaying
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/40'
              : 'bg-violet-600/80 text-white hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-600/30',
          )}
          title={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        <button onClick={() => duplicateFrame(activeFrameId)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all" title="Duplicar">
          <Copy size={14} />
        </button>
        <button onClick={addFrame} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all" title="Nuevo frame">
          <Plus size={14} />
        </button>
        <button onClick={() => removeFrame(activeFrameId)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-red-900/50 hover:text-red-400 transition-all" title="Eliminar">
          <Trash2 size={14} />
        </button>

        <div className="w-px h-5 bg-zinc-700 mx-1" />

        <Film size={14} className="text-zinc-500" />
        <span className="text-xs text-zinc-400 font-mono">
          {isPlaying ? `${currentIndex + 1}` : `${frames.findIndex((f) => f.id === activeFrameId) + 1}`} / {frames.length}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <Gauge size={12} className="text-amber-400" />
          <input
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-16 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[10px] font-mono text-amber-400 w-7 text-right">{speed}x</span>
        </div>

        <div className="w-px h-5 bg-zinc-700 mx-1" />

        <span className="text-[10px] text-zinc-500 font-mono">
          {(currentTimeMs / 1000).toFixed(1)}s / {(totalDurationMs / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Frame strip */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-1.5 scrollbar-thin relative">
        {isPlaying && totalDurationMs > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-violet-500 z-10 pointer-events-none"
            style={{ left: `${24 + progressPct * 0.01 * (frames.length * 100 - 24)}px` }}
          />
        )}

        <div className="flex gap-2 h-full" style={{ minHeight: '50px' }}>
          {frames.map((frame, i) => {
            const isActive = isPlaying ? i === currentIndex : frame.id === activeFrameId;
            return (
              <button
                key={frame.id}
                onClick={() => handleFrameClick(frame.id)}
                className={clsx(
                  'relative flex-shrink-0 w-20 h-full rounded-xl border-2 overflow-hidden transition-all group',
                  isActive
                    ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-105'
                    : 'border-zinc-700 hover:border-zinc-500 hover:scale-[1.03]',
                )}
              >
                {frame.thumbnailDataUrl ? (
                  <img src={frame.thumbnailDataUrl} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: frame.bgColor ?? '#fff' }}>
                    <span className="text-[10px] text-zinc-300">{i + 1}</span>
                  </div>
                )}
                <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">{i + 1}</div>
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {(frame.durationMs / 1000).toFixed(1)}s
                </div>
              </button>
            );
          })}
          <button
            onClick={addFrame}
            className="flex-shrink-0 w-16 h-full rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* ── AUDIO CHANNEL ── */}
      <div className="h-[40px] border-t border-zinc-800/50 px-3 flex items-center gap-2 relative overflow-hidden">
        <Volume2 size={12} className="text-zinc-600 flex-shrink-0" />
        <span className="text-[9px] text-zinc-600 flex-shrink-0 w-8">Audio</span>

        {/* Audio clips */}
        <div className="flex-1 relative h-full" data-audio-track>
          {clips.length === 0 && (
            <div className="absolute inset-0 flex items-center">
              <span className="text-[9px] text-zinc-700 italic">Sin clips — graba voz o agrega SFX</span>
            </div>
          )}

          {clips.map((clip) => {
            const leftPct = totalDurationMs > 0 ? (clip.startMs / totalDurationMs) * 100 : 0;
            const widthPct = totalDurationMs > 0 ? (clip.durationMs / totalDurationMs) * 100 : 0;
            const color = clip.kind === 'voice'
              ? 'bg-emerald-600/60 border-emerald-500/50'
              : 'bg-amber-600/60 border-amber-500/50';
            const isResizing = resizingClip === clip.id;

            return (
              <div
                key={clip.id}
                className={`absolute top-1 bottom-1 rounded-md border flex items-center px-1 gap-0 cursor-pointer group/clip hover:brightness-110 transition-all ${color} ${isResizing ? 'ring-1 ring-white/30' : ''}`}
                style={{
                  left: `${leftPct}%`,
                  width: `${Math.max(widthPct, 2)}%`,
                }}
                title={`${clip.name} — ${(clip.durationMs / 1000).toFixed(1)}s | Arrastra bordes para redimensionar`}
              >
                {/* Left resize handle */}
                <div
                  className="w-2 h-full cursor-ew-resize flex-shrink-0 flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, clip.id, 'left')}
                >
                  <div className="w-0.5 h-3 bg-white/40 rounded-full" />
                </div>

                <span className="text-[8px] text-white/80 truncate flex-1 select-none">
                  {clip.kind === 'voice' ? '🎤' : '🔊'} {clip.name}
                </span>

                <span className="text-[7px] text-white/50 font-mono flex-shrink-0 select-none">
                  {(clip.durationMs / 1000).toFixed(1)}s
                </span>

                {/* Right resize handle */}
                <div
                  className="w-2 h-full cursor-ew-resize flex-shrink-0 flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleResizeStart(e, clip.id, 'right')}
                >
                  <div className="w-0.5 h-3 bg-white/40 rounded-full" />
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
                  className="w-3 h-3 rounded bg-red-500/60 text-white text-[7px] flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity flex-shrink-0"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Playhead on audio track */}
          {isPlaying && totalDurationMs > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-violet-400 z-10 pointer-events-none"
              style={{ left: `${progressPct}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
