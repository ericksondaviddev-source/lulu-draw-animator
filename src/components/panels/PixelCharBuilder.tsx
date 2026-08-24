import { useStudioStore } from '../../store/useStudioStore';
import { PIXEL_TEMPLATES } from '../../data/pixelTemplates';

const PART_COLORS = [
  '#fbbf24', '#f59e0b', '#d97706', '#b45309',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
  '#22c55e', '#16a34a', '#15803d', '#166534',
  '#a855f7', '#9333ea', '#7e22ce', '#6b21a8',
  '#ec4899', '#db2777', '#be185d', '#9d174d',
  '#6b7280', '#4b5563', '#374151', '#1f2937',
  '#ffffff', '#000000',
];

export default function PixelCharBuilder() {
  const selectedId = useStudioStore((s) => s.selectedId);
  const frames = useStudioStore((s) => s.project.frames);
  const activeFrameId = useStudioStore((s) => s.activeFrameId);
  const setPixelCharPartColor = useStudioStore((s) => s.setPixelCharPartColor);
  const togglePixelCharPart = useStudioStore((s) => s.togglePixelCharPart);
  const togglePixelCharGuide = useStudioStore((s) => s.togglePixelCharGuide);
  const setPixelCharPose = useStudioStore((s) => s.setPixelCharPose);
  const removePixelChar = useStudioStore((s) => s.removePixelChar);

  const activeFrame = frames.find((f) => f.id === activeFrameId);
  const selectedChar = activeFrame?.pixelChars?.find((c) => c.id === selectedId);

  if (!selectedChar) {
    return (
      <div className="text-[10px] text-zinc-600 italic text-center py-2">
        Selecciona un personaje pixel en el canvas para editarlo
      </div>
    );
  }

  const tpl = PIXEL_TEMPLATES.find((t) => t.id === selectedChar.templateId);
  if (!tpl) return null;

  const currentPose = tpl.poses[selectedChar.currentPoseIndex % tpl.poses.length];

  return (
    <div className="space-y-3">
      {/* Character info */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{tpl.emoji}</span>
        <div className="flex-1">
          <div className="text-[11px] font-semibold text-zinc-200">{tpl.name}</div>
          <div className="text-[9px] text-zinc-500">{currentPose?.name}</div>
        </div>
        <button
          onClick={() => togglePixelCharGuide(selectedChar.id)}
          className={`px-2 py-1 rounded text-[9px] transition-all ${
            selectedChar.isGuide
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
          }`}
        >
          {selectedChar.isGuide ? '📐 Guía' : '🎨 Normal'}
        </button>
      </div>

      {/* Pose selector */}
      {tpl.poses.length > 1 && (
        <div>
          <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">Pose</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {tpl.poses.map((pose, i) => (
              <button
                key={i}
                onClick={() => setPixelCharPose(selectedChar.id, i)}
                className={`px-2 py-1 rounded-lg text-[9px] transition-all ${
                  selectedChar.currentPoseIndex === i
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                }`}
              >
                {pose.emoji} {pose.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Body parts toggle + color */}
      <div>
        <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">Partes del Cuerpo</span>
        <div className="flex flex-col gap-1 mt-1">
          {tpl.parts.map((part) => {
            const isVisible = selectedChar.visibleParts.includes(part.id);
            const currentColor = selectedChar.partColors[part.id] ?? part.color;
            return (
              <div key={part.id} className="flex items-center gap-1.5">
                <button
                  onClick={() => togglePixelCharPart(selectedChar.id, part.id)}
                  className={`w-5 h-5 rounded border flex items-center justify-center text-[8px] transition-all ${
                    isVisible
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-600'
                  }`}
                >
                  {isVisible ? '✓' : '×'}
                </button>
                <div
                  className="w-4 h-4 rounded border border-zinc-600 flex-shrink-0"
                  style={{ backgroundColor: currentColor }}
                />
                <span className="text-[9px] text-zinc-400 flex-1">{part.label}</span>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setPixelCharPartColor(selectedChar.id, part.id, e.target.value)}
                  className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick color palette */}
      <div>
        <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">Colores Rápidos</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {PART_COLORS.map((c) => (
            <button
              key={c}
              className="w-4 h-4 rounded border border-zinc-700 hover:border-zinc-500 transition-all"
              style={{ backgroundColor: c }}
              title={c}
              onClick={() => {
                // Apply to first visible part that doesn't have an override
                const firstPart = tpl.parts.find((p) => selectedChar.visibleParts.includes(p.id) && !selectedChar.partColors[p.id]);
                if (firstPart) setPixelCharPartColor(selectedChar.id, firstPart.id, c);
              }}
            />
          ))}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => { removePixelChar(selectedChar.id); }}
        className="w-full px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] hover:bg-red-500/20 transition-all"
      >
        🗑️ Eliminar personaje
      </button>
    </div>
  );
}
