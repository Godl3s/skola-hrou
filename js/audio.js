// ===== Zvuk: hovorené slovo (TTS) + zvukové efekty (WebAudio) =====

// --- hlas ---
let voices = [];
function loadVoices() {
  if ('speechSynthesis' in window) voices = speechSynthesis.getVoices();
}
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice() {
  const sk = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('sk'));
  if (sk) return sk;
  const cs = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('cs'));
  return cs || null;
}

export function hasSlovakVoice() {
  return voices.some(v => v.lang && v.lang.toLowerCase().startsWith('sk'));
}

export function canSpeak() {
  return 'speechSynthesis' in window;
}

export function speak(text, rate = 0.85) {
  return new Promise(resolve => {
    if (!canSpeak()) return resolve(false);
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'sk-SK';
      const v = pickVoice();
      if (v) u.voice = v;
      u.rate = rate;
      u.pitch = 1.05;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      // malá pauza po cancel(), inak Chrome občas slovo „zhltne"
      setTimeout(() => speechSynthesis.speak(u), 40);
      // poistka, keby onend neprišiel
      setTimeout(() => resolve(true), 6000);
    } catch { resolve(false); }
  });
}

// --- čísla po slovensky (aby ich hlas nezmršil) ---
const SK_NUM = [
  'nula', 'jeden', 'dva', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem',
  'deväť', 'desať', 'jedenásť', 'dvanásť', 'trinásť', 'štrnásť', 'pätnásť',
  'šestnásť', 'sedemnásť', 'osemnásť', 'devätnásť', 'dvadsať',
];
export function numberToSlovak(n) {
  if (n >= 0 && n < SK_NUM.length) return SK_NUM[n];
  return String(n);
}
export function speakNumber(n) { return speak(numberToSlovak(n), 0.9); }

// Prečíta matematický príklad po slovensky. `hidden` skryje výsledok („je?").
export function speakMath(a, b, op) {
  const opWord = op === '+' ? 'plus' : 'mínus';
  return speak(`Koľko je ${numberToSlovak(a)} ${opWord} ${numberToSlovak(b)}?`, 0.85);
}

// --- zvukové efekty ---
let ctx = null;
export function ensureAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq, dur, type = 'sine', when = 0, vol = 0.22) {
  const c = ensureAudio();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  correct() {
    tone(523, 0.14, 'triangle', 0);
    tone(659, 0.14, 'triangle', 0.11);
    tone(784, 0.22, 'triangle', 0.22);
  },
  wrong() {
    tone(220, 0.2, 'sawtooth', 0, 0.1);
    tone(180, 0.25, 'sawtooth', 0.12, 0.1);
  },
  click() { tone(600, 0.05, 'square', 0, 0.07); },
  win() {
    [523, 587, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', i * 0.12));
  },
  place() { tone(340, 0.1, 'square', 0, 0.12); tone(510, 0.12, 'square', 0.08, 0.12); },
};

// Druhy zvukov pre hru „Počúvaj a počítaj"
const COUNT_SOUNDS = {
  zvonček: { freq: 880, type: 'sine', dur: 0.22 },
  bubon: { freq: 160, type: 'square', dur: 0.15 },
  píšťalka: { freq: 1240, type: 'triangle', dur: 0.2 },
};
export const COUNT_SOUND_NAMES = Object.keys(COUNT_SOUNDS);

// Zahrá `n` zvukov za sebou; onBeat(i) sa volá pri každom zvuku.
export function playCountSounds(n, kindName, onBeat) {
  const c = ensureAudio();
  const kind = COUNT_SOUNDS[kindName] || COUNT_SOUNDS['zvonček'];
  const gap = 0.62;
  return new Promise(resolve => {
    if (!c) { resolve(false); return; }
    for (let i = 0; i < n; i++) {
      tone(kind.freq, kind.dur, kind.type, i * gap, 0.28);
      if (onBeat) setTimeout(() => onBeat(i), i * gap * 1000);
    }
    setTimeout(() => resolve(true), (n * gap + 0.3) * 1000);
  });
}
