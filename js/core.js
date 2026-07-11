// ===== Jadro: stav, diamanty, pomocné funkcie =====

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

// --- diamanty ---
export function getDiamonds() { return lsGet('diamonds', 0); }

export function award(n) {
  const total = getDiamonds() + n;
  lsSet('diamonds', total);
  updateBadge(true);
  return total;
}

export function updateBadge(pulse = false) {
  const span = document.getElementById('diamond-count');
  if (!span) return;
  span.textContent = getDiamonds();
  if (pulse) {
    const badge = document.getElementById('diamond-badge');
    badge.classList.remove('pulse');
    void badge.offsetWidth; // restart animácie
    badge.classList.add('pulse');
  }
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
