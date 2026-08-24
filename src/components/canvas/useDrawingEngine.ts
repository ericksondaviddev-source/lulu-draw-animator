import { useState, useCallback } from 'react';
import type { Point, Stroke } from '../../types/studio';
import { useStudioStore } from '../../store/useStudioStore';

const genId = () => crypto.randomUUID();

export function useDrawingEngine() {
  const [liveStroke, setLiveStroke] = useState<Stroke | null>(null);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  const color = useStudioStore((s) => s.color);
  const brushWidth = useStudioStore((s) => s.brushWidth);
  const selectedTool = useStudioStore((s) => s.selectedTool);
  const addStroke = useStudioStore((s) => s.addStroke);

  const startStroke = useCallback(
    (p: Point) => {
      if (selectedTool === 'eraser') return;
      const stroke: Stroke = {
        id: genId(),
        points: [p],
        color,
        width: brushWidth,
        tool: 'pen',
      };
      setLiveStroke(stroke);
      setLastPoint(p);
    },
    [selectedTool, color, brushWidth],
  );

  const continueStroke = useCallback(
    (p: Point) => {
      if (!liveStroke) return;
      setLiveStroke((prev) =>
        prev ? { ...prev, points: [...prev.points, p] } : null,
      );
      setLastPoint(p);
    },
    [liveStroke],
  );

  const commitStroke = useCallback(() => {
    if (liveStroke && liveStroke.points.length >= 2) {
      addStroke(liveStroke);
    }
    setLiveStroke(null);
    setLastPoint(null);
  }, [liveStroke, addStroke]);

  const cancelStroke = useCallback(() => {
    setLiveStroke(null);
    setLastPoint(null);
  }, []);

  return {
    liveStroke,
    lastPoint,
    startStroke,
    continueStroke,
    commitStroke,
    cancelStroke,
    selectedTool,
    color,
    brushWidth,
  };
}
