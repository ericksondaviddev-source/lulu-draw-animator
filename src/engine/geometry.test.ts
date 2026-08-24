import { describe, it, expect } from 'vitest';
import { distToSegment, hitTestStroke, findStrokeAtPoint } from './geometry';
import type { Stroke } from '../types/studio';

describe('distToSegment', () => {
  it('returns 0 for point on segment midpoint', () => {
    expect(distToSegment({ x: 5, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(0);
  });

  it('returns perpendicular distance', () => {
    expect(distToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(3);
  });

  it('clamps to endpoint a', () => {
    expect(distToSegment({ x: -2, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(2);
  });

  it('clamps to endpoint b', () => {
    expect(distToSegment({ x: 12, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(2);
  });

  it('works with zero-length segment', () => {
    expect(distToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);
  });
});

describe('hitTestStroke', () => {
  const stroke: Stroke = {
    id: 's1',
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ],
    color: '#000',
    width: 2,
    tool: 'pen',
  };

  it('hits when close to stroke', () => {
    expect(hitTestStroke({ x: 5, y: 2 }, stroke, 3)).toBe(true); // dist 2 ≤ 3+1=4
  });

  it('misses when far from stroke', () => {
    expect(hitTestStroke({ x: 5, y: 10 }, stroke, 2)).toBe(false); // dist 10 > 2+1=3
  });
});

describe('findStrokeAtPoint', () => {
  const strokes: Stroke[] = [
    { id: 's1', points: [{ x: 0, y: 0 }, { x: 50, y: 0 }], color: '#000', width: 2, tool: 'pen' },
    { id: 's2', points: [{ x: 0, y: 20 }, { x: 50, y: 20 }], color: '#f00', width: 2, tool: 'pen' },
  ];

  it('returns the matching stroke', () => {
    expect(findStrokeAtPoint(strokes, { x: 25, y: 20 }, 3)?.id).toBe('s2');
  });

  it('returns null when no match', () => {
    expect(findStrokeAtPoint(strokes, { x: 25, y: 100 }, 3)).toBeNull();
  });
});
