// ===== Jadro: stav, diamanty, pomocné funkcie =====
import { LEVELS } from './data.js';

const LS_PREFIX = 'skolahrou.';

export function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(LS_PREFIX + key);
    return v === null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

export function lsSet(key, value) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch {}
}

// --- diamanty + levely ---
// `diamonds` = minateľné diamanty (obchod), `earned` = celkovo nazbierané (level).
export function getDiamonds() { return lsGet('diamonds', 0); }
export function getEarned() { return lsGet('earned', getDiamonds()); }

export function levelInfo() {
  const earned = getEarned();
  let level = 1, cur = LEVELS[0];
  for (let i = 0; i < LEVELS.length; i++) {
    if (earned >= LEVELS[i].need) { level = i + 1; cur = LEVELS[i]; }
  }
  const next = LEVELS[level] || null;
  const base = cur.need;
  const into = earned - base;
  const span = next ? next.need - base : 1;
  return {
    level, title: cur.title, emoji: cur.emoji, earned, next,
    into, span, pct: next ? Math.min(100, Math.round((into / span) * 100)) : 100,
    toNext: next ? next.need - earned : 0,
  };
}

export function award(n) {
  const before = levelInfo().level;
  const earned = getEarned(); // prečítaj PRED zmenou diamantov (getEarned má fallback na diamanty)
  lsSet('diamonds', getDiamonds() + n);
  lsSet('earned', earned + n);
  updateBadge(true);
  const info = levelInfo();
  if (info.level > before) {
    window.dispatchEvent(new CustomEvent('levelup', { detail: info }));
  }
  return getDiamonds();
}

// minutie diamantov (obchod); vráti true ak bolo dosť
export function spend(n) {
  const d = getDiamonds();
  if (d < n) return false;
  lsSet('diamonds', d - n);
  updateBadge(true);
  return true;
}

export function updateBadge(pulse = false) {
  const span = document.getElementById('diamond-count');
  if (span) span.textContent = getDiamonds();

  const info = levelInfo();
  const lvNum = document.getElementById('level-num');
  const lvEmoji = document.getElementById('level-emoji');
  if (lvNum) lvNum.textContent = info.level;
  if (lvEmoji) lvEmoji.textContent = info.emoji;
  const lvBadge = document.getElementById('level-badge');
  if (lvBadge) lvBadge.title = `Level ${info.level} – ${info.title}`;

  if (pulse && span) {
    const badge = document.getElementById('diamond-badge');
    badge.classList.remove('pulse');
    void badge.offsetWidth; // restart animácie
    badge.classList.add('pulse');
  }
}

// --- písané písmo (globálny prepínač) ---
export function getCursive() { return lsGet('cursive', false); }
export function setCursive(on) { lsSet('cursive', !!on); applyCursive(); }
export function applyCursive() {
  document.body.classList.toggle('cursive', getCursive());
}

// --- DOM pomôcky ---
export function el(tag, cls = '', html = '') {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html) node.innerHTML = html;
  return node;
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Vyberie `count` položiek tak, aby sa neopakovali, kým sa neprejde celý pool.
// `key` odlišuje aktivitu, `idOf` získa identifikátor položky.
export function pickFresh(pool, count, key, idOf = (x) => x) {
  const sk = 'seen.' + key;
  let seen = new Set(lsGet(sk, []));
  let fresh = pool.filter(x => !seen.has(idOf(x)));
  if (fresh.length < count) { seen = new Set(); fresh = pool.slice(); }
  const chosen = shuffle(fresh).slice(0, count);
  chosen.forEach(x => seen.add(idOf(x)));
  lsSet(sk, [...seen]);
  return chosen;
}

// --- epocha obrazovky: časovače z opustenej hry sa už nevykonajú ---
let epoch = 0;
export function newEpoch() { return ++epoch; }
export function later(fn, ms) {
  const e = epoch;
  setTimeout(() => { if (e === epoch) fn(); }, ms);
}

// --- toast ---
let toastTimer = null;
export function toast(msg, ms = 1800) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
}

// --- konfety ---
const CONFETTI = ['🎉', '⭐', '💎', '🟩', '🟨', '🟦', '✨', '🧡'];
export function confetti(count = 14) {
  for (let i = 0; i < count; i++) {
    const bit = el('span', 'confetti-bit', sample(CONFETTI));
    bit.style.left = Math.random() * 92 + 2 + 'vw';
    bit.style.top = Math.random() * 18 + 4 + 'vh';
    bit.style.animationDelay = Math.random() * 0.35 + 's';
    document.body.appendChild(bit);
    setTimeout(() => bit.remove(), 2200);
  }
}

// --- indikátor priebehu (kockové bodky) ---
export function progressDots(total) {
  const wrap = el('div', 'progress-dots');
  for (let i = 0; i < total; i++) wrap.appendChild(el('span', 'dot'));
  return {
    node: wrap,
    set(index, result) {
      // result: 'current' | 'ok' | 'bad'
      const dots = wrap.children;
      if (index >= dots.length) return;
      if (result === 'current') dots[index].classList.add('current');
      else {
        dots[index].classList.remove('current');
        dots[index].classList.add(result === 'ok' ? 'done-ok' : 'done-bad');
      }
    },
  };
}
