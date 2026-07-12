// ===== Rodičovský panel (za PIN) – manuálne prideľovanie diamantov =====
import {
  el, award, getDiamonds, getEarned, levelInfo, updateBadge,
  lsGet, lsSet, metaGet, metaSet, toast, confetti,
} from './core.js';
import { ensureAudio, sfx, speak } from './audio.js';

let authed = false;               // platí počas relácie
const DEFAULT_PIN = '12345';
// PIN je spoločný pre všetky profily (meta), nie per-profil
const getPin = () => String(metaGet('parentPin', DEFAULT_PIN));
const setPin = (p) => metaSet('parentPin', String(p));

export function renderParent(container) {
  if (authed) renderPanel(container);
  else renderGate(container);
}

// ---------- PIN brána ----------
function renderGate(container) {
  container.innerHTML = '';
  const panel = el('div', 'game-panel');
  panel.appendChild(el('div', 'big-emoji', '🔒'));
  panel.appendChild(el('p', 'subtitle', 'Rodičovský vstup – zadaj PIN'));

  const display = el('div', 'pin-display', '');
  panel.appendChild(display);

  let entered = '';
  const paint = () => { display.textContent = '•'.repeat(entered.length) || '‏ '; };
  paint();

  const check = () => {
    if (entered === getPin()) {
      authed = true;
      ensureAudio(); sfx.win(); confetti(10);
      renderPanel(container);
    } else {
      ensureAudio(); sfx.wrong();
      display.classList.remove('shake'); void display.offsetWidth;
      display.classList.add('shake');
      toast('Nesprávny PIN 🙈');
      entered = '';
      paint();
    }
  };

  const keypad = el('div', 'keypad');
  const addKey = (label, fn) => {
    const b = el('button', 'btn', label);
    b.addEventListener('click', () => { ensureAudio(); sfx.click(); fn(); });
    keypad.appendChild(b);
    return b;
  };
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(d => addKey(String(d), () => {
    if (entered.length >= 8) return;
    entered += d; paint();
    if (entered.length === getPin().length) setTimeout(check, 120);
  }));
  addKey('⌫', () => { entered = entered.slice(0, -1); paint(); });
  addKey('0', () => {
    if (entered.length >= 8) return;
    entered += '0'; paint();
    if (entered.length === getPin().length) setTimeout(check, 120);
  });
  addKey('🏠', () => { location.hash = ''; });
  panel.appendChild(keypad);

  if (getPin() === DEFAULT_PIN) {
    panel.appendChild(el('p', 'muted', 'Prvý raz? Predvolený PIN je 12345 (v paneli si ho môžeš zmeniť).'));
  }
  container.appendChild(panel);
}

// ---------- panel ----------
function giveDiamonds(n, container, msg) {
  ensureAudio();
  award(n);
  sfx.win();
  confetti(10);
  toast(msg || `+${n} 💎 pridané!`, 1800);
  renderPanel(container);
}

function renderPanel(container) {
  container.innerHTML = '';
  const info = levelInfo();

  const lvlBox = el('div', 'level-box');
  lvlBox.appendChild(el('div', '', `${info.emoji} <b>Level ${info.level} – ${info.title}</b>`));
  lvlBox.appendChild(el('div', 'muted',
    `Diamanty na míňanie: <b>${getDiamonds()} 💎</b> · celkovo nazbierané: <b>${getEarned()}</b>`));
  container.appendChild(lvlBox);

  container.appendChild(el('p', 'subtitle', '👨‍👩‍👧 Odmeňuj za učenie doma ✍️'));

  // — odmena za prepisovanie —
  const s1 = el('div', 'parent-section');
  s1.appendChild(el('h3', 'shop-title', '✍️ Odmena za prepisovanie'));
  s1.appendChild(el('p', '', 'Ťukni raz za každú vetu, ktorú prepíše rukou.'));
  const r1 = el('div', 'chip-row');
  const bVeta = el('button', 'btn btn-green btn-big', '➕ +1 💎 za vetu');
  bVeta.addEventListener('click', () => giveDiamonds(1, container, '+1 💎 za vetu! ✍️'));
  const bOdsek = el('button', 'btn btn-green', '+5 💎 za odsek');
  bOdsek.addEventListener('click', () => giveDiamonds(5, container, '+5 💎 za odsek! 📄'));
  r1.append(bVeta, bOdsek);
  s1.appendChild(r1);
  container.appendChild(s1);

  // — pridať vlastný počet —
  const s2 = el('div', 'parent-section');
  s2.appendChild(el('h3', 'shop-title', '➕ Pridať diamanty'));
  const inWrap = el('div', 'chip-row');
  const input = el('input', 'num-input');
  input.type = 'number'; input.inputMode = 'numeric'; input.min = '1'; input.value = '10';
  const addBtn = el('button', 'btn btn-primary', 'Pridať');
  addBtn.addEventListener('click', () => {
    const n = parseInt(input.value, 10);
    if (!n || n <= 0) { sfx.wrong(); toast('Zadaj číslo väčšie ako 0'); return; }
    giveDiamonds(n, container, `+${n} 💎 pridané!`);
  });
  inWrap.append(input, addBtn);
  s2.appendChild(inWrap);
  const quick = el('div', 'chip-row');
  [5, 10, 20, 50].forEach(n => {
    const b = el('button', 'btn', `+${n}`);
    b.addEventListener('click', () => giveDiamonds(n, container));
    quick.appendChild(b);
  });
  s2.appendChild(quick);
  container.appendChild(s2);

  // — nastaviť presný počet —
  const s3 = el('div', 'parent-section');
  s3.appendChild(el('h3', 'shop-title', '🔧 Nastaviť presný počet 💎'));
  s3.appendChild(el('p', 'muted', 'Na opravu počtu diamantov na míňanie. Nezmení level.'));
  const setWrap = el('div', 'chip-row');
  const setInput = el('input', 'num-input');
  setInput.type = 'number'; setInput.inputMode = 'numeric'; setInput.min = '0'; setInput.value = String(getDiamonds());
  const setBtn = el('button', 'btn', 'Nastaviť');
  setBtn.addEventListener('click', () => {
    const n = parseInt(setInput.value, 10);
    if (isNaN(n) || n < 0) { sfx.wrong(); toast('Zadaj číslo 0 alebo viac'); return; }
    lsSet('diamonds', n);
    updateBadge(true);
    ensureAudio(); sfx.click();
    toast(`Nastavené na ${n} 💎`);
    renderPanel(container);
  });
  setWrap.append(setInput, setBtn);
  s3.appendChild(setWrap);
  container.appendChild(s3);

  // — PIN + zamknutie —
  const s4 = el('div', 'parent-section');
  s4.appendChild(el('h3', 'shop-title', '🔑 Nastavenia'));
  const changePin = el('button', 'btn', '🔑 Zmeniť PIN');
  changePin.addEventListener('click', () => {
    const np = prompt('Nový PIN (len číslice, 4–8 znakov):', '');
    if (np === null) return;
    if (!/^\d{4,8}$/.test(np)) { toast('PIN musí mať 4–8 číslic'); return; }
    setPin(np);
    toast('PIN zmenený ✅');
  });
  const lock = el('button', 'btn', '🚪 Zamknúť a späť');
  lock.addEventListener('click', () => { authed = false; location.hash = ''; });
  const row = el('div', 'stack');
  row.append(changePin, lock);
  s4.appendChild(row);
  container.appendChild(s4);
}
