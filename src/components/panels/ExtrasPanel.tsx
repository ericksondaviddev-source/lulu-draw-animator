import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  PersonStanding,
  Palette,
  Gauge,
  Box,
  Sparkles,
  Shapes,
  Type,
  Bookmark,
  Maximize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Gamepad2,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { STICKMAN_TEMPLATES } from '../../data/stickmanTemplates';
import { PIXEL_TEMPLATES } from '../../data/pixelTemplates';
import { BG_PRESETS, RENDER_MODES } from '../../data/bgPresets';
import { ASPECT_RATIOS } from '../../types/studio';
import type { AspectRatio } from '../../types/studio';
import ShapesPanel from './ShapesPanel';
import TextPanel from './TextPanel';
import AnimationLibrary from './AnimationLibrary';
import PixelCharBuilder from './PixelCharBuilder';

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
  const renderMode = useStudioStore((s) => s.renderMode);
  const speed = useStudioStore((s) => s.speed);
  const aspectRatio = useStudioStore((s) => s.aspectRatio);
  const canvasZoom = useStudioStore((s) => s.canvasZoom);
  const setBgColor = useStudioStore((s) => s.setBgColor);
  const setRenderMode = useStudioStore((s) => s.setRenderMode);
  const setSpeed = useStudioStore((s) => s.setSpeed);
  const setAspectRatio = useStudioStore((s) => s.setAspectRatio);
  const setCanvasZoom = useStudioStore((s) => s.setCanvasZoom);
  const setCanvasPan = useStudioStore((s) => s.setCanvasPan);
  const addStickman = useStudioStore((s) => s.addStickman);
  const addPixelChar = useStudioStore((s) => s.addPixelChar);
  const [expanded, setExpanded] = useState(true);

  // Categorize templates: static vs animation cycles
  const staticTemplates = STICKMAN_TEMPLATES.filter((t) => t.poses.length <= 1 && !t.id.includes('cycle'));
  const animTemplates = STICKMAN_TEMPLATES.filter((t) => t.poses.length > 1 || t.id.includes('cycle'));

  return (
    <div className="w-[260px] bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
      <button
        onClick={() => setExpanded(!expanded)}
        className="h-10 flex items-center gap-2 px-3 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
      >
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-xs font-bold text-zinc-200 flex-1 text-left">Extras & Efectos</span>
        {expanded ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
      </button>

      {expanded && (
        <div className="overflow-y-auto max-h-[600px]">
          {/* ── Aspect Ratio ── */}
          <Section title="Formato / Aspect Ratio" icon={<Maximize size={13} className="text-violet-400" />} defaultOpen>
            <div className="grid grid-cols-5 gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  title={`${ar.label} ${ar.width}×${ar.height}`}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl border transition-all active:scale-90 ${
                    aspectRatio === ar.id
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="text-sm leading-none">{ar.emoji}</span>
                  <span className="text-[8px] leading-none">{ar.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-zinc-600">
                {ASPECT_RATIOS.find((a) => a.id === aspectRatio)?.width} × {ASPECT_RATIOS.find((a) => a.id === aspectRatio)?.height}
              </span>
              <span className="text-[9px] text-zinc-600">{aspectRatio}</span>
            </div>
          </Section>

          {/* ── Canvas Zoom ── */}
          <Section title="Zoom del Canvas" icon={<ZoomIn size={13} className="text-emerald-400" />}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCanvasZoom(canvasZoom - 0.25)}
                className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
              >
                <ZoomOut size={12} />
              </button>
              <input
                type="range"
                min={0.25}
                max={5}
                step={0.25}
                value={canvasZoom}
                onChange={(e) => setCanvasZoom(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <button
                onClick={() => setCanvasZoom(canvasZoom + 0.25)}
                className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
              >
                <ZoomIn size={12} />
              </button>
              <button
                onClick={() => { setCanvasZoom(1); setCanvasPan(0, 0); }}
                className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
                title="Reset zoom"
              >
                <RotateCcw size={12} />
              </button>
            </div>
            <div className="flex items-center justify-center mt-1.5">
              <span className="text-[10px] font-mono text-zinc-400">{Math.round(canvasZoom * 100)}%</span>
            </div>
          </Section>

          {/* ── Stickman Templates ── */}
          <Section title="Plantillas" icon={<PersonStanding size={13} className="text-emerald-400" />} defaultOpen>
            {staticTemplates.length > 0 && (
              <>
                <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">Estáticas</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {staticTemplates.map((tpl) => (
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
              </>
            )}
            {animTemplates.length > 0 && (
              <>
                <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider mt-2 block">Ciclos de Animación</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {animTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => addStickman(tpl.id, 0)}
                      title={`${tpl.name} (${tpl.poses.length} poses)`}
                      className="flex items-center gap-1.5 px-2 py-2 rounded-xl bg-zinc-800 hover:bg-emerald-600/20 border border-zinc-700 hover:border-emerald-500/40 text-[9px] text-zinc-400 hover:text-emerald-300 transition-all active:scale-90"
                    >
                      <span className="text-lg leading-none">{tpl.emoji}</span>
                      <div className="flex flex-col items-start">
                        <span className="leading-none font-medium">{tpl.name}</span>
                        <span className="leading-none text-[7px] text-zinc-600">{tpl.poses.length} poses</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="text-[9px] text-zinc-600 leading-tight mt-2">
              Toca para agregar. Arrastra para mover. Selection para editar joints. Delete para borrar.
            </p>
          </Section>

          {/* ── Pixel Characters ── */}
          <Section title="Pixel Personajes" icon={<Gamepad2 size={13} className="text-blue-400" />}>
            <div className="grid grid-cols-3 gap-1.5">
              {PIXEL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => addPixelChar(tpl.id, 0)}
                  title={`Agregar ${tpl.name}`}
                  className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl bg-zinc-800 hover:bg-blue-600/20 border border-zinc-700 hover:border-blue-500/40 text-[9px] text-zinc-400 hover:text-blue-300 transition-all active:scale-90"
                >
                  <span className="text-xl leading-none">{tpl.emoji}</span>
                  <span className="leading-none">{tpl.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-zinc-600 leading-tight mt-2">
              Personajes tipo Minecraft/bloques. Selecciona en canvas para editar colores y partes.
            </p>
          </Section>

          {/* ── Pixel Char Builder (when selected) ── */}
          <Section title="Editor de Personaje" icon={<Sparkles size={13} className="text-emerald-400" />} defaultOpen>
            <PixelCharBuilder />
          </Section>

          {/* ── Shapes ── */}
          <Section title="Figuras" icon={<Shapes size={13} className="text-cyan-400" />}>
            <ShapesPanel />
          </Section>

          {/* ── Text ── */}
          <Section title="Texto" icon={<Type size={13} className="text-pink-400" />}>
            <TextPanel />
          </Section>

          {/* ── Speed Control ── */}
          <Section title="Velocidad" icon={<Gauge size={13} className="text-amber-400" />}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 w-6">🐢</span>
              <input
                type="range"
                min={0.25}
                max={4}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-zinc-500 w-6 text-right">🐇</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex gap-1">
                {[0.25, 0.5, 1, 2, 4].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSpeed(v)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all ${
                      speed === v
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    {v}x
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-mono text-zinc-400">{speed}x</span>
            </div>
          </Section>

          {/* ── Background Colors ── */}
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

          {/* ── Render Modes ── */}
          <Section title="Estilo de Render" icon={<Box size={13} className="text-cyan-400" />}>
            <div className="flex flex-col gap-1">
              {(['2D', '3D', '2.5D'] as const).map((cat) => {
                const modes = RENDER_MODES.filter((m) => m.category === cat);
                return (
                  <div key={cat}>
                    <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">{cat}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {modes.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setRenderMode(mode.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                            renderMode === mode.id
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <span>{mode.emoji}</span>
                          <span>{mode.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* ── Animation Library ── */}
          <Section title="Biblioteca" icon={<Bookmark size={13} className="text-amber-400" />}>
            <AnimationLibrary />
          </Section>
        </div>
      )}
    </div>
  );
}
