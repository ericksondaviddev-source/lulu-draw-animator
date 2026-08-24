import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { renderFrame, renderStroke } from '../../engine/render';
import { useStudioStore } from '../../store/useStudioStore';
import { useDrawingEngine } from './useDrawingEngine';
import { STICKMAN_TEMPLATES } from '../../data/stickmanTemplates';
import { PIXEL_TEMPLATES } from '../../data/pixelTemplates';
import { ASPECT_RATIOS } from '../../types/studio';
import type { StickmanJoint } from '../../types/studio';

type DragTarget =
  | { type: 'stickman'; id: string; offsetX: number; offsetY: number }
  | { type: 'pixelChar'; id: string; offsetX: number; offsetY: number }
  | { type: 'text'; id: string; offsetX: number; offsetY: number }
  | { type: 'shape'; id: string; offsetX: number; offsetY: number }
  | { type: 'joint'; stickmanId: string; joint: StickmanJoint; charType: 'stickman' | 'pixelChar' }
  | { type: 'pan'; startX: number; startY: number; origPanX: number; origPanY: number }
  | null;

export default function DrawingCanvas({ viewFrameId }: { viewFrameId: string }) {
  const mainRef = useRef<HTMLCanvasElement>(null);
  const onionRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragTarget>(null);
  const selectedId = useStudioStore((s) => s.selectedId);
  const setSelectedId = useStudioStore((s) => s.setSelectedId);

  const frames = useStudioStore((s) => s.project.frames);
  const activeFrameId = useStudioStore((s) => s.activeFrameId);
  const selectedTool = useStudioStore((s) => s.selectedTool);
  const eraseAt = useStudioStore((s) => s.eraseAt);
  const updateStickman = useStudioStore((s) => s.updateStickman);
  const removeStickman = useStudioStore((s) => s.removeStickman);
  const setStickmanJoint = useStudioStore((s) => s.setStickmanJoint);
  const updatePixelChar = useStudioStore((s) => s.updatePixelChar);
  const removePixelChar = useStudioStore((s) => s.removePixelChar);
  const setPixelCharJoint = useStudioStore((s) => s.setPixelCharJoint);
  const updateTextItem = useStudioStore((s) => s.updateTextItem);
  const removeTextItem = useStudioStore((s) => s.removeTextItem);
  const updateShapeItem = useStudioStore((s) => s.updateShapeItem);
  const removeShapeItem = useStudioStore((s) => s.removeShapeItem);
  const addTextItem = useStudioStore((s) => s.addTextItem);
  const textFontFamily = useStudioStore((s) => s.textFontFamily);
  const textFontSize = useStudioStore((s) => s.textFontSize);
  const textBold = useStudioStore((s) => s.textBold);
  const textItalic = useStudioStore((s) => s.textItalic);
  const color = useStudioStore((s) => s.color);
  const aspectRatio = useStudioStore((s) => s.aspectRatio);
  const canvasZoom = useStudioStore((s) => s.canvasZoom);
  const canvasPanX = useStudioStore((s) => s.canvasPanX);
  const canvasPanY = useStudioStore((s) => s.canvasPanY);
  const setCanvasZoom = useStudioStore((s) => s.setCanvasZoom);
  const setCanvasPan = useStudioStore((s) => s.setCanvasPan);

  const ar = ASPECT_RATIOS.find((a) => a.id === aspectRatio) ?? ASPECT_RATIOS[0];
  const LOGICAL_W = ar.width;
  const LOGICAL_H = ar.height;

  const {
    liveStroke,
    startStroke,
    continueStroke,
    commitStroke,
  } = useDrawingEngine();

  const activeFrame = useMemo(
    () => frames.find((f) => f.id === activeFrameId),
    [frames, activeFrameId],
  );
  const viewFrame = useMemo(
    () => frames.find((f) => f.id === viewFrameId) ?? activeFrame,
    [frames, viewFrameId, activeFrame],
  );
  const activeIdx = frames.findIndex((f) => f.id === activeFrameId);
  const prevFrame = activeIdx > 0 ? frames[activeIdx - 1] : null;

  const mapPointer = useCallback(
    (e: React.PointerEvent): { x: number; y: number } => {
      const rect = containerRef.current!.getBoundingClientRect();
      const containerW = rect.width;
      const containerH = rect.height;
      const scaleX = containerW / LOGICAL_W;
      const scaleY = containerH / LOGICAL_H;
      const baseScale = Math.min(scaleX, scaleY);
      const effectiveScale = baseScale * canvasZoom;
      const renderW = LOGICAL_W * effectiveScale;
      const renderH = LOGICAL_H * effectiveScale;
      const offsetX = (containerW - renderW) / 2 + canvasPanX;
      const offsetY = (containerH - renderH) / 2 + canvasPanY;
      return {
        x: (e.clientX - rect.left - offsetX) / effectiveScale,
        y: (e.clientY - rect.top - offsetY) / effectiveScale,
      };
    },
    [LOGICAL_W, LOGICAL_H, canvasZoom, canvasPanX, canvasPanY],
  );

  // Hit test stickmen
  const hitTestStickman = useCallback(
    (p: { x: number; y: number }) => {
      if (!viewFrame) return null;
      for (const s of [...viewFrame.stickmen].reverse()) {
        const tpl = STICKMAN_TEMPLATES.find((t) => t.id === s.templateId);
        if (!tpl) continue;
        const pose = tpl.poses[s.currentPoseIndex % tpl.poses.length];
        if (!pose) continue;
        const joints = { ...pose.joints };
        if (s.jointOverrides) {
          for (const [k, v] of Object.entries(s.jointOverrides)) {
            if (v) joints[k as keyof typeof joints] = v;
          }
        }
        const xs = Object.values(joints).map((j) => j.x * s.scale + s.x);
        const ys = Object.values(joints).map((j) => j.y * s.scale + s.y);
        const minX = Math.min(...xs) - 20;
        const maxX = Math.max(...xs) + 20;
        const minY = Math.min(...ys) - 20;
        const maxY = Math.max(...ys) + 20;
        if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
          return { id: s.id, offsetX: p.x - s.x, offsetY: p.y - s.y };
        }
      }
      return null;
    },
    [viewFrame],
  );

  // Hit test pixel characters
  const hitTestPixelChar = useCallback(
    (p: { x: number; y: number }) => {
      if (!viewFrame) return null;
      for (const pc of [...(viewFrame.pixelChars ?? [])].reverse()) {
        const tpl = PIXEL_TEMPLATES.find((t) => t.id === pc.templateId);
        if (!tpl) continue;
        const pose = tpl.poses[pc.currentPoseIndex % tpl.poses.length];
        if (!pose) continue;
        const joints = { ...pose.joints };
        if (pc.jointOverrides) {
          for (const [k, v] of Object.entries(pc.jointOverrides)) {
            if (v) joints[k as keyof typeof joints] = v;
          }
        }
        const xs = Object.values(joints).map((j) => j.x * pc.scale + pc.x);
        const ys = Object.values(joints).map((j) => j.y * pc.scale + pc.y);
        const minX = Math.min(...xs) - 20;
        const maxX = Math.max(...xs) + 20;
        const minY = Math.min(...ys) - 30;
        const maxY = Math.max(...ys) + 20;
        if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
          return { id: pc.id, offsetX: p.x - pc.x, offsetY: p.y - pc.y };
        }
      }
      return null;
    },
    [viewFrame],
  );

  // Hit test joint dots (when stickman or pixelChar is selected)
  const hitTestJoint = useCallback(
    (p: { x: number; y: number }) => {
      if (!viewFrame || !selectedId) return null;

      // Check stickman joints
      const stick = viewFrame.stickmen?.find((s) => s.id === selectedId);
      if (stick) {
        const tpl = STICKMAN_TEMPLATES.find((t) => t.id === stick.templateId);
        if (tpl) {
          const pose = tpl.poses[stick.currentPoseIndex % tpl.poses.length];
          if (pose) {
            const joints = { ...pose.joints };
            if (stick.jointOverrides) {
              for (const [k, v] of Object.entries(stick.jointOverrides)) {
                if (v) joints[k as keyof typeof joints] = v;
              }
            }
            const JOINT_RADIUS = 8 / canvasZoom;
            for (const [key, jp] of Object.entries(joints)) {
              const jx = jp.x * stick.scale + stick.x;
              const jy = jp.y * stick.scale + stick.y;
              if (Math.hypot(p.x - jx, p.y - jy) <= JOINT_RADIUS) {
                return { stickmanId: stick.id, joint: key as StickmanJoint, charType: 'stickman' as const };
              }
            }
          }
        }
      }

      // Check pixelChar joints
      const pc = viewFrame.pixelChars?.find((c) => c.id === selectedId);
      if (pc) {
        const tpl = PIXEL_TEMPLATES.find((t) => t.id === pc.templateId);
        if (tpl) {
          const pose = tpl.poses[pc.currentPoseIndex % tpl.poses.length];
          if (pose) {
            const joints = { ...pose.joints };
            if (pc.jointOverrides) {
              for (const [k, v] of Object.entries(pc.jointOverrides)) {
                if (v) joints[k as keyof typeof joints] = v;
              }
            }
            const JOINT_RADIUS = 8 / canvasZoom;
            for (const [key, jp] of Object.entries(joints)) {
              const jx = jp.x * pc.scale + pc.x;
              const jy = jp.y * pc.scale + pc.y;
              if (Math.hypot(p.x - jx, p.y - jy) <= JOINT_RADIUS) {
                return { stickmanId: pc.id, joint: key as StickmanJoint, charType: 'pixelChar' as const };
              }
            }
          }
        }
      }

      return null;
    },
    [viewFrame, selectedId, canvasZoom],
  );

  // Hit test texts
  const hitTestText = useCallback(
    (p: { x: number; y: number }) => {
      if (!viewFrame) return null;
      for (const t of [...viewFrame.texts].reverse()) {
        const w = t.text.length * t.fontSize * 0.6;
        const h = t.fontSize * 1.2;
        if (p.x >= t.x && p.x <= t.x + w && p.y >= t.y && p.y <= t.y + h) {
          return { id: t.id, offsetX: p.x - t.x, offsetY: p.y - t.y };
        }
      }
      return null;
    },
    [viewFrame],
  );

  // Hit test shapes
  const hitTestShape = useCallback(
    (p: { x: number; y: number }) => {
      if (!viewFrame) return null;
      for (const sh of [...viewFrame.shapes].reverse()) {
        if (p.x >= sh.x && p.x <= sh.x + sh.width && p.y >= sh.y && p.y <= sh.y + sh.height) {
          return { id: sh.id, offsetX: p.x - sh.x, offsetY: p.y - sh.y };
        }
      }
      return null;
    },
    [viewFrame],
  );

  // Scroll wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        setCanvasZoom(canvasZoom + delta);
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [canvasZoom, setCanvasZoom]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const p = mapPointer(e);

      // Middle mouse = pan
      if (e.button === 1) {
        e.preventDefault();
        setDrag({ type: 'pan', startX: e.clientX, startY: e.clientY, origPanX: canvasPanX, origPanY: canvasPanY });
        return;
      }

      if (selectedTool === 'eraser') {
        eraseAt(p, 10);
        return;
      }

      if (selectedTool === 'text') {
        const item = {
          id: crypto.randomUUID(),
          text: 'Texto',
          x: p.x,
          y: p.y,
          fontSize: textFontSize,
          fontFamily: textFontFamily,
          color,
          bold: textBold,
          italic: textItalic,
        };
        addTextItem(item);
        return;
      }

      if (selectedTool === 'pen') {
        // Check joint editing first
        const jointHit = hitTestJoint(p);
        if (jointHit) {
          setDrag({ type: 'joint', stickmanId: jointHit.stickmanId, joint: jointHit.joint, charType: jointHit.charType });
          return;
        }

        const pixelCharHit = hitTestPixelChar(p);
        if (pixelCharHit) {
          setDrag({ type: 'pixelChar', id: pixelCharHit.id, offsetX: pixelCharHit.offsetX, offsetY: pixelCharHit.offsetY });
          setSelectedId(pixelCharHit.id);
          return;
        }

        const stickmanHit = hitTestStickman(p);
        if (stickmanHit) {
          setDrag({ type: 'stickman', id: stickmanHit.id, offsetX: stickmanHit.offsetX, offsetY: stickmanHit.offsetY });
          setSelectedId(stickmanHit.id);
          return;
        }
        const textHit = hitTestText(p);
        if (textHit) {
          setDrag({ type: 'text', id: textHit.id, offsetX: textHit.offsetX, offsetY: textHit.offsetY });
          setSelectedId(textHit.id);
          return;
        }
        const shapeHit = hitTestShape(p);
        if (shapeHit) {
          setDrag({ type: 'shape', id: shapeHit.id, offsetX: shapeHit.offsetX, offsetY: shapeHit.offsetY });
          setSelectedId(shapeHit.id);
          return;
        }
      }

      setSelectedId(null);
      if (selectedTool === 'pen') {
        startStroke(p);
      }
    },
    [mapPointer, selectedTool, eraseAt, startStroke, hitTestStickman, hitTestPixelChar, hitTestText, hitTestShape, hitTestJoint, textFontSize, textFontFamily, textBold, textItalic, color, addTextItem, canvasPanX, canvasPanY],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const p = mapPointer(e);

      if (drag?.type === 'pan') {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        setCanvasPan(drag.origPanX + dx, drag.origPanY + dy);
        return;
      }

      if (drag?.type === 'joint') {
        if (drag.charType === 'stickman') {
          const stick = viewFrame?.stickmen?.find((s) => s.id === drag.stickmanId);
          if (stick) {
            const localX = (p.x - stick.x) / stick.scale;
            const localY = (p.y - stick.y) / stick.scale;
            setStickmanJoint(drag.stickmanId, drag.joint, { x: localX, y: localY });
          }
        } else {
          const pc = viewFrame?.pixelChars?.find((c) => c.id === drag.stickmanId);
          if (pc) {
            const localX = (p.x - pc.x) / pc.scale;
            const localY = (p.y - pc.y) / pc.scale;
            setPixelCharJoint(drag.stickmanId, drag.joint, { x: localX, y: localY });
          }
        }
        return;
      }

      if (drag?.type === 'stickman') {
        updateStickman(drag.id, { x: p.x - drag.offsetX, y: p.y - drag.offsetY });
        return;
      }
      if (drag?.type === 'pixelChar') {
        updatePixelChar(drag.id, { x: p.x - drag.offsetX, y: p.y - drag.offsetY });
        return;
      }
      if (drag?.type === 'text') {
        updateTextItem(drag.id, { x: p.x - drag.offsetX, y: p.y - drag.offsetY });
        return;
      }
      if (drag?.type === 'shape') {
        updateShapeItem(drag.id, { x: p.x - drag.offsetX, y: p.y - drag.offsetY });
        return;
      }

      if (e.buttons === 0) return;
      if (selectedTool === 'pen' && !drag) {
        continueStroke(p);
      }
    },
    [mapPointer, drag, selectedTool, continueStroke, updateStickman, updatePixelChar, updateTextItem, updateShapeItem, setStickmanJoint, setPixelCharJoint, setCanvasPan, viewFrame],
  );

  const handlePointerUp = useCallback(() => {
    if (!drag) {
      commitStroke();
    }
    setDrag(null);
  }, [drag, commitStroke]);

  // Keyboard delete for selected elements
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        removeStickman(selectedId);
        removePixelChar(selectedId);
        removeTextItem(selectedId);
        removeShapeItem(selectedId);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, removeStickman, removePixelChar, removeTextItem, removeShapeItem]);

  // Render onion skin
  useEffect(() => {
    const ctx = onionRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    if (prevFrame) {
      ctx.globalAlpha = 0.25;
      renderFrame(ctx, prevFrame, LOGICAL_W, LOGICAL_H);
      ctx.globalAlpha = 1;
    }
  }, [prevFrame, LOGICAL_W, LOGICAL_H]);

  // Render main canvas
  useEffect(() => {
    const ctx = mainRef.current?.getContext('2d');
    if (!ctx || !viewFrame) return;
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    renderFrame(ctx, viewFrame, LOGICAL_W, LOGICAL_H);
    if (liveStroke) {
      renderStroke(ctx, liveStroke);
    }

    // Draw selection indicator + joint editing dots
    if (selectedId && viewFrame) {
      ctx.save();
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);

      const stick = viewFrame.stickmen?.find((s) => s.id === selectedId);
      if (stick) {
        const tpl = STICKMAN_TEMPLATES.find((t) => t.id === stick.templateId);
        if (tpl) {
          const pose = tpl.poses[stick.currentPoseIndex % tpl.poses.length];
          if (pose) {
            const joints = { ...pose.joints };
            if (stick.jointOverrides) {
              for (const [k, v] of Object.entries(stick.jointOverrides)) {
                if (v) joints[k as keyof typeof joints] = v;
              }
            }
            const xs = Object.values(joints).map((j) => j.x * stick.scale + stick.x);
            const ys = Object.values(joints).map((j) => j.y * stick.scale + stick.y);
            ctx.strokeRect(
              Math.min(...xs) - 15, Math.min(...ys) - 15,
              Math.max(...xs) - Math.min(...xs) + 30,
              Math.max(...ys) - Math.min(...ys) + 30,
            );
            ctx.setLineDash([]);
            for (const [key, jp] of Object.entries(joints)) {
              const jx = jp.x * stick.scale + stick.x;
              const jy = jp.y * stick.scale + stick.y;
              ctx.beginPath();
              ctx.arc(jx, jy, 5, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        }
      }

      const pc = viewFrame.pixelChars?.find((c) => c.id === selectedId);
      if (pc) {
        const tpl = PIXEL_TEMPLATES.find((t) => t.id === pc.templateId);
        if (tpl) {
          const pose = tpl.poses[pc.currentPoseIndex % tpl.poses.length];
          if (pose) {
            const joints = { ...pose.joints };
            if (pc.jointOverrides) {
              for (const [k, v] of Object.entries(pc.jointOverrides)) {
                if (v) joints[k as keyof typeof joints] = v;
              }
            }
            const xs = Object.values(joints).map((j) => j.x * pc.scale + pc.x);
            const ys = Object.values(joints).map((j) => j.y * pc.scale + pc.y);
            ctx.strokeRect(
              Math.min(...xs) - 15, Math.min(...ys) - 15,
              Math.max(...xs) - Math.min(...xs) + 30,
              Math.max(...ys) - Math.min(...ys) + 30,
            );
            ctx.setLineDash([]);
            for (const [key, jp] of Object.entries(joints)) {
              const jx = jp.x * pc.scale + pc.x;
              const jy = jp.y * pc.scale + pc.y;
              ctx.beginPath();
              ctx.arc(jx, jy, 5, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        }
      }

      const txt = viewFrame.texts?.find((t) => t.id === selectedId);
      if (txt) {
        const w = txt.text.length * txt.fontSize * 0.6;
        const h = txt.fontSize * 1.2;
        ctx.strokeRect(txt.x - 4, txt.y - 4, w + 8, h + 8);
      }

      const shp = viewFrame.shapes?.find((s) => s.id === selectedId);
      if (shp) {
        ctx.strokeRect(shp.x - 4, shp.y - 4, shp.width + 8, shp.height + 8);
      }

      ctx.restore();
    }
  }, [viewFrame, liveStroke, selectedId, LOGICAL_W, LOGICAL_H]);

  const bgColor = viewFrame?.bgColor ?? '#ffffff';

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[720px] h-[405px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: bgColor }} />
      </div>
      <div
        className="relative rounded-2xl shadow-2xl overflow-hidden border border-zinc-800"
        style={{
          width: `${LOGICAL_W}px`,
          height: `${LOGICAL_H}px`,
          maxWidth: '100%',
          maxHeight: '100%',
          transform: `scale(${canvasZoom}) translate(${canvasPanX / canvasZoom}px, ${canvasPanY / canvasZoom}px)`,
          transformOrigin: 'center center',
          backgroundColor: bgColor,
          cursor: drag?.type === 'pan' ? 'grabbing' : selectedTool === 'eraser' ? 'cell' : selectedTool === 'text' ? 'text' : 'crosshair',
        }}
      >
        <canvas ref={onionRef} width={LOGICAL_W} height={LOGICAL_H} className="absolute inset-0 w-full h-full pointer-events-none" />
        <canvas
          ref={mainRef}
          width={LOGICAL_W}
          height={LOGICAL_H}
          className="absolute inset-0 w-full h-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>

      {/* Zoom indicator */}
      {canvasZoom !== 1 && (
        <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-zinc-700 text-[11px] font-mono text-zinc-300">
          {Math.round(canvasZoom * 100)}%
        </div>
      )}
    </div>
  );
}
