import { useState } from 'react';
import { Type } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { FONT_FAMILIES } from '../../data/shapes';
import type { TextItem } from '../../types/studio';

const genId = () => crypto.randomUUID();

export default function TextPanel() {
  const [input, setInput] = useState('Hola');
  const color = useStudioStore((s) => s.color);
  const textFontFamily = useStudioStore((s) => s.textFontFamily);
  const textFontSize = useStudioStore((s) => s.textFontSize);
  const textBold = useStudioStore((s) => s.textBold);
  const textItalic = useStudioStore((s) => s.textItalic);
  const setTextFont = useStudioStore((s) => s.setTextFont);
  const setTextFontSize = useStudioStore((s) => s.setTextFontSize);
  const setTextBold = useStudioStore((s) => s.setTextBold);
  const setTextItalic = useStudioStore((s) => s.setTextItalic);
  const addTextItem = useStudioStore((s) => s.addTextItem);
  const setTool = useStudioStore((s) => s.setTool);

  const handleAdd = () => {
    if (!input.trim()) return;
    const item: TextItem = {
      id: genId(),
      text: input,
      x: 400,
      y: 300,
      fontSize: textFontSize,
      fontFamily: textFontFamily,
      color,
      bold: textBold,
      italic: textItalic,
    };
    addTextItem(item);
    setTool('text');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Type size={12} className="text-pink-400" />
        <span className="text-[10px] font-semibold text-zinc-300">Agregar Texto</span>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="Escribe tu texto..."
        className="w-full h-8 px-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
      />

      <div className="flex gap-1">
        <select
          value={textFontFamily}
          onChange={(e) => setTextFont(e.target.value)}
          className="flex-1 h-7 px-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <input
          type="number"
          value={textFontSize}
          onChange={(e) => setTextFontSize(parseInt(e.target.value) || 16)}
          min={8}
          max={200}
          className="w-14 h-7 px-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 text-center"
        />
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => setTextBold(!textBold)}
          className={`h-7 px-2 rounded-lg text-[10px] font-bold border transition-all ${
            textBold ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          B
        </button>
        <button
          onClick={() => setTextItalic(!textItalic)}
          className={`h-7 px-2 rounded-lg text-[10px] italic border transition-all ${
            textItalic ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          I
        </button>
      </div>

      <button
        onClick={handleAdd}
        className="h-8 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-500 transition-all"
      >
        Agregar al Frame
      </button>
    </div>
  );
}
