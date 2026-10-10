/**
 * Menu sounds and haptics. Every sound is synthesized with Web Audio (square
 * and triangle waves, chiptune style), so there are no audio files to license
 * or download. Preferences live in their own key, separate from the save.
 */
const PREFS_KEY = 'sh:prefs:v1';
const DEFAULTS = { sound: true, haptics: true };

function readPrefs() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

let prefs = readPrefs();

export function getPrefs() {
  return prefs;
}

export function setPref(key, value) {
  prefs = { ...prefs, [key]: value };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode or full storage: the setting still applies until the app closes.
  }
}

export const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

let ctx = null;
let master = null;

/** The audio context, created on first use inside a tap so phones allow it. */
function audio() {
  if (!prefs.sound || typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      // iOS: mix with the music already playing and respect the silent switch.
      if (navigator.audioSession) navigator.audioSession.type = 'ambient';
    } catch {
      // Older Safari: no audioSession, nothing to set.
    }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

function tone(freq, start, dur, { type = 'square', vol = 0.5, slide = null } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(master);
  o.start(start);
  o.stop(start + dur + 0.03);
}

const SOUNDS = {
  cursor: (t) => tone(hz(96), t, 0.035, { vol: 0.3 }),
  confirm: (t) => {
    tone(hz(84), t, 0.05);
    tone(hz(91), t + 0.05, 0.09);
  },
  back: (t) => {
    tone(hz(84), t, 0.05, { vol: 0.4 });
    tone(hz(77), t + 0.05, 0.08, { vol: 0.4 });
  },
  clear: (t) => {
    [72, 76, 79, 84].forEach((m, i) => tone(hz(m), t + i * 0.07, i === 3 ? 0.4 : 0.09));
    tone(hz(48), t, 0.45, { type: 'triangle', vol: 0.6 });
  },
  levelUp: (t) => {
    [72, 76, 79, 84, 88, 91].forEach((m, i) => tone(hz(m), t + i * 0.055, 0.08, { vol: 0.4 }));
    [84, 88, 91, 96].forEach((m) => {
      tone(hz(m), t + 0.36, 0.8, { type: 'triangle', vol: 0.45 });
      tone(hz(m), t + 0.36, 0.5, { vol: 0.12 });
    });
  },
  rankUp: (t) => {
    [60, 67, 72].forEach((m, i) => tone(hz(m), t + i * 0.14, 0.16, { vol: 0.5 }));
    [72, 79, 84, 88, 91].forEach((m) => {
      tone(hz(m), t + 0.45, 1.2, { type: 'triangle', vol: 0.45 });
      tone(hz(m), t + 0.45, 0.6, { vol: 0.1 });
    });
    [96, 100, 103, 108].forEach((m, i) => tone(hz(m), t + 0.55 + i * 0.07, 0.14, { type: 'triangle', vol: 0.3 }));
  },
  alarm: (t) => {
    tone(220, t, 0.18, { type: 'sawtooth', vol: 0.35, slide: 150 });
    tone(220, t + 0.24, 0.18, { type: 'sawtooth', vol: 0.35, slide: 150 });
  },
  tick: (t) => tone(hz(88), t, 0.04, { type: 'triangle', vol: 0.5 }),
  done: (t) => [88, 93, 88, 93].forEach((m, i) => tone(hz(m), t + i * 0.12, 0.11, { type: 'triangle', vol: 0.6 }))
};

/** Play a named sound. Silently does nothing when muted or unsupported. */
export function play(name) {
  const a = audio();
  if (!a || !SOUNDS[name]) return;
  try {
    SOUNDS[name](a.currentTime + 0.005);
  } catch {
    // A broken audio device should never break the app.
  }
}

/** Vibrate where the phone supports it (Android; iPhone Safari has no vibration API). */
export function buzz(pattern) {
  if (!prefs.haptics || !canVibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Ignore: haptics are a nice-to-have.
  }
}

/**
 * One listener for every button in the app: a menu blip by default, a confirm
 * chime on big buttons. A button opts out or picks a sound with data-sfx.
 */
export function installTapFeedback() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button');
    if (!b || b.disabled) return;
    const big = b.classList.contains('cta');
    const name = b.dataset.sfx || (big ? 'confirm' : 'cursor');
    if (name !== 'none') play(name);
    buzz(big ? 25 : 8);
  }, true);
}
