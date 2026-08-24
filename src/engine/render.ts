import type { Stroke, Frame, StickmanInstance, PixelCharInstance, TextItem, ShapeItem } from '../types/studio';
import type { RenderMode } from '../data/bgPresets';
import { STICKMAN_TEMPLATES } from '../data/stickmanTemplates';
import { PIXEL_TEMPLATES } from '../data/pixelTemplates';
import { drawShape } from './shapeRenderer';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = frame.bgColor;
  ctx.fillRect(0, 0, width, height);

  const mode = frame.renderMode ?? '2d';

  // Draw shapes first (background layer)
  for (const shape of (frame.shapes ?? [])) {
    drawShape(ctx, shape, mode);
  }

  // Draw strokes
  if (mode === '2.5d') {
    renderFrame25D(ctx, frame);
  } else if (mode === '2d') {
    for (const stroke of frame.strokes) {
      renderStroke(ctx, stroke);
    }
  } else {
    for (const stroke of frame.strokes) {
      renderStroke3D(ctx, stroke, mode);
    }
  }

  // Draw stickmen
  for (const stickman of (frame.stickmen ?? [])) {
    renderStickman(ctx, stickman, mode);
  }

  // Draw pixel characters
  for (const pc of (frame.pixelChars ?? [])) {
    renderPixelChar(ctx, pc, mode);
  }

  // Draw texts
  for (const text of (frame.texts ?? [])) {
    renderText(ctx, text, mode);
  }
}

export function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const pts = stroke.points;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.stroke();
}

function buildStrokePath(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
}

