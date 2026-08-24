import { useRef, useEffect, useReducer, useCallback } from 'react';
import { AnimationPlayer, type TimedFrame } from '../engine/player';

export function useAnimationPlayer(frames: TimedFrame[], speed = 1) {
  const playerRef = useRef<AnimationPlayer | null>(null);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const playingRef = useRef(false);

  const key = frames.map((f) => `${f.id}:${f.durationMs}`).join(',');

  useEffect(() => {
    const old = playerRef.current;
    const p = new AnimationPlayer(frames);
    if (old) {
      p.speed = speed;
      p.seek(Math.min(old.currentTimeMs, Math.max(0, p.totalDurationMs - 1)));
      if (old.isPlaying()) p.play();
    }
    playerRef.current = p;
    force();
  }, [key]);

  // Sync speed
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.speed = speed;
    }
  }, [speed]);

  useEffect(() => {
    let raf: number;
    const loop = (t: number) => {
      playerRef.current?.tick(t);
      if (playingRef.current) force();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const play = useCallback(() => {
    playerRef.current?.play();
    playingRef.current = true;
    force();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pause();
    playingRef.current = false;
    force();
  }, []);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isPlaying()) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const seek = useCallback((ms: number) => {
    playerRef.current?.seek(ms);
    force();
  }, []);

  const reset = useCallback(() => {
    playerRef.current?.reset();
    playingRef.current = false;
    force();
  }, []);

  const p = playerRef.current;
  return {
    isPlaying: p?.isPlaying() ?? false,
    currentTimeMs: p?.currentTimeMs ?? 0,
    currentFrameIndex: p?.currentFrameIndex() ?? 0,
    totalDurationMs: p?.totalDurationMs ?? 0,
    play,
    pause,
    toggle,
    seek,
    reset,
  };
}
