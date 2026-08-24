import {
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Type,
  Shapes,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { clsx } from 'clsx';

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export default function ToolPalette() {
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
    <div className="w-[76px] flex flex-col items-center gap-3 py-4 bg-zinc-900/80 backdrop-blur-md border-r border-zinc-800 rounded-r-2xl">
      {/* Drawing Tools */}
      <button
        onClick={() => setTool('pen')}
        className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
          tool === 'pen'
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
        )}
        title="Lápiz"
      >
        <Pencil size={18} />
      </button>

      <button
        onClick={() => setTool('eraser')}
        className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
          tool === 'eraser'
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
        )}
        title="Borrador"
      >
        <Eraser size={18} />
      </button>

      {/* Separator */}
      <div className="w-6 h-px bg-zinc-700" />

      {/* Extra Tools */}
      <button
        onClick={() => setTool('text')}
        className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
          tool === 'text'
            ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
        )}
        title="Texto"
      >
        <Type size={18} />
      </button>

      <button
        onClick={() => setTool('shape')}
        className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
          tool === 'shape'
            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
        )}
        title="Figuras"
      >
        <Shapes size={18} />
      </button>

      {/* Separator */}
      <div className="w-6 h-px bg-zinc-700" />

      {/* Colors */}
      <div className="grid grid-cols-2 gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={clsx(
              'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
              color === c
                ? 'border-violet-500 ring-2 ring-violet-500/50'
                : 'border-zinc-700',
            )}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Separator */}
      <div className="w-6 h-px bg-zinc-700" />

      {/* Width */}
      <div className="flex flex-col items-center gap-1">
        <input
          type="range"
          min={1}
          max={30}
          value={brushWidth}
          onChange={(e) => setBrushWidth(Number(e.target.value))}
          className="w-10 h-1 appearance-none bg-zinc-700 rounded-full cursor-pointer"
          title={`Grosor: ${brushWidth}px`}
        />
        <span className="text-[10px] text-zinc-500">{brushWidth}px</span>
      </div>

      {/* Separator */}
      <div className="w-6 h-px bg-zinc-700" />

      {/* Undo / Redo / Clear */}
      <button
        onClick={undo}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
        title="Deshacer"
      >
        <Undo2 size={16} />
      </button>

      <button
        onClick={redo}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
        title="Rehacer"
      >
        <Redo2 size={16} />
      </button>

      <button
        onClick={() => clearFrame(activeFrameId)}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-red-900/50 hover:text-red-400 transition-all"
        title="Limpiar fotograma"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
