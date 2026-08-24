import { describe, it, expect, vi } from 'vitest';
import { AnimationPlayer } from './player';

const frames = [
  { id: 'a', durationMs: 100 },
  { id: 'b', durationMs: 200 },
  { id: 'c', durationMs: 50 },
];

describe('AnimationPlayer', () => {
  it('starts paused at frame 0, time 0', () => {
    const p = new AnimationPlayer(frames);
    expect(p.isPlaying()).toBe(false);
    expect(p.currentTimeMs).toBe(0);
    expect(p.currentFrameIndex()).toBe(0);
  });

  it('advances through frames according to durations', () => {
    const p = new AnimationPlayer(frames);
    p.play();
    p.tick(0);   // prime first tick
    p.tick(50);
    expect(p.currentTimeMs).toBe(50);
    expect(p.currentFrameIndex()).toBe(0);
    p.tick(120);
    expect(p.currentTimeMs).toBe(120);
    expect(p.currentFrameIndex()).toBe(1);
    p.tick(320);
    expect(p.currentFrameIndex()).toBe(2);
  });

  it('pauses and resumes without jump', () => {
    const p = new AnimationPlayer(frames);
    p.play();
    p.tick(0);
    p.tick(40);
    expect(p.currentTimeMs).toBe(40);
    p.pause();
    p.tick(400); // ignored
    expect(p.currentTimeMs).toBe(40);
    p.play();
    p.tick(0); // prime after resume
    p.tick(60);
    expect(p.currentTimeMs).toBe(100); // 40 + 60
  });

  it('loops by default', () => {
    const p = new AnimationPlayer(frames); // total 350
    p.play();
    p.tick(0);
    p.tick(360);
    expect(p.currentTimeMs).toBe(10); // 360 % 350
    expect(p.currentFrameIndex()).toBe(0);
  });

  it('does not loop when loop=false', () => {
    const p = new AnimationPlayer(frames, false);
    p.play();
    p.tick(0);
    p.tick(400);
    expect(p.currentTimeMs).toBe(350); // clamped
    expect(p.isPlaying()).toBe(false);
  });

  it('seek sets time and correct frame', () => {
    const p = new AnimationPlayer(frames); // [100,200,50] → cumulative [100,300,350]
    p.seek(250);
    expect(p.currentTimeMs).toBe(250);
    expect(p.currentFrameIndex()).toBe(1); // 250 < 300 → frame b
    p.seek(320);
    expect(p.currentFrameIndex()).toBe(2); // 320 >= 300 → frame c
  });

  it('subscribers are notified on frame change', () => {
    const p = new AnimationPlayer(frames);
    const seen: number[] = [];
    p.subscribe((i) => seen.push(i));
    expect(seen).toEqual([0]); // immediate on subscribe
    p.play();
    p.tick(0);
    p.tick(150);
    expect(seen).toEqual([0, 1]);
  });

  it('totalDurationMs is sum of all frames', () => {
    const p = new AnimationPlayer(frames);
    expect(p.totalDurationMs).toBe(350);
  });
});
