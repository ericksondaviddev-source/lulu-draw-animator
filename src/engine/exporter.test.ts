import { describe, it, expect } from 'vitest';
import { pickMimeType, buildAudioSchedule, EXPORT_MIME_CANDIDATES } from './exporter';
import type { AudioClip } from '../types/studio';

describe('pickMimeType', () => {
  it('returns first supported mime type', () => {
    const mock = (m: string) => m === 'video/webm';
    expect(pickMimeType(mock)).toBe('video/webm');
  });

  it('prefers mp4 over webm', () => {
    const mock = (m: string) => m.includes('video/mp4');
    expect(pickMimeType(mock)).toMatch('video/mp4');
  });

  it('throws when none supported', () => {
    const mock = () => false;
    expect(() => pickMimeType(mock)).toThrow();
  });
});

describe('EXPORT_MIME_CANDIDATES', () => {
  it('has mp4 first, webm as fallback', () => {
    expect(EXPORT_MIME_CANDIDATES[0]).toContain('mp4');
    expect(EXPORT_MIME_CANDIDATES.some((m) => m.includes('webm'))).toBe(true);
  });
});

describe('buildAudioSchedule', () => {
  it('sorts clips by start time', () => {
    const clips: AudioClip[] = [
      { id: 'c2', kind: 'sfx', name: 'Woosh', startMs: 2000, durationMs: 350 },
      { id: 'c1', kind: 'voice', name: 'Voz 1', startMs: 500, durationMs: 1200, blobUrl: 'blob:http://x/1' },
      { id: 'c3', kind: 'sfx', name: 'Pop', startMs: 1000, durationMs: 120 },
    ];
    const result = buildAudioSchedule(clips);
    expect(result.map((r) => r.when)).toEqual([0.5, 1, 2]);
  });

  it('returns empty for no clips', () => {
    expect(buildAudioSchedule([])).toEqual([]);
  });
});