// ─── STICKMAN RENDERER ───
function renderStickman(ctx: CanvasRenderingContext2D, inst: StickmanInstance, mode: RenderMode) {
  const tpl = STICKMAN_TEMPLATES.find((t) => t.id === inst.templateId);
  if (!tpl) return;

  const pose = tpl.poses[inst.currentPoseIndex % tpl.poses.length];
  if (!pose) return;

  ctx.save();
  ctx.translate(inst.x, inst.y);
  ctx.rotate((inst.rotation * Math.PI) / 180);
  ctx.scale(inst.scale, inst.scale);

  // Merge base pose with jointOverrides
  const joints = { ...pose.joints };
  if (inst.jointOverrides) {
    for (const [k, v] of Object.entries(inst.jointOverrides)) {
      if (v) joints[k as keyof typeof joints] = v;
    }
  }

  const lineW = inst.width;

  // 3D shadow layer
  if (mode !== '2d') {
    ctx.save();
    ctx.translate(3, 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = lineW + 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [a, b] of tpl.bones) {
      const pa = joints[a as keyof typeof joints];
      const pb = joints[b as keyof typeof joints];
      if (!pa || !pb) continue;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Main bones
  ctx.strokeStyle = inst.color;
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [a, b] of tpl.bones) {
    const pa = joints[a as keyof typeof joints];
    const pb = joints[b as keyof typeof joints];
    if (!pa || !pb) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  // Head circle
  const head = joints.head;
  if (head) {
    ctx.beginPath();
    ctx.arc(head.x, head.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = inst.color;
    ctx.fill();
    if (mode !== '2d') {
      // Head highlight
      ctx.beginPath();
      ctx.arc(head.x - 2, head.y - 3, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fill();
    }
  }

  // Joint dots
  ctx.fillStyle = inst.color;
  for (const key of Object.keys(joints) as (keyof typeof joints)[]) {
    if (key === 'head') continue;
    const p = joints[key];
    ctx.beginPath();
    ctx.arc(p.x, p.y, lineW * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2.5D depth for stickman
  if (mode === '2.5d') {
    ctx.globalAlpha = 0.3;
    ctx.translate(4, -3);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = lineW;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    for (const [a, b] of tpl.bones) {
      const pa = joints[a as keyof typeof joints];
      const pb = joints[b as keyof typeof joints];
      if (!pa || !pb) continue;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ─── TEXT RENDERER ───
function renderText(ctx: CanvasRenderingContext2D, item: TextItem, mode: RenderMode) {
  ctx.save();
  const font = `${item.italic ? 'italic ' : ''}${item.bold ? 'bold ' : ''}${item.fontSize}px ${item.fontFamily}`;
  ctx.font = font;
  ctx.textBaseline = 'top';

  // 3D shadow
  if (mode !== '2d') {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(item.text, item.x + 3, item.y + 3);
  }

  // 2.5D blocky shadow
  if (mode === '2.5d') {
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.3;
    for (let d = 6; d >= 1; d--) {
      ctx.fillText(item.text, item.x + d * 0.6, item.y + d * -0.4);
    }
    ctx.globalAlpha = 1;
  }

  // Main text
  ctx.fillStyle = item.color;
  ctx.fillText(item.text, item.x, item.y);

  // Highlight
  if (mode === '3d-shiny' || mode === '3d-smooth') {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(item.text, item.x - 1, item.y - 1);
  }

  ctx.restore();
}

// ─── 3D STROKE RENDERER ───
function renderStroke3D(ctx: CanvasRenderingContext2D, stroke: Stroke, mode: RenderMode) {
  if (stroke.points.length < 2) return;
  const pts = stroke.points;

  const buildPath = () => buildStrokePath(ctx, pts);

  switch (mode) {
    case '3d-solid': {
      // Multi-layer shadow
      ctx.save();
      for (let i = 3; i >= 1; i--) {
        ctx.beginPath();
        buildStrokePath(ctx, pts);
        ctx.strokeStyle = `rgba(0,0,0,${0.15 * i})`;
        ctx.lineWidth = stroke.width + i * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.translate(i * 1.5, i * 1.5);
        ctx.stroke();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.restore();

      // Main stroke with slight gradient
      const grad = ctx.createLinearGradient(
        pts[0].x, pts[0].y, pts[pts.length - 1].x, pts[pts.length - 1].y,
      );
      grad.addColorStop(0, stroke.color);
      grad.addColorStop(0.5, lightenColor(stroke.color, 0.15));
      grad.addColorStop(1, stroke.color);
      buildPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Highlight
      ctx.save();
      buildPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = Math.max(1, stroke.width * 0.25);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.translate(-1, -1);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case '3d-smooth': {
      // Outer glow
      ctx.save();
      buildPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width + 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.filter = 'blur(8px)';
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.restore();

      // Mid glow
      ctx.save();
      buildPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width + 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.filter = 'blur(3px)';
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.restore();

      // Main stroke
      buildPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Highlight
      ctx.save();
      buildPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = Math.max(1, stroke.width * 0.2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.translate(-1, -2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case '3d-liquid': {
      const t = performance.now() / 500;
      // Multiple liquid layers
      for (let pass = 0; pass < 5; pass++) {
        ctx.beginPath();
        const phase = t + pass * 1.5;
        const amp = 1.5 + pass * 0.8;
        const freq = 0.3 + pass * 0.1;
        const wave = Math.sin(phase) * amp;
        ctx.moveTo(pts[0].x + wave, pts[0].y + Math.cos(phase) * amp * 0.5);
        for (let i = 1; i < pts.length; i++) {
          const wx = Math.sin(phase + i * freq) * amp;
          const wy = Math.cos(phase + i * freq * 0.7) * amp * 0.5;
          ctx.lineTo(pts[i].x + wx, pts[i].y + wy + wave * 0.3);
        }
        const alpha = pass < 2 ? '33' : pass < 4 ? '55' : '88';
        ctx.strokeStyle = pass === 4 ? stroke.color : `${stroke.color}${alpha}`;
        ctx.lineWidth = pass === 4 ? stroke.width : stroke.width + pass * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      break;
    }

    case '3d-gas': {
      ctx.save();
      // Cloud layers
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const ox = (Math.random() - 0.5) * 8;
        const oy = (Math.random() - 0.5) * 8;
        ctx.moveTo(pts[0].x + ox, pts[0].y + oy);
        for (let j = 1; j < pts.length; j++) {
          ctx.lineTo(
            pts[j].x + (Math.random() - 0.5) * 12,
            pts[j].y + (Math.random() - 0.5) * 12,
          );
        }
        const a = Math.round(10 + (8 - i) * 3).toString(16).padStart(2, '0');
        ctx.strokeStyle = `${stroke.color}${a}`;
        ctx.lineWidth = stroke.width + 6 + i * 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      ctx.restore();

      // Core stroke (faint)
      buildPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(1, stroke.width * 0.4);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }

    case '3d-shiny': {
      const minX = Math.min(...pts.map((p) => p.x));
      const maxX = Math.max(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      const maxY = Math.max(...pts.map((p) => p.y));

      // Multi-stop gradient for chrome effect
      const grad = ctx.createLinearGradient(minX, minY, maxX, maxY);
      grad.addColorStop(0, darkenColor(stroke.color, 0.6));
      grad.addColorStop(0.15, darkenColor(stroke.color, 0.2));
      grad.addColorStop(0.3, lightenColor(stroke.color, 0.7));
      grad.addColorStop(0.45, '#ffffff');
      grad.addColorStop(0.55, lightenColor(stroke.color, 0.5));
      grad.addColorStop(0.7, darkenColor(stroke.color, 0.1));
      grad.addColorStop(0.85, lightenColor(stroke.color, 0.3));
      grad.addColorStop(1, darkenColor(stroke.color, 0.5));

      // Shadow
      ctx.save();
      buildPath();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = stroke.width + 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.translate(3, 3);
      ctx.stroke();
      ctx.restore();

      // Main chrome stroke
      buildPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Specular highlight
      ctx.save();
      buildPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = Math.max(1, stroke.width * 0.15);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.translate(-1, -2);
      ctx.stroke();
      ctx.restore();
      break;
    }
  }
}

// ─── PIXEL CHARACTER RENDERER ───
function renderPixelChar(ctx: CanvasRenderingContext2D, inst: PixelCharInstance, mode: RenderMode) {
  const tpl = PIXEL_TEMPLATES.find((t) => t.id === inst.templateId);
  if (!tpl) return;

  const pose = tpl.poses[inst.currentPoseIndex % tpl.poses.length];
  if (!pose) return;

  ctx.save();
  ctx.translate(inst.x, inst.y);
  ctx.rotate((inst.rotation * Math.PI) / 180);
  ctx.scale(inst.scale, inst.scale);

  // Merge base pose with jointOverrides
  const joints = { ...pose.joints };
  if (inst.jointOverrides) {
    for (const [k, v] of Object.entries(inst.jointOverrides)) {
      if (v) joints[k as keyof typeof joints] = v;
    }
  }

  const alpha = inst.isGuide ? 0.35 : 1;
  ctx.globalAlpha = alpha;

  // 3D shadow layer
  if (mode !== '2d' && !inst.isGuide) {
    ctx.save();
    ctx.translate(3, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (const part of tpl.parts) {
      if (!inst.visibleParts.includes(part.id)) continue;
      const jp = joints[part.joint];
      if (!jp) continue;
      const overrideColor = inst.partColors[part.id];
      const overrideSize = inst.partSizes[part.id];
      const pw = overrideSize?.w ?? part.width;
      const ph = overrideSize?.h ?? part.height;
      ctx.fillRect(jp.x - pw / 2, jp.y - ph / 2, pw, ph);
    }
    ctx.restore();
  }

  // Draw each body part
  for (const part of tpl.parts) {
    if (!inst.visibleParts.includes(part.id)) continue;
    const jp = joints[part.joint];
    if (!jp) continue;

    const overrideColor = inst.partColors[part.id];
    const overrideSize = inst.partSizes[part.id];
    const pw = overrideSize?.w ?? part.width;
    const ph = overrideSize?.h ?? part.height;
    const color = overrideColor ?? part.color;

    // Main part rectangle
    ctx.fillStyle = color;
    ctx.fillRect(jp.x - pw / 2, jp.y - ph / 2, pw, ph);

    // Pixel outline
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(jp.x - pw / 2, jp.y - ph / 2, pw, ph);

    // 3D highlight
    if (mode !== '2d' && !inst.isGuide) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(jp.x - pw / 2, jp.y - ph / 2, pw, 3);
    }

    // Draw details (eyes on head, buttons on body, etc.)
    if (part.details && part.id === 'head') {
      ctx.fillStyle = '#000';
      const eyeSpacing = pw * 0.25;
      const eyeY = jp.y - ph * 0.1;
      ctx.fillRect(jp.x - eyeSpacing - 2, eyeY, 4, 4);
      ctx.fillRect(jp.x + eyeSpacing - 2, eyeY, 4, 4);
      // Mouth
      ctx.fillRect(jp.x - 3, jp.y + ph * 0.15, 6, 2);
    }

    if (part.details && part.id === 'body') {
      // Buttons
      ctx.fillStyle = '#fff';
      ctx.fillRect(jp.x - 1.5, jp.y - 4, 3, 3);
      ctx.fillRect(jp.x - 1.5, jp.y + 2, 3, 3);
    }
  }

  // 2.5D depth
  if (mode === '2.5d' && !inst.isGuide) {
    ctx.globalAlpha = 0.2;
    ctx.translate(4, -3);
    ctx.fillStyle = '#000';
    for (const part of tpl.parts) {
      if (!inst.visibleParts.includes(part.id)) continue;
      const jp = joints[part.joint];
      if (!jp) continue;
      const overrideSize = inst.partSizes[part.id];
      const pw = overrideSize?.w ?? part.width;
      const ph = overrideSize?.h ?? part.height;
      ctx.fillRect(jp.x - pw / 2, jp.y - ph / 2, pw, ph);
    }
  }

  ctx.restore();
}

// ─── 2.5D RENDERER ───
function renderFrame25D(ctx: CanvasRenderingContext2D, frame: Frame) {
  const DEPTH = 8;
  const ANGLE_X = 0.6;
  const ANGLE_Y = -0.4;

  for (const stroke of frame.strokes) {
    if (stroke.points.length < 2) continue;
    const pts = stroke.points;

    // Bottom face (depth extrusion)
    for (let d = DEPTH; d >= 1; d--) {
      const t = d / DEPTH;
      const shade = Math.round(30 + t * 60);
      ctx.beginPath();
      ctx.moveTo(pts[0].x + d * ANGLE_X, pts[0].y + d * ANGLE_Y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(
          pts[i].x + d * ANGLE_X, pts[i].y + d * ANGLE_Y,
          mx + d * ANGLE_X, my + d * ANGLE_Y,
        );
      }
      ctx.lineTo(pts[pts.length - 1].x + d * ANGLE_X, pts[pts.length - 1].y + d * ANGLE_Y);
      ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
      ctx.lineWidth = stroke.width + 3;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      ctx.stroke();
    }

    // Side face (connect front to back)
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[0].x + DEPTH * ANGLE_X, pts[0].y + DEPTH * ANGLE_Y);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = stroke.width + 1;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.stroke();

    // Main face
    ctx.imageSmoothingEnabled = false;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);

    // Gradient on main face
    const grad = ctx.createLinearGradient(
      pts[0].x, pts[0].y,
      pts[pts.length - 1].x, pts[pts.length - 1].y,
    );
    grad.addColorStop(0, stroke.color);
    grad.addColorStop(0.5, lightenColor(stroke.color, 0.1));
    grad.addColorStop(1, stroke.color);
    ctx.strokeStyle = grad;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.stroke();

    // Top highlight
    ctx.beginPath();
    ctx.moveTo(pts[0].x - 1, pts[0].y - 1);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x - 1, pts[i].y - 1);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.stroke();
  }
}

// ─── COLOR UTILITIES ───
function darkenColor(hex: string, amount: number): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return `rgb(${Math.round(c.r * (1 - amount))},${Math.round(c.g * (1 - amount))},${Math.round(c.b * (1 - amount))})`;
}

function lightenColor(hex: string, amount: number): string {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return `rgb(${Math.min(255, Math.round(c.r + (255 - c.r) * amount))},${Math.min(255, Math.round(c.g + (255 - c.g) * amount))},${Math.min(255, Math.round(c.b + (255 - c.b) * amount))})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

export function renderFrameToThumbnail(
  frame: Frame,
  thumbW: number,
  thumbH: number,
  logicalW = 1280,
  logicalH = 720,
): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = thumbW;
    canvas.height = thumbH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const sx = thumbW / logicalW;
    const sy = thumbH / logicalH;
    ctx.fillStyle = frame.bgColor ?? '#fff';
    ctx.fillRect(0, 0, thumbW, thumbH);
    ctx.save();
    ctx.scale(sx, sy);
    renderFrame(ctx, frame, logicalW, logicalH);
    ctx.restore();
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}
