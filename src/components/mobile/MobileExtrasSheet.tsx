import { useState } from 'react';
import {
  PersonStanding,
  Gamepad2,
  Shapes,
  Type,
  Palette,
  Box,
  Gauge,
  X,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { STICKMAN_TEMPLATES } from '../../data/stickmanTemplates';
import { PIXEL_TEMPLATES } from '../../data/pixelTemplates';
import { BG_PRESETS, RENDER_MODES } from '../../data/bgPresets';
import ShapesPanel from '../panels/ShapesPanel';
import TextPanel from '../panels/TextPanel';
import PixelCharBuilder from '../panels/PixelCharBuilder';
import { clsx } from 'clsx';

type ExtrasTab = 'stickmen' | 'pixels' | 'shapes' | 'text' | 'style';

const TABS: { id: ExtrasTab; label: string; icon: React.ReactNode }[] = [
  { id: 'stickmen', label: 'Stickman', icon: <PersonStanding size={14} /> },
  { id: 'pixels', label: 'Pixel', icon: <Gamepad2 size={14} /> },
  { id: 'shapes', label: 'Figuras', icon: <Shapes size={14} /> },
  { id: 'text', label: 'Texto', icon: <Type size={14} /> },
  { id: 'style', label: 'Estilo', icon: <Palette size={14} /> },
];

export default function MobileExtrasSheet({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<ExtrasTab>('stickmen');
  const addStickman = useStudioStore((s) => s.addStickman);
  const addPixelChar = useStudioStore((s) => s.addPixelChar);
  const bgColor = useStudioStore((s) => s.bgColor);
  const renderMode = useStudioStore((s) => s.renderMode);
  const speed = useStudioStore((s) => s.speed);
  const setBgColor = useStudioStore((s) => s.setBgColor);
  const setRenderMode = useStudioStore((s) => s.setRenderMode);
  const setSpeed = useStudioStore((s) => s.setSpeed);

  return (
    <div className="bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 flex flex-col" style={{ maxHeight: '50vh' }}>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 px-2 pt-2 pb-1 overflow-x-auto flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all active:scale-95',
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
            <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">Plantillas</span>
            <div className="grid grid-cols-4 gap-1.5">
              {STICKMAN_TEMPLATES.filter((t) => !t.id.includes('cycle')).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => addStickman(tpl.id, 0)}
                  className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl bg-zinc-800 active:bg-emerald-600/20 border border-zinc-700 active:border-emerald-500/40 text-[9px] text-zinc-400 active:text-emerald-300 transition-all"
                >
                  <span className="text-lg leading-none">{tpl.emoji}</span>
                  <span className="leading-none truncate w-full text-center">{tpl.name}</span>
                </button>
              ))}
            </div>
            <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider block mt-2">Ciclos</span>
            <div className="grid grid-cols-2 gap-1.5">
              {STICKMAN_TEMPLATES.filter((t) => t.id.includes('cycle')).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => addStickman(tpl.id, 0)}
                  className="flex items-center gap-1.5 px-2 py-2 rounded-xl bg-zinc-800 active:bg-emerald-600/20 border border-zinc-700 active:border-emerald-500/40 text-[9px] text-zinc-400 active:text-emerald-300 transition-all"
                >
                  <span className="text-lg leading-none">{tpl.emoji}</span>
                  <div className="text-left">
                    <div className="font-medium">{tpl.name}</div>
                    <div className="text-[7px] text-zinc-600">{tpl.poses.length} poses</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'pixels' && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              {PIXEL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => addPixelChar(tpl.id, 0)}
                  className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl bg-zinc-800 active:bg-blue-600/20 border border-zinc-700 active:border-blue-500/40 text-[9px] text-zinc-400 active:text-blue-300 transition-all"
                >
                  <span className="text-lg leading-none">{tpl.emoji}</span>
                  <span className="leading-none">{tpl.name}</span>
                </button>
              ))}
            </div>
            <PixelCharBuilder />
          </div>
        )}

        {tab === 'shapes' && <ShapesPanel />}
        {tab === 'text' && <TextPanel />}

        {tab === 'style' && (
          <div className="space-y-3">
            {/* Background */}
            <div>
              <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">Fondo</span>
              <div className="grid grid-cols-5 gap-1.5 mt-1">
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setBgColor(preset.color)}
                    className={`aspect-square rounded-xl border-2 transition-all active:scale-90 ${
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
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent mt-1"
              />
            </div>

            {/* Render mode */}
            <div>
              <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">Render</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {RENDER_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setRenderMode(mode.id)}
                    className={clsx(
                      'flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-all active:scale-95',
                      renderMode === mode.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700',
                    )}
                  >
                    <span>{mode.emoji}</span>
                    <span>{mode.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Speed */}
            <div>
              <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">Velocidad</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min={0.25}
                  max={4}
                  step={0.25}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] font-mono text-amber-400">{speed}x</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
