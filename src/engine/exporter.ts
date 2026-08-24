import type { AudioClip } from '../types/studio';

export const EXPORT_MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

export function pickMimeType(
  isSupported: (m: string) => boolean = (m) =>
    typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m),
): string {
  for (const mime of EXPORT_MIME_CANDIDATES) {
    if (isSupported(mime)) return mime;
  }
  throw new Error('No supported video MIME type found');
}

export interface ScheduledClip {
  id: string;
  when: number;
  sourceKind: 'voice' | 'sfx';
}

export function buildAudioSchedule(clips: AudioClip[]): ScheduledClip[] {
  return clips
    .map((c) => ({
      id: c.id,
      when: c.startMs / 1000,
      sourceKind: c.kind,
    }))
    .sort((a, b) => a.when - b.when);
}
