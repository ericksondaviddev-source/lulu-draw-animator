import type { RenderMode } from '../data/bgPresets';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}

export type StickmanJoint =
  | 'head' | 'neck' | 'torso'
  | 'lShoulder' | 'lElbow' | 'lHand'
  | 'rShoulder' | 'rElbow' | 'rHand'
  | 'hip' | 'lKnee' | 'lFoot'
  | 'rKnee' | 'rFoot';

export interface StickmanPose {
  name: string;
  emoji: string;
  joints: Record<StickmanJoint, Point>;
}

export interface StickmanTemplate {
  id: string;
  name: string;
  emoji: string;
  bones: [StickmanJoint, StickmanJoint][];
  poses: StickmanPose[];
}

export interface StickmanInstance {
  id: string;
  templateId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  currentPoseIndex: number;
  color: string;
  width: number;
  jointOverrides: Partial<Record<StickmanJoint, Point>>;
  isGuide: boolean;
}

// ── PIXEL CHARACTER SYSTEM ──

export type PixelPartId =
  | 'head' | 'body'
  | 'lArmUpper' | 'lArmLower'
  | 'rArmUpper' | 'rArmLower'
  | 'lLegUpper' | 'lLegLower'
  | 'rLegUpper' | 'rLegLower'
  | 'hat' | 'accessory';

export interface PixelPartDef {
  id: PixelPartId;
  label: string;
  joint: StickmanJoint;
  width: number;
  height: number;
  color: string;
  details?: string; // emoji or description for eyes, buttons, etc.
}

export interface PixelTemplate {
  id: string;
  name: string;
  emoji: string;
  parts: PixelPartDef[];
  bones: [StickmanJoint, StickmanJoint][];
  poses: StickmanPose[];
}

export interface PixelCharInstance {
  id: string;
  templateId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  currentPoseIndex: number;
  partColors: Partial<Record<PixelPartId, string>>;
  partSizes: Partial<Record<PixelPartId, { w: number; h: number }>>;
  visibleParts: PixelPartId[];
  jointOverrides: Partial<Record<StickmanJoint, Point>>;
  isGuide: boolean;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export interface AspectRatioOption {
  id: AspectRatio;
  label: string;
  emoji: string;
  width: number;
  height: number;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: '16:9', label: 'YouTube', emoji: '📺', width: 1280, height: 720 },
  { id: '9:16', label: 'TikTok', emoji: '📱', width: 720, height: 1280 },
  { id: '1:1', label: 'Cuadrado', emoji: '⬜', width: 1080, height: 1080 },
  { id: '4:3', label: 'Clásico', emoji: '🖥️', width: 1280, height: 960 },
  { id: '3:4', label: 'Retrato', emoji: '📋', width: 960, height: 1280 },
];

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
}

export type ShapeKind =
  | 'rect' | 'roundedRect' | 'circle' | 'ellipse'
  | 'triangle' | 'diamond' | 'pentagon' | 'hexagon'
  | 'star' | 'heart' | 'arrow' | 'cross'
  | 'cloud' | 'blob' | 'wave' | 'spiral';

export interface ShapeItem {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
}

export interface SavedAnimation {
  id: string;
  name: string;
  emoji: string;
  frames: Frame[];
  createdAt: number;
}

export interface Frame {
  id: string;
  strokes: Stroke[];
  stickmen: StickmanInstance[];
  pixelChars: PixelCharInstance[];
  texts: TextItem[];
  shapes: ShapeItem[];
  durationMs: number;
  thumbnailDataUrl: string;
  bgColor: string;
  renderMode: RenderMode;
}

export interface SoundEffect {
  id: string;
  name: string;
  emoji: string;
  durationMs: number;
}

export interface AudioClip {
  id: string;
  kind: 'voice' | 'sfx';
  name: string;
  startMs: number;
  durationMs: number;
  blobUrl?: string;
  sfxId?: string;
}

export interface ProjectState {
  frames: Frame[];
  clips: AudioClip[];
  canvasSize: { width: number; height: number };
}
