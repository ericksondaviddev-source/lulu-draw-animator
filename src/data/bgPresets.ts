export interface BgPreset {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export const BG_PRESETS: BgPreset[] = [
  { id: 'white', name: 'Blanco', color: '#ffffff', emoji: '⬜' },
  { id: 'black', name: 'Negro', color: '#09090b', emoji: '⬛' },
  { id: 'blue', name: 'Azul', color: '#1e3a5f', emoji: '🔵' },
  { id: 'sky', name: 'Cielo', color: '#7dd3fc', emoji: '🌤️' },
  { id: 'pink', name: 'Rosa', color: '#fda4af', emoji: '🩷' },
  { id: 'red', name: 'Rojo', color: '#dc2626', emoji: '🔴' },
  { id: 'green', name: 'Verde', color: '#16a34a', emoji: '🟢' },
  { id: 'purple', name: 'Morado', color: '#7c3aed', emoji: '🟣' },
  { id: 'orange', name: 'Naranja', color: '#f97316', emoji: '🟠' },
  { id: 'yellow', name: 'Amarillo', color: '#facc15', emoji: '🟡' },
];

export type RenderMode = '2d' | '3d-solid' | '3d-smooth' | '3d-liquid' | '3d-gas' | '3d-shiny' | '2.5d';

export interface RenderModeOption {
  id: RenderMode;
  name: string;
  emoji: string;
  category: '2D' | '3D' | '2.5D';
}

export const RENDER_MODES: RenderModeOption[] = [
  { id: '2d', name: 'Normal', emoji: '✏️', category: '2D' },
  { id: '3d-solid', name: 'Sólida', emoji: '🧊', category: '3D' },
  { id: '3d-smooth', name: 'Suave', emoji: '🫧', category: '3D' },
  { id: '3d-liquid', name: 'Líquida', emoji: '💧', category: '3D' },
  { id: '3d-gas', name: 'Gaseosa', emoji: '🌫️', category: '3D' },
  { id: '3d-shiny', name: 'Brillante', emoji: '✨', category: '3D' },
  { id: '2.5d', name: 'Minecraft', emoji: '🟫', category: '2.5D' },
];
