// sound.js — tiny synthesized kitchen sounds, no audio files.
// One job: make a short beep with the Web Audio oscillator, guarded so a
// browser without audio simply stays silent.

let audio = null;

function ensureAudio() {
  if (audio) return audio;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audio = new Ctor();
  } catch {
    audio = null;
  }
  return audio;
}

function beep(freq, ms, type = 'sine', gain = 0.08) {
  const ctx = ensureAudio();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = gain;
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
  } catch {
    // Silence is fine; the game never depends on sound.
  }
}

export const sounds = {
  add() {
    beep(520, 70, 'triangle');
  },
  wrong() {
    beep(160, 140, 'sawtooth', 0.05);
  },
  served() {
    beep(660, 90, 'triangle');
    setTimeout(() => beep(880, 120, 'triangle'), 90);
  },
  won() {
    [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 140, 'triangle'), i * 130));
  },
  lost() {
    [400, 300, 220].forEach((f, i) => setTimeout(() => beep(f, 160, 'sine'), i * 150));
  },
};
