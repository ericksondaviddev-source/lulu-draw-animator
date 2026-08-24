import type { ShapeKind } from '../types/studio';

export interface ShapeOption {
  kind: ShapeKind;
  name: string;
  emoji: string;
  category: 'Básicas' | 'Estrellas' | 'Orgánicas';
}

export const SHAPE_OPTIONS: ShapeOption[] = [
  // Básicas
  { kind: 'rect', name: 'Rectángulo', emoji: '⬜', category: 'Básicas' },
  { kind: 'roundedRect', name: 'Redondeado', emoji: '🔳', category: 'Básicas' },
  { kind: 'circle', name: 'Círculo', emoji: '⭕', category: 'Básicas' },
  { kind: 'ellipse', name: 'Elipse', emoji: '🥚', category: 'Básicas' },
  { kind: 'triangle', name: 'Triángulo', emoji: '🔺', category: 'Básicas' },
  { kind: 'diamond', name: 'Diamante', emoji: '💎', category: 'Básicas' },
  { kind: 'pentagon', name: 'Pentágono', emoji: '⬠', category: 'Básicas' },
  { kind: 'hexagon', name: 'Hexágono', emoji: '⬡', category: 'Básicas' },
  // Estrellas
  { kind: 'star', name: 'Estrella', emoji: '⭐', category: 'Estrellas' },
  { kind: 'heart', name: 'Corazón', emoji: '❤️', category: 'Estrellas' },
  { kind: 'arrow', name: 'Flecha', emoji: '➡️', category: 'Estrellas' },
  { kind: 'cross', name: 'Cruz', emoji: '➕', category: 'Estrellas' },
  // Orgánicas
  { kind: 'cloud', name: 'Nube', emoji: '☁️', category: 'Orgánicas' },
  { kind: 'blob', name: 'Blob', emoji: '🫧', category: 'Orgánicas' },
  { kind: 'wave', name: 'Onda', emoji: '🌊', category: 'Orgánicas' },
  { kind: 'spiral', name: 'Espiral', emoji: '🌀', category: 'Orgánicas' },
];

export const FONT_FAMILIES = [
  'Arial',
  'Impact',
  'Courier New',
  'Georgia',
  'Comic Sans MS',
  'Trebuchet MS',
  'Verdana',
];
