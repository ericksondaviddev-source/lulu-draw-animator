import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Pencil, Shapes, Music, Film, Sparkles } from 'lucide-react';
import { useStudioStore } from './store/useStudioStore';
import { useAnimationPlayer } from './hooks/useAnimationPlayer';
import { useMediaQuery } from './hooks/useMediaQuery';
import DrawingCanvas from './components/canvas/DrawingCanvas';
import ToolPalette from './components/tools/ToolPalette';
import Timeline from './components/timeline/Timeline';
import ExtrasPanel from './components/panels/ExtrasPanel';
import VoiceRecorderPanel from './components/audio/VoiceRecorderPanel';
import SfxBank from './components/audio/SfxBank';
import ExportDialog from './components/export/ExportDialog';
import MobileExtrasSheet from './components/mobile/MobileExtrasSheet';
import MobileDrawBar from './components/mobile/MobileDrawBar';
import MobileTimelineSheet from './components/mobile/MobileTimelineSheet';

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
    [frames, ],
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
    return <MobileLayout
      viewFrameId={viewFrameId}
      isPlaying={player.isPlaying}
      onTogglePlay={handleTogglePlay}
      currentIndex={player.currentFrameIndex}
      currentTimeMs={player.currentTimeMs}
      totalDurationMs={player.totalDurationMs}
      exportOpen={exportOpen}
      setExportOpen={setExportOpen}
    />;
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

// ── MOBILE LAYOUT COMPONENT ──
type MobileTab = 'draw' | 'extras' | 'audio' | 'timeline';

function MobileLayout({
  viewFrameId,
  isPlaying,
  onTogglePlay,
  currentIndex,
  currentTimeMs,
  totalDurationMs,
  exportOpen,
  setExportOpen,
}: {
  viewFrameId: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentIndex: number;
  currentTimeMs: number;
  totalDurationMs: number;
  exportOpen: boolean;
  setExportOpen: (v: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<MobileTab>('draw');

  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden select-none">
      {/* Header */}
      <header className="h-11 flex items-center justify-between px-3 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex-shrink-0">
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

      {/* Canvas — always fills remaining space */}
      <div className="flex-1 min-h-0 relative">
        <DrawingCanvas viewFrameId={viewFrameId} />
      </div>

      {/* Bottom panel area — changes per tab */}
      <div className="flex-shrink-0">
        {activeTab === 'draw' && <MobileDrawBar />}
        {activeTab === 'extras' && <MobileExtrasSheet onClose={() => setActiveTab('draw')} />}
        {activeTab === 'audio' && <MobileAudioSheet onClose={() => setActiveTab('draw')} />}
        {activeTab === 'timeline' && (
          <MobileTimelineSheet
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            currentIndex={currentIndex}
            currentTimeMs={currentTimeMs}
            totalDurationMs={totalDurationMs}
            onClose={() => setActiveTab('draw')}
          />
        )}
      </div>

      {/* Tab bar — always visible */}
      <nav className="h-14 flex items-center justify-around bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 flex-shrink-0 px-1">
        <TabButton
          icon={<Pencil size={18} />}
          label="Dibujar"
          active={activeTab === 'draw'}
          onClick={() => setActiveTab('draw')}
        />
        <TabButton
          icon={<Sparkles size={18} />}
          label="Extras"
          active={activeTab === 'extras'}
          onClick={() => setActiveTab('extras')}
        />
        <TabButton
          icon={<Music size={18} />}
          label="Audio"
          active={activeTab === 'audio'}
          onClick={() => setActiveTab('audio')}
        />
        <TabButton
          icon={<Film size={18} />}
          label="Timeline"
          active={activeTab === 'timeline'}
          onClick={() => setActiveTab('timeline')}
        />
      </nav>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-90 ${
        active
          ? 'bg-violet-600/20 text-violet-400'
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  );
}

// ── MOBILE AUDIO SHEET ──
function MobileAudioSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 max-h-[45vh] overflow-y-auto p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-200">Audio</h3>
        <button onClick={onClose} className="text-[10px] text-zinc-500 px-2 py-1">Cerrar</button>
      </div>
      <VoiceRecorderPanel />
      <SfxBank />
    </div>
  );
}
