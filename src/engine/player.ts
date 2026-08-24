export interface TimedFrame {
  id: string;
  durationMs: number;
}

type Subscriber = (frameIndex: number) => void;

export class AnimationPlayer {
  private frames: TimedFrame[];
  private elapsed = 0;
  private prevNow: number | null = null;
  private playing = false;
  private subs = new Set<Subscriber>();
  private lastNotifiedIndex = 0;
  private _speed = 1;

  constructor(frames: TimedFrame[], private loop = true) {
    this.frames = [...frames];
    this.lastNotifiedIndex = 0;
  }

  get speed(): number {
    return this._speed;
  }

  set speed(v: number) {
    this._speed = Math.max(0.25, Math.min(4, v));
  }

  get totalDurationMs(): number {
    return this.frames.reduce((a, f) => a + f.durationMs, 0);
  }

  get currentTimeMs(): number {
    return this.elapsed;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  play(): void {
    if (!this.playing) {
      this.playing = true;
      this.prevNow = null;
    }
  }

  pause(): void {
    this.playing = false;
    this.prevNow = null;
  }

  seek(ms: number): void {
    this.elapsed = Math.max(0, Math.min(ms, this.totalDurationMs));
    this.notifyIfChanged();
  }

  reset(): void {
    this.elapsed = 0;
    this.playing = false;
    this.prevNow = null;
    this.notifyIfChanged();
  }

  tick(now: number): void {
    if (!this.playing) return;
    if (this.prevNow === null) {
      this.prevNow = now;
      return;
    }
    const dt = (now - this.prevNow) * this._speed;
    this.prevNow = now;
    this.elapsed += dt;
    const total = this.totalDurationMs;
    if (total <= 0) return;
    if (this.elapsed >= total) {
      if (this.loop) {
        this.elapsed = this.elapsed % total;
      } else {
        this.elapsed = total;
        this.playing = false;
      }
    }
    this.notifyIfChanged();
  }

  currentFrameIndex(): number {
    const total = this.totalDurationMs;
    if (total <= 0) return 0;
    let acc = 0;
    for (let i = 0; i < this.frames.length; i++) {
      acc += this.frames[i].durationMs;
      if (this.elapsed < acc) return i;
    }
    return this.frames.length - 1;
  }

  subscribe(cb: Subscriber): () => void {
    this.subs.add(cb);
    cb(this.currentFrameIndex());
    return () => {
      this.subs.delete(cb);
    };
  }

  private notifyIfChanged(): void {
    const idx = this.currentFrameIndex();
    if (idx !== this.lastNotifiedIndex) {
      this.lastNotifiedIndex = idx;
      for (const cb of this.subs) {
        cb(idx);
      }
    }
  }
}
