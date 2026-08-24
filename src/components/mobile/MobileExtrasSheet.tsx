import { useState } from 'react';
import {
  PersonStanding,
  Shapes,
  Type,
  Palette,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { STICKMAN_TEMPLATES } from '../../data/stickmanTemplates';
import { BG_PRESETS } from '../../data/bgPresets';
import ShapesPanel from '../panels/ShapesPanel';
import TextPanel from '../panels/TextPanel';
import { clsx } from 'clsx';

type ExtrasTab = 'stickmen' | 'shapes' | 'text' | 'style';

const TABS: { id: ExtrasTab; label: string; icon: React.ReactNode }[] = [
  { id: 'stickmen', label: 'Amigos', icon: <PersonStanding size={14} /> },
  { id: 'shapes', label: 'Figuras', icon: <Shapes size={14} /> },
  { id: 'text', label: 'Texto', icon: <Type size={14} /> },
  { id: 'style', label: 'Fondo', icon: <Palette size={14} /> },
];

export default function MobileExtrasSheet({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<ExtrasTab>('stickmen');
  const addStickman = useStudioStore((s) => s.addStickman);
  const bgColor = useStudioStore((s) => s.bgColor);
  const setBgColor = useStudioStore((s) => s.setBgColor);

  return (
    <div className="bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 flex flex-col" style={{ maxHeight: '45vh' }}>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 px-2 pt-2 pb-1 overflow-x-auto flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all active:scale-95',
              tab === t.id
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
        {tab === 'stickmen' && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {STICKMAN_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => addStickman(tpl.id, 0)}
                  className="flex flex-col items-center gap-1 px-2 py-3 rounded-2xl bg-zinc-800 active:bg-emerald-600/20 border border-zinc-700 active:border-emerald-500/40 text-[11px] text-zinc-400 active:text-emerald-300 transition-all"
                >
                  <span className="text-2xl leading-none">{tpl.emoji}</span>
                  <span className="leading-none font-medium">{tpl.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 text-center">
              Toca para agregar. Arrastra para mover.
            </p>
          </div>
        )}

        {tab === 'shapes' && <ShapesPanel />}
        {tab === 'text' && <TextPanel />}

        {tab === 'style' && (
          <div className="space-y-3">
            <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider">Color de Fondo</span>
            <div className="grid grid-cols-5 gap-2">
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setBgColor(preset.color)}
                  className={`aspect-square rounded-2xl border-2 transition-all active:scale-90 ${
                    bgColor === preset.color
                      ? 'border-violet-400 ring-2 ring-violet-400/30 scale-110'
                      : 'border-zinc-700'
                  }`}
                  style={{ backgroundColor: preset.color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
