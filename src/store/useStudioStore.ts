import { create } from 'zustand';
import type { Frame, Stroke, AudioClip, Point, StickmanInstance, TextItem, ShapeItem, ShapeKind, SavedAnimation, AspectRatio, StickmanJoint, PixelCharInstance, PixelPartId } from '../types/studio';
import type { RenderMode } from '../data/bgPresets';
import { BG_PRESETS } from '../data/bgPresets';
import { findStrokeAtPoint } from '../engine/geometry';
import { renderFrameToThumbnail } from '../engine/render';

const genId = () => crypto.randomUUID();
const THUMB_W = 192;
const THUMB_H = 108;
const DEFAULT_DURATION = 800;
const DEFAULT_BG = BG_PRESETS[0].color;

function makeEmptyFrame(bgColor = DEFAULT_BG, renderMode: RenderMode = '2d'): Frame {
  const frame: Frame = {
    id: genId(),
    strokes: [],
    stickmen: [],
    pixelChars: [],
    texts: [],
    shapes: [],
    durationMs: DEFAULT_DURATION,
    thumbnailDataUrl: '',
    bgColor,
    renderMode,
  };
  frame.thumbnailDataUrl = renderFrameToThumbnail(frame, THUMB_W, THUMB_H);
  return frame;
}

interface Snapshot {
  frames: Frame[];
  clips: AudioClip[];
}

interface StudioState {
  project: { frames: Frame[]; clips: AudioClip[]; canvasSize: { width: number; height: number } };
  activeFrameId: string;
  selectedTool: 'pen' | 'eraser' | 'text' | 'shape';
  color: string;
  brushWidth: number;
  currentTimeMs: number;
  speed: number;
  bgColor: string;
  renderMode: RenderMode;
  activeShapeKind: ShapeKind;
  textFontFamily: string;
  textFontSize: number;
  textBold: boolean;
  textItalic: boolean;
  aspectRatio: AspectRatio;
  canvasZoom: number;
  canvasPanX: number;
  canvasPanY: number;
  selectedId: string | null;
  savedAnimations: SavedAnimation[];
  past: Snapshot[];
  future: Snapshot[];

  addFrame: () => void;
  duplicateFrame: (id: string) => void;
  removeFrame: (id: string) => void;
  reorderFrames: (from: number, to: number) => void;
  selectFrame: (id: string) => void;
  setFrameDuration: (id: string, ms: number) => void;
  addStroke: (stroke: Stroke) => void;
  eraseAt: (point: Point, tolerance: number) => boolean;
  setThumbnail: (id: string, dataUrl: string) => void;
  clearFrame: (id: string) => void;
  addClip: (clip: AudioClip) => void;
  updateClip: (id: string, updates: Partial<AudioClip>) => void;
  removeClip: (id: string) => void;
  undo: () => void;
  redo: () => void;
  setCurrentTime: (ms: number) => void;
  setTool: (t: 'pen' | 'eraser' | 'text' | 'shape') => void;
  setColor: (c: string) => void;
  setBrushWidth: (w: number) => void;
  setSpeed: (s: number) => void;
  setBgColor: (c: string) => void;
  setRenderMode: (m: RenderMode) => void;
  setActiveShapeKind: (k: ShapeKind) => void;
  setTextFont: (f: string) => void;
  setTextFontSize: (s: number) => void;
  setTextBold: (b: boolean) => void;
  setTextItalic: (i: boolean) => void;
  setAspectRatio: (r: AspectRatio) => void;
  setCanvasZoom: (z: number) => void;
  setCanvasPan: (x: number, y: number) => void;
  setSelectedId: (id: string | null) => void;
  addStickman: (templateId: string, poseIndex?: number) => void;
  updateStickman: (id: string, updates: Partial<StickmanInstance>) => void;
  setStickmanJoint: (stickmanId: string, joint: StickmanJoint, point: Point) => void;
  toggleStickmanGuide: (id: string) => void;
  removeStickman: (id: string) => void;
  setStickmanPose: (id: string, poseIndex: number) => void;
  addPixelChar: (templateId: string, poseIndex?: number) => void;
  updatePixelChar: (id: string, updates: Partial<PixelCharInstance>) => void;
  setPixelCharJoint: (charId: string, joint: StickmanJoint, point: Point) => void;
  setPixelCharPartColor: (charId: string, partId: PixelPartId, color: string) => void;
  togglePixelCharPart: (charId: string, partId: PixelPartId) => void;
  togglePixelCharGuide: (id: string) => void;
  removePixelChar: (id: string) => void;
  setPixelCharPose: (id: string, poseIndex: number) => void;
  addTextItem: (item: TextItem) => void;
  updateTextItem: (id: string, updates: Partial<TextItem>) => void;
  removeTextItem: (id: string) => void;
  addShapeItem: (kind: ShapeKind) => void;
  updateShapeItem: (id: string, updates: Partial<ShapeItem>) => void;
  removeShapeItem: (id: string) => void;
  saveAnimation: (name: string, emoji: string) => void;
  loadAnimation: (id: string) => void;
  removeSavedAnimation: (id: string) => void;
}

