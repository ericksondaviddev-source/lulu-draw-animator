import type { Point, Stroke } from '../types/studio';

export function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function hitTestStroke(
  p: Point,
  stroke: Stroke,
  tolerance: number,
): boolean {
  const radius = tolerance + stroke.width / 2;
  for (let i = 0; i < stroke.points.length - 1; i++) {
    if (distToSegment(p, stroke.points[i], stroke.points[i + 1]) <= radius) {
      return true;
    }
  }
  return false;
}

export function findStrokeAtPoint(
  strokes: Stroke[],
  p: Point,
  tolerance: number,
): Stroke | null {
  for (let i = strokes.length - 1; i >= 0; i--) {
    if (hitTestStroke(p, strokes[i], tolerance)) return strokes[i];
  }
  return null;
}
