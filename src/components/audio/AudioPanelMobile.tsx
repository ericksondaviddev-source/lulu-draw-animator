import { useState } from 'react';
import { Mic, Music, X } from 'lucide-react';
import VoiceRecorderPanel from './VoiceRecorderPanel';
import SfxBank from './SfxBank';

export default function AudioPanelMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button - fixed in top-right area */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-16 right-3 z-30 w-10 h-10 rounded-xl bg-zinc-800/90 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-zinc-300 active:scale-90 transition-all shadow-lg"
      >
        <Music size={16} />
      </button>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full max-h-[70vh] bg-zinc-900 border-t border-zinc-700 rounded-t-2xl overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-zinc-200">Audio</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800"
              >
                <X size={16} />
              </button>
            </div>
            <VoiceRecorderPanel />
            <SfxBank />
          </div>
        </div>
      )}
    </>
  );
}
