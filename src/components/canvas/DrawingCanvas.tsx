import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { renderFrame, renderStroke } from '../../engine/render';
import { useStudioStore } from '../../store/useStudioStore';
import { useDrawingEngine } from './useDrawingEngine';
import { STICKMAN_TEMPLATES } from '../../data/stickmanTemplates';
import { PIXEL_TEMPLATES } from '../../data/pixelTemplates';
import type { StickmanJoint } from '../../types/studio';

type DragTarget =
  | { type: 'stickman'; id: string; offsetX: number; offsetY: number }
  | { type: 'pixelChar'; id: string; offsetX: number; offsetY: number }
  | { type: 'text'; id: string; offsetX: number; offsetY: number }
  | { type: 'shape'; id: string; offsetX: number; offsetY: number }
  | { type: 'joint'; stickmanId: string; joint: StickmanJoint; charType: 'stickman' | 'pixelChar' }
  | null;

const LOGICAL_W = 1280;
const LOGICAL_H = 720;

export default function DrawingCanvas({ viewFrameId }: { viewFrameId: string }) {
  const mainRef = useRef<HTMLCanvasElement>(null);
  const onionRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragTarget>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  // Simple pointer mapping - no zoom, just fit to container
  const mapPointer = useCallback(
    (e: React.PointerEvent): { x: number; y: number } => {
      const rect = containerRef.current!.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * LOGICAL_W,
        y: ((e.clientY - rect.top) / rect.height) * LOGICAL_H,
      };
    },
    [],
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

  // Hit test joint dots
  const hitTestJoint = useCallback(
    (p: { x: number; y: number }) => {
      if (!viewFrame || !selectedId) return null;

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
            for (const [key, jp] of Object.entries(joints)) {
              const jx = jp.x * stick.scale + stick.x;
              const jy = jp.y * stick.scale + stick.y;
              if (Math.hypot(p.x - jx, p.y - jy) <= 12) {
                return { stickmanId: stick.id, joint: key as StickmanJoint, charType: 'stickman' as const };
              }
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
            for (const [key, jp] of Object.entries(joints)) {
              const jx = jp.x * pc.scale + pc.x;
              const jy = jp.y * pc.scale + pc.y;
              if (Math.hypot(p.x - jx, p.y - jy) <= 12) {
                return { stickmanId: pc.id, joint: key as StickmanJoint, charType: 'pixelChar' as const };
              }
            }
          }
        }
      }

      return null;
    },
    [viewFrame, selectedId],
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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const p = mapPointer(e);

      if (selectedTool === 'eraser') {
        eraseAt(p, 15);
        return;
      }

      if (selectedTool === 'text') {
        const item = {
          id: crypto.randomUUID(),
          text: 'Hola',
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
    [mapPointer, selectedTool, eraseAt, startStroke, hitTestStickman, hitTestPixelChar, hitTestText, hitTestShape, hitTestJoint, textFontSize, textFontFamily, textBold, textItalic, color, addTextItem],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const p = mapPointer(e);

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
    [mapPointer, drag, selectedTool, continueStroke, updateStickman, updatePixelChar, updateTextItem, updateShapeItem, setStickmanJoint, setPixelCharJoint, viewFrame],
  );

  const handlePointerUp = useCallback(() => {
    if (!drag) {
      commitStroke();
    }
    setDrag(null);
  }, [drag, commitStroke]);

  // Keyboard delete
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
  }, [prevFrame]);

  // Render main canvas
  useEffect(() => {
    const ctx = mainRef.current?.getContext('2d');
    if (!ctx || !viewFrame) return;
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    renderFrame(ctx, viewFrame, LOGICAL_W, LOGICAL_H);
    if (liveStroke) {
      renderStroke(ctx, liveStroke);
    }

    // Draw selection indicator + joint dots
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
            for (const [, jp] of Object.entries(joints)) {
              const jx = jp.x * stick.scale + stick.x;
              const jy = jp.y * stick.scale + stick.y;
              ctx.beginPath();
              ctx.arc(jx, jy, 6, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 2;
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
            for (const [, jp] of Object.entries(joints)) {
              const jx = jp.x * pc.scale + pc.x;
              const jy = jp.y * pc.scale + pc.y;
              ctx.beginPath();
              ctx.arc(jx, jy, 6, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 2;
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
  }, [viewFrame, liveStroke, selectedId]);

  const bgColor = viewFrame?.bgColor ?? '#ffffff';

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center justify-center overflow-hidden">
      <div
        className="relative w-full h-full"
        style={{
          backgroundColor: bgColor,
          cursor: selectedTool === 'eraser' ? 'cell' : selectedTool === 'text' ? 'text' : 'crosshair',
          touchAction: 'none',
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
    </div>
  );
}
