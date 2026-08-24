import { useState } from 'react';
import {
  Pencil,
  Eraser,
  Type,
  Shapes,
  Undo2,
  Redo2,
  Trash2,
  ChevronUp,
  Palette,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { clsx } from 'clsx';

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export default function MobileDrawBar() {
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
    <div className="bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800">
      {/* Expanded: colors + width */}
      {expanded && (
        <div className="px-3 pt-3 pb-2 space-y-2.5 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all active:scale-90',
                  color === c ? 'border-violet-500 ring-2 ring-violet-500/50' : 'border-zinc-600',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 w-10">Grosor</span>
            <input
              type="range"
              min={1}
              max={30}
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="flex-1 h-1.5 appearance-none bg-zinc-700 rounded-full cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400 font-mono w-8 text-right">{brushWidth}px</span>
          </div>
        </div>
      )}

      {/* Tool bar */}
      <div className="flex items-center h-12 px-2 gap-1">
        <ToolBtn icon={<Pencil size={16} />} active={tool === 'pen'} onClick={() => setTool('pen')} />
        <ToolBtn icon={<Eraser size={16} />} active={tool === 'eraser'} onClick={() => setTool('eraser')} />
        <ToolBtn icon={<Type size={16} />} active={tool === 'text'} onClick={() => setTool('text')} />
        <ToolBtn icon={<Shapes size={16} />} active={tool === 'shape'} onClick={() => setTool('shape')} />

        <div className="w-px h-6 bg-zinc-700 mx-1" />

        <ToolBtn icon={<Undo2 size={14} />} onClick={undo} />
        <ToolBtn icon={<Redo2 size={14} />} onClick={redo} />

        <div className="flex-1" />

        <ToolBtn
          icon={expanded ? <ChevronUp size={16} /> : <Palette size={16} />}
          active={expanded}
          onClick={() => setExpanded(!expanded)}
        />
        <ToolBtn
          icon={<Trash2 size={14} />}
          onClick={() => clearFrame(activeFrameId)}
          danger
        />
      </div>
    </div>
  );
}

function ToolBtn({ icon, active, onClick, danger }: { icon: React.ReactNode; active?: boolean; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90',
        danger
          ? 'text-zinc-400 hover:text-red-400 hover:bg-red-900/30'
          : active
          ? 'bg-violet-600 text-white'
          : 'text-zinc-400 bg-zinc-800 hover:bg-zinc-700',
      )}
    >
      {icon}
    </button>
  );
}
