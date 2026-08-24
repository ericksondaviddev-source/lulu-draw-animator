import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useStudioStore } from './store/useStudioStore';
import { useAnimationPlayer } from './hooks/useAnimationPlayer';
import { useMediaQuery } from './hooks/useMediaQuery';
import DrawingCanvas from './components/canvas/DrawingCanvas';
import ToolPalette from './components/tools/ToolPalette';
import ToolPaletteMobile from './components/tools/ToolPaletteMobile';
import Timeline from './components/timeline/Timeline';
import VoiceRecorderPanel from './components/audio/VoiceRecorderPanel';
import SfxBank from './components/audio/SfxBank';
import AudioPanelMobile from './components/audio/AudioPanelMobile';
import ExtrasPanel from './components/panels/ExtrasPanel';
import ExportDialog from './components/export/ExportDialog';

export default function App() {
  const [exportOpen, setExportOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const frames = useStudioStore((s) => s.project.frames);
  const activeFrameId = useStudioStore((s) => s.activeFrameId);
  const speed = useStudioStore((s) => s.speed);
  const selectFrame = useStudioStore((s) => s.selectFrame);
  const setCurrentTime = useStudioStore((s) => s.setCurrentTime);

  const playerFrames = useMemo(
    () => frames.map((f) => ({ id: f.id, durationMs: f.durationMs })),
    [frames],
  );

  const player = useAnimationPlayer(playerFrames, speed);

  useEffect(() => {
    setCurrentTime(player.currentTimeMs);
  }, [player.currentTimeMs, setCurrentTime]);

  const [playingViewId, setPlayingViewId] = useState<string | null>(null);

  useEffect(() => {
    if (player.isPlaying) {
      const f = frames[player.currentFrameIndex];
      if (f) setPlayingViewId(f.id);
    }
  }, [player.isPlaying, player.currentFrameIndex, frames]);

  const handleTogglePlay = useCallback(() => {
    if (player.isPlaying) {
      player.pause();
      setPlayingViewId(null);
      const idx = player.currentFrameIndex;
      const f = frames[idx];
      if (f) selectFrame(f.id);
    } else {
      player.play();
    }
  }, [player, frames, selectFrame]);

  const viewFrameId = playingViewId ?? activeFrameId;

  // ── MOBILE LAYOUT ──
  if (isMobile) {
    return (
      <div className="h-[100dvh] flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden select-none">
        {/* Compact header */}
        <header className="h-11 flex items-center justify-between px-3 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🎨</span>
            <h1 className="font-display text-sm font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Lulu
            </h1>
          </div>
          <button
            onClick={() => setExportOpen(true)}
            className="h-7 px-3 rounded-lg bg-violet-600 text-white text-[11px] font-semibold active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download size={11} />
            Exportar
          </button>
        </header>

        {/* Canvas — takes remaining space */}
        <div className="flex-1 min-h-0">
          <DrawingCanvas viewFrameId={viewFrameId} />
        </div>

        {/* Timeline */}
        <Timeline
          isPlaying={player.isPlaying}
          onTogglePlay={handleTogglePlay}
          currentIndex={player.currentFrameIndex}
          currentTimeMs={player.currentTimeMs}
          totalDurationMs={player.totalDurationMs}
        />

        {/* Mobile tools bottom bar */}
        <ToolPaletteMobile />

        {/* Mobile audio panel */}
        <AudioPanelMobile />

        {/* Export dialog */}
        <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      </div>
    );
  }

  // ── DESKTOP LAYOUT ──
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden select-none">
      <header className="h-14 flex items-center justify-between px-4 bg-zinc-900/60 backdrop-blur-md border-b border-zinc-800 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <h1 className="font-display text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Lulu Animator
          </h1>
        </div>
        <button
          onClick={() => setExportOpen(true)}
          className="h-8 px-4 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20"
        >
          <Download size={13} />
          Exportar Video
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <ToolPalette />
        <DrawingCanvas viewFrameId={viewFrameId} />
        <div className="w-[280px] flex-shrink-0 flex flex-col gap-3 p-3 overflow-y-auto">
          <ExtrasPanel />
          <VoiceRecorderPanel />
          <SfxBank />
        </div>
      </div>

      <Timeline
        isPlaying={player.isPlaying}
        onTogglePlay={handleTogglePlay}
        currentIndex={player.currentFrameIndex}
        currentTimeMs={player.currentTimeMs}
        totalDurationMs={player.totalDurationMs}
      />

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
