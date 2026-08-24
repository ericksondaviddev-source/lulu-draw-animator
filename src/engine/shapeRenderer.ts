import type { ShapeItem, ShapeKind } from '../types/studio';
import type { RenderMode } from '../data/bgPresets';

export function drawShape(ctx: CanvasRenderingContext2D, shape: ShapeItem, mode: RenderMode = '2d') {
  ctx.save();

  // 3D shadow
  if (mode !== '2d') {
    ctx.save();
    ctx.translate(shape.x + shape.width / 2 + 4, shape.y + shape.height / 2 + 4);
    ctx.rotate((shape.rotation * Math.PI) / 180);
    ctx.beginPath();
    buildShapePath(ctx, shape.kind, shape.width / 2, shape.height / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    ctx.restore();
  }

  // 2.5D depth extrusion
  if (mode === '2.5d') {
    const DEPTH = 6;
    for (let d = DEPTH; d >= 1; d--) {
      ctx.save();
      ctx.translate(
        shape.x + shape.width / 2 + d * 0.6,
        shape.y + shape.height / 2 + d * -0.4,
      );
      ctx.rotate((shape.rotation * Math.PI) / 180);
      ctx.beginPath();
      buildShapePath(ctx, shape.kind, shape.width / 2, shape.height / 2);
      const shade = Math.round(30 + (d / DEPTH) * 50);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2);
  ctx.rotate((shape.rotation * Math.PI) / 180);

  const hw = shape.width / 2;
  const hh = shape.height / 2;

  ctx.beginPath();
  buildShapePath(ctx, shape.kind, hw, hh);

  if (shape.fill && shape.fill !== 'transparent') {
    ctx.fillStyle = shape.fill;
    ctx.fill();
  }
  if (shape.strokeWidth > 0 && shape.stroke) {
    ctx.strokeStyle = shape.stroke;
    ctx.lineWidth = shape.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Highlight for shiny mode
  if (mode === '3d-shiny' || mode === '3d-smooth') {
    ctx.beginPath();
    buildShapePath(ctx, shape.kind, hw * 0.85, hh * 0.85);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function buildShapePath(ctx: CanvasRenderingContext2D, kind: ShapeKind, hw: number, hh: number) {
  switch (kind) {
    case 'rect':
      ctx.rect(-hw, -hh, hw * 2, hh * 2);
      break;

    case 'roundedRect': {
      const r = Math.min(hw, hh) * 0.25;
      ctx.moveTo(-hw + r, -hh);
      ctx.lineTo(hw - r, -hh);
      ctx.quadraticCurveTo(hw, -hh, hw, -hh + r);
      ctx.lineTo(hw, hh - r);
      ctx.quadraticCurveTo(hw, hh, hw - r, hh);
      ctx.lineTo(-hw + r, hh);
      ctx.quadraticCurveTo(-hw, hh, -hw, hh - r);
      ctx.lineTo(-hw, -hh + r);
      ctx.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      ctx.closePath();
      break;
    }

    case 'circle':
      ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
      break;

    case 'ellipse':
      ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
      break;

    case 'triangle':
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath();
      break;

    case 'diamond':
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, 0);
      ctx.lineTo(0, hh);
      ctx.lineTo(-hw, 0);
      ctx.closePath();
      break;

    case 'pentagon':
      drawPolygon(ctx, 5, hw, hh);
      break;

    case 'hexagon':
      drawPolygon(ctx, 6, hw, hh);
      break;

    case 'star':
      drawStar(ctx, 5, hw, hh, hw * 0.4);
      break;

    case 'heart':
      drawHeart(ctx, hw, hh);
      break;

    case 'arrow':
      drawArrow(ctx, hw, hh);
      break;

    case 'cross':
      drawCross(ctx, hw, hh);
      break;

    case 'cloud':
      drawCloud(ctx, hw, hh);
      break;

    case 'blob':
      drawBlob(ctx, hw, hh);
      break;

    case 'wave':
      drawWave(ctx, hw, hh);
      break;

    case 'spiral':
      drawSpiral(ctx, hw, hh);
      break;
  }
}

function drawPolygon(ctx: CanvasRenderingContext2D, sides: number, hw: number, hh: number) {
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = Math.cos(angle) * hw;
    const y = Math.sin(angle) * hh;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, points: number, outerR: number, outerH: number, innerR: number) {
  const innerH = innerR * (outerH / outerR);
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const h = i % 2 === 0 ? outerH : innerH;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawHeart(ctx: CanvasRenderingContext2D, hw: number, hh: number) {
  const topY = -hh * 0.6;
  ctx.moveTo(0, hh);
  ctx.bezierCurveTo(-hw * 1.5, hh * 0.3, -hw * 0.5, topY - hh * 0.4, 0, topY);
  ctx.bezierCurveTo(hw * 0.5, topY - hh * 0.4, hw * 1.5, hh * 0.3, 0, hh);
  ctx.closePath();
}

function drawArrow(ctx: CanvasRenderingContext2D, hw: number, hh: number) {
  ctx.moveTo(-hw * 0.3, -hh);
  ctx.lineTo(hw, 0);
  ctx.lineTo(-hw * 0.3, hh);
  ctx.lineTo(-hw * 0.3, hh * 0.3);
  ctx.lineTo(-hw, hh * 0.3);
  ctx.lineTo(-hw, -hh * 0.3);
  ctx.lineTo(-hw * 0.3, -hh * 0.3);
  ctx.closePath();
}

function drawCross(ctx: CanvasRenderingContext2D, hw: number, hh: number) {
  const t = 0.3;
  ctx.moveTo(-hw * t, -hh);
  ctx.lineTo(hw * t, -hh);
  ctx.lineTo(hw * t, -hh * t);
  ctx.lineTo(hw, -hh * t);
  ctx.lineTo(hw, hh * t);
  ctx.lineTo(hw * t, hh * t);
  ctx.lineTo(hw * t, hh);
  ctx.lineTo(-hw * t, hh);
  ctx.lineTo(-hw * t, hh * t);
  ctx.lineTo(-hw, hh * t);
  ctx.lineTo(-hw, -hh * t);
  ctx.lineTo(-hw * t, -hh * t);
  ctx.closePath();
}

function drawCloud(ctx: CanvasRenderingContext2D, hw: number, hh: number) {
  const bumps = [
    { x: -hw * 0.5, y: hh * 0.1, r: hw * 0.45 },
    { x: hw * 0.1, y: -hh * 0.15, r: hw * 0.55 },
    { x: hw * 0.5, y: hh * 0.05, r: hw * 0.4 },
    { x: -hw * 0.15, y: hh * 0.25, r: hw * 0.35 },
    { x: hw * 0.3, y: hh * 0.3, r: hw * 0.3 },
  ];
  ctx.moveTo(-hw, hh * 0.15);
  for (const b of bumps) {
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  }
  ctx.closePath();
}

function drawBlob(ctx: CanvasRenderingContext2D, hw: number, hh: number) {
  const pts = 8;
  for (let i = 0; i <= pts; i++) {
    const angle = (Math.PI * 2 * i) / pts;
    const wobble = 0.8 + 0.2 * Math.sin(angle * 3 + 1);
    const x = Math.cos(angle) * hw * wobble;
    const y = Math.sin(angle) * hh * wobble;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prev = ((Math.PI * 2 * (i - 1)) / pts);
      const cp1x = Math.cos(prev + 0.3) * hw * 1.1;
      const cp1y = Math.sin(prev + 0.3) * hh * 1.1;
      ctx.quadraticCurveTo(cp1x, cp1y, x, y);
    }
  }
  ctx.closePath();
}

function drawWave(ctx: CanvasRenderingContext2D, hw: number, hh: number) {
  ctx.moveTo(-hw, 0);
  ctx.bezierCurveTo(-hw * 0.5, -hh, -hw * 0.3, hh, 0, 0);
  ctx.bezierCurveTo(hw * 0.3, -hh, hw * 0.5, hh, hw, 0);
  ctx.lineTo(hw, hh * 0.3);
  ctx.lineTo(-hw, hh * 0.3);
  ctx.closePath();
}

function drawSpiral(ctx: CanvasRenderingContext2D, hw: number, hh: number) {
  const turns = 3;
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = turns * Math.PI * 2 * t;
    const r = t;
    const x = Math.cos(angle) * hw * r;
    const y = Math.sin(angle) * hh * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
}
