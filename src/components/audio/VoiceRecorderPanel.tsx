import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { clsx } from 'clsx';

export default function VoiceRecorderPanel() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clips = useStudioStore((s) => s.project.clips);
  const addClip = useStudioStore((s) => s.addClip);
  const removeClip = useStudioStore((s) => s.removeClip);
  const currentTimeMs = useStudioStore((s) => s.currentTimeMs) ?? 0;
  const voiceClips = clips.filter((c) => c.kind === 'voice');

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        addClip({
          id: crypto.randomUUID(),
          kind: 'voice',
          name: `Voz ${voiceClips.length + 1}`,
          startMs: Math.floor(currentTimeMs),
          durationMs: Math.floor(blob.size / 16), // rough estimate
          blobUrl: url,
        });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      setError('Permiso de micrófono denegado');
    }
  }, [addClip, currentTimeMs, voiceClips.length]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setElapsed(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const playClip = useCallback((blobUrl: string) => {
    const audio = new Audio(blobUrl);
    audio.play();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-3">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Estudio de Voz
      </h3>

      {/* Record button */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all',
            recording
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white',
          )}
          title={recording ? 'Detener grabación' : 'Grabar voz'}
        >
          {recording ? <Square size={14} /> : <Mic size={16} />}
        </button>

        {recording && (
          <span className="text-sm text-red-400 font-mono animate-pulse">
            {formatTime(elapsed)}
          </span>
        )}

        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>

      {/* Voice clips list */}
      {voiceClips.length > 0 && (
        <div className="space-y-1.5">
          {voiceClips.map((clip) => (
            <div
              key={clip.id}
              className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-2 py-1.5 group"
            >
              <button
                onClick={() => clip.blobUrl && playClip(clip.blobUrl)}
                className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Play size={12} />
              </button>
              <span className="text-[11px] text-zinc-300 flex-1 truncate">
                {clip.name}
              </span>
              <button
                onClick={() => removeClip(clip.id)}
                className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {voiceClips.length === 0 && !recording && (
        <p className="text-[10px] text-zinc-600">
          Presiona el micrófono para grabar tu voz
        </p>
      )}
    </div>
  );
}
