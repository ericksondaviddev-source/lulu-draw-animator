import { useStudioStore } from '../../store/useStudioStore';
import { SHAPE_OPTIONS } from '../../data/shapes';
import type { ShapeKind } from '../../types/studio';

export default function ShapesPanel() {
  const activeShapeKind = useStudioStore((s) => s.activeShapeKind);
  const setActiveShapeKind = useStudioStore((s) => s.setActiveShapeKind);
  const addShapeItem = useStudioStore((s) => s.addShapeItem);
  const setTool = useStudioStore((s) => s.setTool);

  const categories = ['Básicas', 'Estrellas', 'Orgánicas'] as const;

  const handleAdd = (kind: ShapeKind) => {
    setActiveShapeKind(kind);
    setTool('shape');
    addShapeItem(kind);
  };

  return (
    <div className="flex flex-col gap-2">
      {categories.map((cat) => (
        <div key={cat}>
          <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">{cat}</span>
          <div className="grid grid-cols-4 gap-1 mt-1">
            {SHAPE_OPTIONS.filter((o) => o.category === cat).map((opt) => (
              <button
                key={opt.kind}
                onClick={() => handleAdd(opt.kind)}
                title={opt.name}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 border ${
                  activeShapeKind === opt.kind
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500 text-zinc-400'
                }`}
              >
                <span className="text-base leading-none">{opt.emoji}</span>
                <span className="text-[7px] leading-none">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