function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map((f) => ({
    ...f,
    strokes: f.strokes.map((s) => ({ ...s, points: [...s.points] })),
    stickmen: f.stickmen.map((s) => ({ ...s, jointOverrides: { ...s.jointOverrides } })),
    pixelChars: f.pixelChars.map((p) => ({ ...p, partColors: { ...p.partColors }, partSizes: { ...p.partSizes }, visibleParts: [...p.visibleParts], jointOverrides: { ...p.jointOverrides } })),
    texts: f.texts.map((t) => ({ ...t })),
    shapes: f.shapes.map((s) => ({ ...s })),
  }));
}

function cloneProject(state: StudioState): Snapshot {
  return {
    frames: cloneFrames(state.project.frames),
    clips: state.project.clips.map((c) => ({ ...c })),
  };
}

export const useStudioStore = create<StudioState>((set, get) => {
  const initialFrame = makeEmptyFrame();

  return {
    project: {
      frames: [initialFrame],
      clips: [],
      canvasSize: { width: 1280, height: 720 },
    },
    activeFrameId: initialFrame.id,
    selectedTool: 'pen',
    color: '#000000',
    brushWidth: 4,
    currentTimeMs: 0,
    speed: 1,
    bgColor: DEFAULT_BG,
    renderMode: '2d',
    activeShapeKind: 'rect',
    textFontFamily: 'Arial',
    textFontSize: 32,
    textBold: false,
    textItalic: false,
    aspectRatio: '16:9',
    canvasZoom: 1,
    canvasPanX: 0,
    canvasPanY: 0,
    selectedId: null,
    savedAnimations: [],
    past: [],
    future: [],

    addFrame: () =>
      set((s) => {
        const snapshot = cloneProject(s);
        const idx = s.project.frames.findIndex((f) => f.id === s.activeFrameId);
        const newFrame = makeEmptyFrame(s.bgColor, s.renderMode);
        const newFrames = [...s.project.frames];
        newFrames.splice(idx + 1, 0, newFrame);
        return {
          project: { ...s.project, frames: newFrames },
          activeFrameId: newFrame.id,
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    duplicateFrame: (id) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const idx = s.project.frames.findIndex((f) => f.id === id);
        if (idx < 0) return {};
        const src = s.project.frames[idx];
        const dup: Frame = {
          ...src,
          id: genId(),
          strokes: src.strokes.map((st) => ({ ...st, points: [...st.points] })),
          stickmen: src.stickmen.map((st) => ({ ...st })),
          texts: src.texts.map((t) => ({ ...t })),
          shapes: src.shapes.map((sh) => ({ ...sh })),
        };
        const newFrames = [...s.project.frames];
        newFrames.splice(idx + 1, 0, dup);
        return {
          project: { ...s.project, frames: newFrames },
          activeFrameId: dup.id,
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    removeFrame: (id) =>
      set((s) => {
        if (s.project.frames.length <= 1) return {};
        const snapshot = cloneProject(s);
        const idx = s.project.frames.findIndex((f) => f.id === id);
        if (idx < 0) return {};
        const newFrames = s.project.frames.filter((f) => f.id !== id);
        const newActive = s.activeFrameId === id
          ? newFrames[Math.min(idx, newFrames.length - 1)].id
          : s.activeFrameId;
        return {
          project: { ...s.project, frames: newFrames },
          activeFrameId: newActive,
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    reorderFrames: (from, to) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const arr = [...s.project.frames];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        return {
          project: { ...s.project, frames: arr },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    selectFrame: (id) =>
      set((s) => {
        const frame = s.project.frames.find((f) => f.id === id);
        return {
          activeFrameId: id,
          bgColor: frame?.bgColor ?? s.bgColor,
          renderMode: frame?.renderMode ?? s.renderMode,
        };
      }),

    setFrameDuration: (id, ms) =>
      set((s) => ({
        project: {
          ...s.project,
          frames: s.project.frames.map((f) => f.id === id ? { ...f, durationMs: ms } : f),
        },
      })),

    addStroke: (stroke) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId ? { ...f, strokes: [...f.strokes, stroke] } : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    eraseAt: (point, tolerance) => {
      const s = get();
      const frame = s.project.frames.find((f) => f.id === s.activeFrameId);
      if (!frame) return false;
      const hit = findStrokeAtPoint(frame.strokes, point, tolerance);
      if (!hit) return false;
      const snapshot = cloneProject(s);
      const frames = s.project.frames.map((f) =>
        f.id === s.activeFrameId
          ? { ...f, strokes: f.strokes.filter((st) => st.id !== hit.id) }
          : f,
      );
      set({
        project: { ...s.project, frames },
        past: [...s.past, snapshot].slice(-50),
        future: [],
      });
      return true;
    },

    setThumbnail: (id, dataUrl) =>
      set((s) => ({
        project: {
          ...s.project,
          frames: s.project.frames.map((f) => f.id === id ? { ...f, thumbnailDataUrl: dataUrl } : f),
        },
      })),

    clearFrame: (id) =>
      set((s) => {
        const snapshot = cloneProject(s);
        return {
          project: {
            ...s.project,
            frames: s.project.frames.map((f) => f.id === id ? { ...f, strokes: [], stickmen: [], texts: [], shapes: [] } : f),
          },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    addClip: (clip) =>
      set((s) => ({
        project: { ...s.project, clips: [...s.project.clips, clip] },
      })),

    updateClip: (id, updates) =>
      set((s) => ({
        project: {
          ...s.project,
          clips: s.project.clips.map((c) => c.id === id ? { ...c, ...updates } : c),
        },
      })),

    removeClip: (id) =>
      set((s) => ({
        project: { ...s.project, clips: s.project.clips.filter((c) => c.id !== id) },
      })),

    undo: () =>
      set((s) => {
        if (s.past.length === 0) return {};
        const prev = s.past[s.past.length - 1];
        const current = cloneProject(s);
        return {
          project: { ...s.project, frames: prev.frames, clips: prev.clips },
          past: s.past.slice(0, -1),
          future: [current, ...s.future].slice(0, 50),
        };
      }),

    redo: () =>
      set((s) => {
        if (s.future.length === 0) return {};
        const next = s.future[0];
        const current = cloneProject(s);
        return {
          project: { ...s.project, frames: next.frames, clips: next.clips },
          past: [...s.past, current].slice(0, 50),
          future: s.future.slice(1),
        };
      }),

    setTool: (t) => set({ selectedTool: t }),
    setColor: (c) => set({ color: c }),
    setBrushWidth: (w) => set({ brushWidth: w }),
    setCurrentTime: (ms) => set({ currentTimeMs: ms }),
    setSpeed: (speed) => set({ speed }),
    setActiveShapeKind: (k) => set({ activeShapeKind: k }),
    setTextFont: (f) => set({ textFontFamily: f }),
    setTextFontSize: (s) => set({ textFontSize: s }),
    setTextBold: (b) => set({ textBold: b }),
    setTextItalic: (i) => set({ textItalic: i }),
    setAspectRatio: (r) => set({ aspectRatio: r }),
    setCanvasZoom: (z) => set({ canvasZoom: Math.max(0.25, Math.min(5, z)) }),
    setCanvasPan: (x, y) => set({ canvasPanX: x, canvasPanY: y }),
    setSelectedId: (id) => set({ selectedId: id }),

    setBgColor: (c) =>
      set((s) => ({
        bgColor: c,
        project: {
          ...s.project,
          frames: s.project.frames.map((f) =>
            f.id === s.activeFrameId ? { ...f, bgColor: c } : f,
          ),
        },
      })),

    setRenderMode: (m) =>
      set((s) => ({
        renderMode: m,
        project: {
          ...s.project,
          frames: s.project.frames.map((f) =>
            f.id === s.activeFrameId ? { ...f, renderMode: m } : f,
          ),
        },
      })),

    // ── STICKMAN ──
    addStickman: (templateId, poseIndex = 0) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const inst: StickmanInstance = {
          id: genId(),
          templateId,
          x: 640,
          y: 400,
          scale: 1.5,
          rotation: 0,
          currentPoseIndex: poseIndex,
          color: s.color,
          width: s.brushWidth,
          jointOverrides: {},
          isGuide: false,
        };
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId ? { ...f, stickmen: [...f.stickmen, inst] } : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    updateStickman: (id, updates) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, stickmen: f.stickmen.map((st) => st.id === id ? { ...st, ...updates } : st) }
            : f,
        );
        return { project: { ...s.project, frames } };
      }),

    removeStickman: (id) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, stickmen: f.stickmen.filter((st) => st.id !== id) }
            : f,
        );
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    setStickmanJoint: (stickmanId, joint, point) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? {
                ...f,
                stickmen: f.stickmen.map((st) =>
                  st.id === stickmanId
                    ? { ...st, jointOverrides: { ...st.jointOverrides, [joint]: point } }
                    : st,
                ),
              }
            : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return { project: { ...s.project, frames } };
      }),

    setStickmanPose: (id, poseIndex) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, stickmen: f.stickmen.map((st) => st.id === id ? { ...st, currentPoseIndex: poseIndex } : st) }
            : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return { project: { ...s.project, frames } };
      }),

    toggleStickmanGuide: (id) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, stickmen: f.stickmen.map((st) => st.id === id ? { ...st, isGuide: !st.isGuide } : st) }
            : f,
        );
        return { project: { ...s.project, frames } };
      }),

    // ── PIXEL CHARACTERS ──
    addPixelChar: (templateId, poseIndex = 0) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const inst: PixelCharInstance = {
          id: genId(),
          templateId,
          x: 640,
          y: 400,
          scale: 1.5,
          rotation: 0,
          currentPoseIndex: poseIndex,
          partColors: {},
          partSizes: {},
          visibleParts: ['head', 'body', 'lArmUpper', 'lArmLower', 'rArmUpper', 'rArmLower', 'lLegUpper', 'lLegLower', 'rLegUpper', 'rLegLower'],
          jointOverrides: {},
          isGuide: false,
        };
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId ? { ...f, pixelChars: [...f.pixelChars, inst] } : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    updatePixelChar: (id, updates) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, pixelChars: f.pixelChars.map((p) => p.id === id ? { ...p, ...updates } : p) }
            : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return { project: { ...s.project, frames } };
      }),

    setPixelCharJoint: (charId, joint, point) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? {
                ...f,
                pixelChars: f.pixelChars.map((p) =>
                  p.id === charId
                    ? { ...p, jointOverrides: { ...p.jointOverrides, [joint]: point } }
                    : p,
                ),
              }
            : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return { project: { ...s.project, frames } };
      }),

    setPixelCharPartColor: (charId, partId, color) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? {
                ...f,
                pixelChars: f.pixelChars.map((p) =>
                  p.id === charId
                    ? { ...p, partColors: { ...p.partColors, [partId]: color } }
                    : p,
                ),
              }
            : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return { project: { ...s.project, frames } };
      }),

    togglePixelCharPart: (charId, partId) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? {
                ...f,
                pixelChars: f.pixelChars.map((p) =>
                  p.id === charId
                    ? {
                        ...p,
                        visibleParts: p.visibleParts.includes(partId)
                          ? p.visibleParts.filter((v) => v !== partId)
                          : [...p.visibleParts, partId],
                      }
                    : p,
                ),
              }
            : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return { project: { ...s.project, frames } };
      }),

    togglePixelCharGuide: (id) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, pixelChars: f.pixelChars.map((p) => p.id === id ? { ...p, isGuide: !p.isGuide } : p) }
            : f,
        );
        return { project: { ...s.project, frames } };
      }),

    removePixelChar: (id) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, pixelChars: f.pixelChars.filter((p) => p.id !== id) }
            : f,
        );
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    setPixelCharPose: (id, poseIndex) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, pixelChars: f.pixelChars.map((p) => p.id === id ? { ...p, currentPoseIndex: poseIndex } : p) }
            : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return { project: { ...s.project, frames } };
      }),

    // ── TEXT ──
    addTextItem: (item) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId ? { ...f, texts: [...f.texts, item] } : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    updateTextItem: (id, updates) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, texts: f.texts.map((t) => t.id === id ? { ...t, ...updates } : t) }
            : f,
        );
        return { project: { ...s.project, frames } };
      }),

    removeTextItem: (id) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, texts: f.texts.filter((t) => t.id !== id) }
            : f,
        );
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    // ── SHAPES ──
    addShapeItem: (kind) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const shape: ShapeItem = {
          id: genId(),
          kind,
          x: 500,
          y: 280,
          width: 200,
          height: 200,
          fill: s.color,
          stroke: '#ffffff',
          strokeWidth: 2,
          rotation: 0,
        };
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId ? { ...f, shapes: [...f.shapes, shape] } : f,
        );
        const thumbFrame = frames.find((f) => f.id === s.activeFrameId)!;
        thumbFrame.thumbnailDataUrl = renderFrameToThumbnail(thumbFrame, THUMB_W, THUMB_H);
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    updateShapeItem: (id, updates) =>
      set((s) => {
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, shapes: f.shapes.map((sh) => sh.id === id ? { ...sh, ...updates } : sh) }
            : f,
        );
        return { project: { ...s.project, frames } };
      }),

    removeShapeItem: (id) =>
      set((s) => {
        const snapshot = cloneProject(s);
        const frames = s.project.frames.map((f) =>
          f.id === s.activeFrameId
            ? { ...f, shapes: f.shapes.filter((sh) => sh.id !== id) }
            : f,
        );
        return {
          project: { ...s.project, frames },
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    // ── ANIMATION LIBRARY ──
    saveAnimation: (name, emoji) =>
      set((s) => {
        const saved: SavedAnimation = {
          id: genId(),
          name,
          emoji,
          frames: cloneFrames(s.project.frames),
          createdAt: Date.now(),
        };
        return { savedAnimations: [...s.savedAnimations, saved] };
      }),

    loadAnimation: (id) =>
      set((s) => {
        const anim = s.savedAnimations.find((a) => a.id === id);
        if (!anim) return {};
        const snapshot = cloneProject(s);
        return {
          project: {
            ...s.project,
            frames: cloneFrames(anim.frames),
            clips: [],
          },
          activeFrameId: anim.frames[0]?.id ?? s.activeFrameId,
          past: [...s.past, snapshot].slice(-50),
          future: [],
        };
      }),

    removeSavedAnimation: (id) =>
      set((s) => ({
        savedAnimations: s.savedAnimations.filter((a) => a.id !== id),
      })),
  };
});
