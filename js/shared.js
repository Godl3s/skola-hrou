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
