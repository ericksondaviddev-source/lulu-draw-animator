import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from './useStudioStore';

describe('useStudioStore', () => {
  beforeEach(() => {
    useStudioStore.setState(useStudioStore.getInitialState());
  });

  it('starts with one frame and a random activeFrameId', () => {
    const { project, activeFrameId } = useStudioStore.getState();
    expect(project.frames).toHaveLength(1);
    expect(activeFrameId).toBe(project.frames[0].id);
  });

  it('addFrame inserts after the active frame', () => {
    const { activeFrameId } = useStudioStore.getState();
    useStudioStore.getState().addFrame();
    const { project } = useStudioStore.getState();
    expect(project.frames).toHaveLength(2);
    const idx = project.frames.findIndex((f) => f.id === activeFrameId);
    expect(project.frames[idx + 1]).toBeDefined();
  });

  it('duplicateFrame inserts a copy after the original and sets it active', () => {
    const f = useStudioStore.getState().project.frames[0];
    useStudioStore.getState().duplicateFrame(f.id);
    const { project, activeFrameId } = useStudioStore.getState();
    expect(project.frames).toHaveLength(2);
    expect(project.frames[1].strokes).toEqual([]);
    expect(activeFrameId).toBe(project.frames[1].id);
  });

  it('removeFrame removes the frame and selects neighbor', () => {
    useStudioStore.getState().addFrame();
    const { project } = useStudioStore.getState();
    const secondId = project.frames[1].id;
    useStudioStore.getState().removeFrame(secondId);
    expect(useStudioStore.getState().project.frames).toHaveLength(1);
  });

  it('removeFrame does nothing if only 1 frame left', () => {
    const f = useStudioStore.getState().project.frames[0];
    useStudioStore.getState().removeFrame(f.id);
    expect(useStudioStore.getState().project.frames).toHaveLength(1);
  });

  it('reorderFrames moves a frame', () => {
    useStudioStore.getState().addFrame();
    useStudioStore.getState().addFrame(); // 3 frames
    const ids = useStudioStore.getState().project.frames.map((f) => f.id);
    useStudioStore.getState().reorderFrames(0, 2); // first → last
    const newIds = useStudioStore.getState().project.frames.map((f) => f.id);
    expect(newIds[0]).toBe(ids[1]);
    expect(newIds[1]).toBe(ids[2]);
    expect(newIds[2]).toBe(ids[0]);
  });

  it('addStroke adds a stroke to active frame', () => {
    const stroke = {
      id: 'st1',
      points: [{ x: 0, y: 0 }],
      color: '#000',
      width: 3,
      tool: 'pen' as const,
    };
    useStudioStore.getState().addStroke(stroke);
    const { project, activeFrameId } = useStudioStore.getState();
    const frame = project.frames.find((f) => f.id === activeFrameId)!;
    expect(frame.strokes).toHaveLength(1);
  });

  it('undo restores previous frame state', () => {
    const stroke = {
      id: 'st1',
      points: [{ x: 0, y: 0 }],
      color: '#000',
      width: 3,
      tool: 'pen' as const,
    };
    useStudioStore.getState().addStroke(stroke);
    useStudioStore.getState().undo();
    const { project, activeFrameId } = useStudioStore.getState();
    const frame = project.frames.find((f) => f.id === activeFrameId)!;
    expect(frame.strokes).toHaveLength(0);
  });

  it('redo restores undone state', () => {
    const stroke = {
      id: 'st1',
      points: [{ x: 0, y: 0 }],
      color: '#000',
      width: 3,
      tool: 'pen' as const,
    };
    useStudioStore.getState().addStroke(stroke);
    useStudioStore.getState().undo();
    useStudioStore.getState().redo();
    const { project, activeFrameId } = useStudioStore.getState();
    const frame = project.frames.find((f) => f.id === activeFrameId)!;
    expect(frame.strokes).toHaveLength(1);
  });

  it('eraseAt removes a stroke within tolerance', () => {
    const stroke = {
      id: 'st1',
      points: [{ x: 0, y: 0 }, { x: 50, y: 0 }],
      color: '#000',
      width: 2,
      tool: 'pen' as const,
    };
    useStudioStore.getState().addStroke(stroke);
    const removed = useStudioStore.getState().eraseAt({ x: 25, y: 0 }, 5);
    expect(removed).toBe(true);
    const { project, activeFrameId } = useStudioStore.getState();
    const frame = project.frames.find((f) => f.id === activeFrameId)!;
    expect(frame.strokes).toHaveLength(0);
  });

  it('eraseAt returns false when nothing hit', () => {
    const stroke = {
      id: 'st1',
      points: [{ x: 0, y: 0 }, { x: 50, y: 0 }],
      color: '#000',
      width: 2,
      tool: 'pen' as const,
    };
    useStudioStore.getState().addStroke(stroke);
    const removed = useStudioStore.getState().eraseAt({ x: 25, y: 50 }, 3);
    expect(removed).toBe(false);
  });

  it('addClip / removeClip work', () => {
    useStudioStore.getState().addClip({
      id: 'clip1',
      kind: 'voice',
      name: 'Voz 1',
      startMs: 0,
      durationMs: 1000,
      blobUrl: 'blob:http://x/1',
    });
    expect(useStudioStore.getState().project.clips).toHaveLength(1);
    useStudioStore.getState().removeClip('clip1');
    expect(useStudioStore.getState().project.clips).toHaveLength(0);
  });
});
