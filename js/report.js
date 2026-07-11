// ===== Report pre rodiča =====
import { el, levelInfo, getDiamonds } from './core.js';
import { getStats, resetStats } from './stats.js';

function pct(correct, attempts) {
  if (!attempts) return 0;
  return Math.round((correct / attempts) * 100);
}

function accClass(p) {
  if (p >= 80) return 'acc-good';
  if (p >= 50) return 'acc-mid';
  return 'acc-low';
}

function fmtDate(t) {
  const d = new Date(t);
  const dd = d.getDate(), mm = d.getMonth() + 1;
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}. ${hh}:${mi}`;
}

export function renderReport(container) {
  const s = getStats();
  const info = levelInfo();
  container.innerHTML = '';

  container.appendChild(el('p', 'subtitle', '📊 Ako sa darí – prehľad pre rodiča'));

  if (s.totals.attempts === 0) {
    container.appendChild(el('div', 'game-panel',
      '<p>Zatiaľ žiadne dáta. Keď si dieťa zahrá pár hier, tu uvidíte, ako mu to ide a v čom sa mýli. 🙂</p>'));
    const back = el('button', 'btn btn-primary btn-big', '🏠 Domov');
    back.addEventListener('click', () => { location.hash = ''; });
    container.appendChild(back);
    return;
  }

  // ---- súhrn ----
  const overall = pct(s.totals.correct, s.totals.attempts);
  const activeDays = Object.keys(s.days).length;
  const cards = el('div', 'report-cards');
  const card = (big, small) => {
    const c = el('div', 'report-card');
    c.appendChild(el('div', 'report-big', big));
    c.appendChild(el('div', 'report-small', small));
    return c;
  };
  cards.appendChild(card(`${info.emoji} ${info.level}`, `Level: ${info.title}`));
  cards.appendChild(card(`${overall}%`, 'úspešnosť na prvý pokus'));
  cards.appendChild(card(String(s.totals.attempts), 'vyriešených úloh'));
  cards.appendChild(card(`💎 ${getDiamonds()}`, 'diamantov teraz'));
  cards.appendChild(card(String(activeDays), activeDays === 1 ? 'deň učenia' : 'dní učenia'));
  if (s.lastPlayed) cards.appendChild(card('🕒', `naposledy ${fmtDate(s.lastPlayed)}`));
  container.appendChild(cards);

  // ---- úspešnosť po zručnostiach ----
  container.appendChild(el('h3', 'shop-title', '🎯 Úspešnosť po zručnostiach'));
  const skills = Object.entries(s.bySkill)
    .sort((a, b) => b[1].attempts - a[1].attempts);
  const skillList = el('div', 'report-list');
  skills.forEach(([, v]) => {
    const p = pct(v.correct, v.attempts);
    const rowEl = el('div', 'report-skill');
    rowEl.appendChild(el('div', 'report-skill-name', `${v.name || '—'} <span class="muted">(${v.correct}/${v.attempts})</span>`));
    const bar = el('div', 'report-bar');
    const fill = el('div', `report-bar-fill ${accClass(p)}`);
    fill.style.width = p + '%';
    fill.textContent = p + '%';
    bar.appendChild(fill);
    rowEl.appendChild(bar);
    skillList.appendChild(rowEl);
  });
  container.appendChild(skillList);

  // ---- kde sa najviac mýli ----
  const topMistakes = Object.entries(s.mistakes)
    .sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (topMistakes.length) {
    container.appendChild(el('h3', 'shop-title', '⚠️ Kde sa najviac mýli'));
    const ml = el('div', 'report-list');
    topMistakes.forEach(([key, count]) => {
      const label = key.split('|').slice(1).join('|');
      const skillId = key.split('|')[0];
      const skillName = (s.bySkill[skillId] && s.bySkill[skillId].name) || '';
      const rowEl = el('div', 'mistake-row');
      rowEl.appendChild(el('span', 'mistake-label', `${label}`));
      rowEl.appendChild(el('span', 'mistake-skill', skillName));
      rowEl.appendChild(el('span', 'mistake-count', `${count}×`));
      ml.appendChild(rowEl);
    });
    container.appendChild(ml);
  }

  // ---- posledné chyby (interaktívny pohľad) ----
  if (s.recent.length) {
    container.appendChild(el('h3', 'shop-title', '🔎 Posledné chyby'));
    const rl = el('div', 'report-list');
    s.recent.slice(0, 12).forEach(m => {
      const rowEl = el('div', 'recent-row');
      rowEl.appendChild(el('div', 'recent-main',
        `<b>${m.label}</b>: dala <span class="bad-txt">„${m.chose}"</span> → správne <span class="ok-txt">„${m.correct}"</span>`));
      rowEl.appendChild(el('div', 'recent-meta', `${m.skillName || ''} · ${fmtDate(m.t)}`));
      rl.appendChild(rowEl);
    });
    container.appendChild(rl);
  }

  // ---- aktivita za posledných 7 dní ----
  container.appendChild(el('h3', 'shop-title', '📅 Aktivita (7 dní)'));
  const week = el('div', 'week-chart');
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  const maxDay = Math.max(1, ...days.map(d => s.days[d.toISOString().slice(0, 10)] || 0));
  const NAMES = ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'];
  days.forEach(d => {
    const n = s.days[d.toISOString().slice(0, 10)] || 0;
    const col = el('div', 'week-col');
    const barWrap = el('div', 'week-bar-wrap');
    const bar = el('div', 'week-bar');
    bar.style.height = Math.round((n / maxDay) * 100) + '%';
    if (n === 0) bar.classList.add('empty');
    barWrap.appendChild(bar);
    col.appendChild(barWrap);
    col.appendChild(el('div', 'week-num', String(n)));
    col.appendChild(el('div', 'week-name', NAMES[d.getDay()]));
    week.appendChild(col);
  });
  container.appendChild(week);

  container.appendChild(el('p', 'muted',
    'Tip: „Ušká" a mikrofón sú zábavný doplnok k logopédii, nie náhrada odborníka. ' +
    'Vyhodnotenie výslovnosti mikrofónom je len približné.'));

  // ---- akcie ----
  const actions = el('div', 'stack');
  const back = el('button', 'btn btn-primary btn-big', '🏠 Domov');
  back.addEventListener('click', () => { location.hash = ''; });
  const reset = el('button', 'btn', '🗑️ Vynulovať štatistiky');
  reset.addEventListener('click', () => {
    if (confirm('Naozaj vymazať všetky štatistiky učenia? (Diamanty a svet ostanú.)')) {
      resetStats();
      renderReport(container);
    }
  });
  actions.append(back, reset);
  container.appendChild(actions);
}
