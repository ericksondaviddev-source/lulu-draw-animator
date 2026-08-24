import {
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  ChevronUp,
  Palette,
} from 'lucide-react';
import { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { clsx } from 'clsx';

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export default function ToolPaletteMobile() {
  const [expanded, setExpanded] = useState(false);
  const tool = useStudioStore((s) => s.selectedTool);
  const color = useStudioStore((s) => s.color);
  const brushWidth = useStudioStore((s) => s.brushWidth);
  const setTool = useStudioStore((s) => s.setTool);
  const setColor = useStudioStore((s) => s.setColor);
  const setBrushWidth = useStudioStore((s) => s.setBrushWidth);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const clearFrame = useStudioStore((s) => s.clearFrame);
  const activeFrameId = useStudioStore((s) => s.activeFrameId);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Expanded panel */}
      {expanded && (
        <div className="bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 px-3 py-3 space-y-3">
          {/* Colors row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all active:scale-90',
                  color === c
                    ? 'border-violet-500 ring-2 ring-violet-500/50'
                    : 'border-zinc-600',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Width slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 w-8">Grosor</span>
            <input
              type="range"
              min={1}
              max={30}
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="flex-1 h-1.5 appearance-none bg-zinc-700 rounded-full cursor-pointer"
            />
            <span className="text-xs text-zinc-400 font-mono w-8 text-right">{brushWidth}px</span>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-around h-14 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 px-2">
        <button
          onClick={() => setTool('pen')}
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90',
            tool === 'pen'
              ? 'bg-violet-600 text-white'
              : 'text-zinc-400 bg-zinc-800',
          )}
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => setTool('eraser')}
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90',
            tool === 'eraser'
              ? 'bg-violet-600 text-white'
              : 'text-zinc-400 bg-zinc-800',
          )}
        >
          <Eraser size={18} />
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90',
            expanded
              ? 'bg-violet-600 text-white'
              : 'text-zinc-400 bg-zinc-800',
          )}
        >
          {expanded ? <ChevronUp size={18} /> : <Palette size={18} />}
        </button>

        <button
          onClick={undo}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 bg-zinc-800 active:scale-90 transition-all"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={redo}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 bg-zinc-800 active:scale-90 transition-all"
        >
          <Redo2 size={16} />
        </button>

        <button
          onClick={() => clearFrame(activeFrameId)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 bg-zinc-800 active:scale-90 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
