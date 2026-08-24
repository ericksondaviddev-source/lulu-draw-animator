import { useState } from 'react';
import { Bookmark, Trash2, Play } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

export default function AnimationLibrary() {
  const savedAnimations = useStudioStore((s) => s.savedAnimations);
  const saveAnimation = useStudioStore((s) => s.saveAnimation);
  const loadAnimation = useStudioStore((s) => s.loadAnimation);
  const removeSavedAnimation = useStudioStore((s) => s.removeSavedAnimation);
  const frames = useStudioStore((s) => s.project.frames);
  const [name, setName] = useState('');

  const handleSave = () => {
    const n = name.trim() || `Animación ${savedAnimations.length + 1}`;
    saveAnimation(n, '🎬');
    setName('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Bookmark size={12} className="text-amber-400" />
        <span className="text-[10px] font-semibold text-zinc-300">
          Biblioteca ({savedAnimations.length})
        </span>
      </div>

      <div className="flex gap-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre..."
          className="flex-1 h-7 px-2 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
        />
        <button
          onClick={handleSave}
          className="h-7 px-2 rounded-lg bg-amber-600 text-white text-[10px] font-semibold hover:bg-amber-500 transition-all"
        >
          Guardar ({frames.length}f)
        </button>
      </div>

      {savedAnimations.length === 0 && (
        <p className="text-[9px] text-zinc-600 text-center py-2">
          Guarda animaciones para reutilizar en otros proyectos
        </p>
      )}

      <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
        {savedAnimations.map((anim) => (
          <div
            key={anim.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
          >
            <span className="text-sm">{anim.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-zinc-300 font-medium truncate">{anim.name}</div>
              <div className="text-[8px] text-zinc-600">{anim.frames.length} frames</div>
            </div>
            <button
              onClick={() => loadAnimation(anim.id)}
              className="w-6 h-6 rounded flex items-center justify-center text-emerald-400 hover:bg-emerald-900/30 transition-all"
              title="Cargar animación"
            >
              <Play size={11} />
            </button>
            <button
              onClick={() => removeSavedAnimation(anim.id)}
              className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-900/30 transition-all"
              title="Eliminar"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
