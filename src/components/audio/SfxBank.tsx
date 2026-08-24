import { useCallback, useState } from 'react';
import { SFX_LIBRARY } from '../../data/sfx';
import { getSharedAudioContext, playSfxRecipe } from '../../engine/audioSynth';
import { useStudioStore } from '../../store/useStudioStore';
import { clsx } from 'clsx';

export default function SfxBank() {
  const [flashId, setFlashId] = useState<string | null>(null);
  const addClip = useStudioStore((s) => s.addClip);
  const currentTimeMs = useStudioStore((s) => s.currentTimeMs) ?? 0;

  const handleSfx = useCallback(
    (id: string, name: string, durationMs: number) => {
      const ctx = getSharedAudioContext();
      playSfxRecipe(ctx, ctx.destination, id);
      addClip({
        id: crypto.randomUUID(),
        kind: 'sfx',
        name,
        startMs: Math.floor(currentTimeMs),
        durationMs,
        sfxId: id,
      });
      setFlashId(id);
      setTimeout(() => setFlashId(null), 400);
    },
    [addClip, currentTimeMs],
  );

  return (
    <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-3">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Efectos de Sonido
      </h3>
      <div className="grid grid-cols-2 gap-1.5">
        {SFX_LIBRARY.map((sfx) => (
          <button
            key={sfx.id}
            onClick={() => handleSfx(sfx.id, sfx.name, sfx.durationMs)}
            className={clsx(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all text-[11px]',
              flashId === sfx.id
                ? 'bg-violet-600/30 border border-violet-500 text-white'
                : 'bg-zinc-800/60 border border-zinc-700 text-zinc-300 hover:bg-zinc-700/80 hover:border-zinc-600',
            )}
          >
            <span className="text-sm">{sfx.emoji}</span>
            <span className="font-medium">{sfx.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
