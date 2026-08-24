import { SFX_LIBRARY } from '../data/sfx';

let sharedCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
}

function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playSfxRecipe(
  ctx: AudioContext,
  dest: AudioNode,
  recipeId: string,
  when: number = ctx.currentTime,
): void {
  const recipe = SFX_LIBRARY.find((r) => r.id === recipeId);
  if (!recipe) return;

  const dur = recipe.durationMs / 1000;

  switch (recipeId) {
    case 'pop': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, when);
      osc.frequency.exponentialRampToValueAtTime(120, when + dur);
      gain.gain.setValueAtTime(0.6, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(when);
      osc.stop(when + dur);
      break;
    }
    case 'woosh': {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, dur);
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(300, when);
      bandpass.frequency.exponentialRampToValueAtTime(3000, when + dur);
      bandpass.Q.value = 1;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + dur);
      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(dest);
      noise.start(when);
      noise.stop(when + dur);
      break;
    }
    case 'jump': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, when);
      osc.frequency.exponentialRampToValueAtTime(720, when + dur);
      gain.gain.setValueAtTime(0.3, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(when);
      osc.stop(when + dur);
      break;
    }
    case 'boing': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, when);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 30;
      lfoGain.gain.value = 150;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      gain.gain.setValueAtTime(0.4, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(when);
      osc.stop(when + dur);
      lfo.start(when);
      lfo.stop(when + dur);
      break;
    }
    case 'sparkle': {
      const freqs = [1200, 1600, 2100];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = when + i * 0.06;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.1);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(start);
        osc.stop(start + 0.12);
      });
      break;
    }
    case 'drum': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, when);
      osc.frequency.exponentialRampToValueAtTime(50, when + 0.08);
      gain.gain.setValueAtTime(0.7, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(when);
      osc.stop(when + dur);
      break;
    }
    default: {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.3, when);
      gain.gain.exponentialRampToValueAtTime(0.01, when + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(when);
      osc.stop(when + dur);
    }
  }
}
