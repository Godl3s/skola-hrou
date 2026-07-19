// ===== Spoločné pomôcky pre všetky hry =====
import {
  el, sample, award, toast, confetti, later, getCursive, setCursive,
} from './core.js';
import { speak, canSpeak, sfx, ensureAudio } from './audio.js';
import { PRAISES } from './data.js';
import { recordResult, recordMistake } from './stats.js';

export function praiseNow() {
  const p = sample(PRAISES);
  speak(p, 1);
  return p;
}

export function levelScreen(container, introHtml, levels, onPick, extra) {
  container.innerHTML = '';
  if (introHtml) container.appendChild(el('p', 'subtitle', introHtml));
  if (extra) container.appendChild(extra);
  const list = el('div', 'level-list');
  levels.forEach(lvl => {
    const b = el('button', 'btn', `<span class="lvl-emoji">${lvl.emoji}</span> ${lvl.label}`);
    b.addEventListener('click', () => { ensureAudio(); sfx.click(); onPick(lvl); });
    list.appendChild(b);
  });
  container.appendChild(list);
}

const MASCOTS = ['🦊', '🐼', '🐵', '🐸', '🐷', '🐰', '🐻', '🐧'];

export function resultScreen(container, score, total, onAgain) {
  disarmIdleHint();
  let stars, bonus, msg;
  const pct = score / total;
  if (pct === 1) { stars = '⭐⭐⭐'; bonus = 5; msg = 'Fantastické! Všetko správne!'; }
  else if (pct >= 0.8) { stars = '⭐⭐'; bonus = 3; msg = 'Výborne, skoro všetko!'; }
  else if (pct >= 0.5) { stars = '⭐'; bonus = 1; msg = 'Dobrá práca!'; }
  else { stars = '💪'; bonus = 0; msg = 'Trénuj ďalej, zlepšíš sa!'; }
  if (bonus > 0) award(bonus);
  sfx.win();
  confetti();
  speak(msg, 1);

  container.innerHTML = '';
  const panel = el('div', 'game-panel');
  panel.appendChild(el('div', 'result-stars', stars));
  panel.appendChild(el('div', 'result-score', `Správne: ${score} z ${total}`));

  const mascot = el('div', 'mascot');
  mascot.appendChild(el('div', 'mascot-face', sample(MASCOTS)));
  mascot.appendChild(el('div', 'mascot-bubble', msg));
  panel.appendChild(mascot);

  if (bonus > 0) panel.appendChild(el('p', '', `Bonus: +${bonus} 💎`));
  const row = el('div', 'stack');
  const again = el('button', 'btn btn-primary btn-big', '🔁 Ešte raz');
  again.addEventListener('click', onAgain);
  const shop = el('button', 'btn btn-green btn-big', '🏡 Moja dedinka');
  shop.addEventListener('click', () => { location.hash = '#/svet'; });
  const home = el('button', 'btn btn-big', '🎮 Iná hra');
  home.addEventListener('click', () => { location.hash = ''; });
  row.append(again, shop, home);
  panel.appendChild(row);
  container.appendChild(panel);
}

export function highlightWord(word, letter) {
  const lower = letter.toLowerCase();
  return word.split('').map(ch =>
    ch.toLowerCase() === lower ? `<span class="hl">${ch}</span>` : ch
  ).join('');
}

export function ttsHintBanner() {
  if (!canSpeak()) {
    return el('div', 'hint-banner',
      '🔇 Toto zariadenie nevie čítať nahlas. Slová sa zobrazia napísané – prečítajte ich dieťaťu vy.');
  }
  return null;
}

export function cursiveToggle(onChange) {
  const b = el('button', 'btn btn-toggle', '');
  const paint = () => { b.innerHTML = getCursive() ? '✍️ Písané' : '🅰️ Tlačené'; };
  paint();
  b.addEventListener('click', () => {
    ensureAudio(); sfx.click();
    setCursive(!getCursive());
    paint();
    if (onChange) onChange();
  });
  return b;
}

// Vytvorí obsluhu odpovede s OPAKOVANÍM po chybe.
// st = { firstTry, locked, tries }
export function makeState() { return { firstTry: true, locked: false, tries: 0 }; }

const RETRY_MSGS = ['Skús to ešte raz! 💪', 'Ešte raz to skús! 🙂', 'Nevadí, skús znova! 💪', 'Skúsime znova? 😊'];
export function onWrongDefault(st, btn, reveal, mistake) {
  st.firstTry = false;
  st.tries++;
  btn.classList.add('incorrect');
  btn.disabled = true;
  sfx.wrong();
  toast(st.tries >= 2 ? 'Pozri, správna odpoveď svieti! 👉' : sample(RETRY_MSGS));
  if (st.tries === 1 && mistake) recordMistake(mistake);
  if (st.tries >= 2 && reveal) reveal();
}

// zapíše výsledok otázky do štatistík (a zruší čakajúce nápovedy)
export function trackResult(st, meta) {
  disarmIdleHint();
  recordResult({ ...meta, firstTry: st.firstTry });
}

// ===== Číselná klávesnica (0–99) pre hadíka, pyramídy… =====
// onChange(text) sa volá pri každej zmene, onOk(number) po ✔.
export function numPad({ onChange, onOk }) {
  let value = '';
  const node = el('div', 'numpad');
  const emit = () => { if (onChange) onChange(value); };
  const press = (d) => {
    ensureAudio(); sfx.click();
    if (value.length >= 2) return;
    if (value === '0') value = ''; // 07 → 7
    value += d;
    emit();
  };
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(d => {
    const b = el('button', 'btn', String(d));
    b.addEventListener('click', () => press(String(d)));
    node.appendChild(b);
  });
  const back = el('button', 'btn', '⌫');
  back.addEventListener('click', () => {
    ensureAudio(); sfx.click();
    value = value.slice(0, -1);
    emit();
  });
  node.appendChild(back);
  const zero = el('button', 'btn', '0');
  zero.addEventListener('click', () => press('0'));
  node.appendChild(zero);
  const ok = el('button', 'btn btn-green', '✔');
  ok.addEventListener('click', () => {
    ensureAudio();
    if (value === '') { sfx.wrong(); toast('Napíš číslo a potom ✔'); return; }
    const n = parseInt(value, 10);
    value = '';
    emit();
    if (onOk) onOk(n);
  });
  node.appendChild(ok);
  return {
    node,
    reset() { value = ''; emit(); },
    get() { return value; },
  };
}

// ===== Automatická rada pri dlhom váhaní =====
// Po ~12 s poradí a zopakuje zadanie, po ~22 s rozsvieti správnu odpoveď.
let hintSeq = 0;
export function armIdleHint(replayFn, revealFn) {
  const my = ++hintSeq;
  later(() => {
    if (my !== hintSeq) return;
    toast('Potrebuješ pomôcť? Počúvaj! 🙂', 2400);
    if (replayFn) replayFn();
  }, 12000);
  later(() => {
    if (my !== hintSeq) return;
    if (revealFn) {
      toast('Pozri, správna odpoveď svieti! 👉', 2600);
      revealFn();
    }
  }, 22000);
}
export function disarmIdleHint() { hintSeq++; }
