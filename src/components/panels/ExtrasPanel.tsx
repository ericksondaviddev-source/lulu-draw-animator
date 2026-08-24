import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  PersonStanding,
  Palette,
  Shapes,
  Type,
  Sparkles,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { STICKMAN_TEMPLATES } from '../../data/stickmanTemplates';
import { BG_PRESETS } from '../../data/bgPresets';
import ShapesPanel from './ShapesPanel';
import TextPanel from './TextPanel';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, icon, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800/50 transition-colors"
      >
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function ExtrasPanel() {
  const bgColor = useStudioStore((s) => s.bgColor);
  const setBgColor = useStudioStore((s) => s.setBgColor);
  const addStickman = useStudioStore((s) => s.addStickman);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-[260px] bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
      <button
        onClick={() => setExpanded(!expanded)}
        className="h-10 flex items-center gap-2 px-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
      >
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-xs font-bold text-zinc-200 flex-1 text-left">Extras</span>
        {expanded ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
      </button>

      {expanded && (
        <div className="overflow-y-auto max-h-[500px]">
          {/* Stickman */}
          <Section title="Amigos" icon={<PersonStanding size={13} className="text-emerald-400" />} defaultOpen>
            <div className="grid grid-cols-3 gap-1.5">
              {STICKMAN_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => addStickman(tpl.id, 0)}
                  title={`Agregar ${tpl.name}`}
                  className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl bg-zinc-800 hover:bg-emerald-600/20 border border-zinc-700 hover:border-emerald-500/40 text-[9px] text-zinc-400 hover:text-emerald-300 transition-all active:scale-90"
                >
                  <span className="text-xl leading-none">{tpl.emoji}</span>
                  <span className="leading-none">{tpl.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-zinc-600 leading-tight mt-2">
              Toca para agregar. Arrastra para mover.
            </p>
          </Section>

          {/* Shapes */}
          <Section title="Figuras" icon={<Shapes size={13} className="text-cyan-400" />}>
            <ShapesPanel />
          </Section>

          {/* Text */}
          <Section title="Texto" icon={<Type size={13} className="text-pink-400" />}>
            <TextPanel />
          </Section>

          {/* Background */}
          <Section title="Color de Fondo" icon={<Palette size={13} className="text-pink-400" />}>
            <div className="grid grid-cols-5 gap-1.5">
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setBgColor(preset.color)}
                  title={preset.name}
                  className={`aspect-square rounded-xl border-2 transition-all active:scale-90 ${
                    bgColor === preset.color
                      ? 'border-violet-400 ring-2 ring-violet-400/30 scale-110'
                      : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                  style={{ backgroundColor: preset.color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{bgColor}</span>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
