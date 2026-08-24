import { useState } from 'react';
import { Bookmark, Trash2, Play, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

export default function AnimationLibrary() {
  const savedAnimations = useStudioStore((s) => s.savedAnimations);
  const saveAnimation = useStudioStore((s) => s.saveAnimation);
  const loadAnimation = useStudioStore((s) => s.loadAnimation);
  const removeSavedAnimation = useStudioStore((s) => s.removeSavedAnimation);
  const appendFrames = useStudioStore((s) => s.appendFrames);
  const frames = useStudioStore((s) => s.project.frames);
  const [name, setName] = useState('');
  const [expanded, setExpanded] = useState(true);

  const handleSave = () => {
    const n = name.trim() || `Animación ${savedAnimations.length + 1}`;
    saveAnimation(n, '🎬');
    setName('');
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <Bookmark size={12} className="text-amber-400" />
        <span className="text-[10px] font-semibold text-zinc-300 flex-1 text-left">
          Biblioteca ({savedAnimations.length})
        </span>
        {expanded ? (
          <ChevronUp size={10} className="text-zinc-500" />
        ) : (
          <ChevronDown size={10} className="text-zinc-500" />
        )}
      </button>

      {expanded && (
        <>
          {/* Save input */}
          <div className="flex gap-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Nombre..."
              className="flex-1 h-8 px-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
            />
            <button
              onClick={handleSave}
              className="h-8 px-3 rounded-lg bg-amber-600 text-white text-[10px] font-semibold hover:bg-amber-500 active:scale-95 transition-all"
            >
              Guardar
            </button>
          </div>

          {/* List */}
          {savedAnimations.length === 0 && (
            <p className="text-[9px] text-zinc-600 text-center py-3">
              Guarda animaciones para reusar en otros proyectos
            </p>
          )}

          <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto">
            {savedAnimations.map((anim) => (
              <div
                key={anim.id}
                className="flex items-center gap-2 px-2 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 group"
              >
                <span className="text-sm shrink-0">{anim.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-zinc-300 font-medium truncate">
                    {anim.name}
                  </div>
                  <div className="text-[8px] text-zinc-600">
                    {anim.frames.length} frames
                  </div>
                </div>
                {/* Append frames to current project */}
                <button
                  onClick={() => appendFrames(anim.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-900/30 active:scale-90 transition-all"
                  title="Agregar al proyecto"
                >
                  <Plus size={12} />
                </button>
                {/* Replace current project */}
                <button
                  onClick={() => loadAnimation(anim.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-900/30 active:scale-90 transition-all"
                  title="Reemplazar proyecto"
                >
                  <Play size={12} />
                </button>
                <button
                  onClick={() => removeSavedAnimation(anim.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-900/30 active:scale-90 transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
