// ===== Škola hrou – menu a navigácia =====
import { el, updateBadge, newEpoch, levelInfo, applyCursive, getCursive, setCursive, confetti, toast } from './core.js';
import { GAMES } from './games.js';
import { canSpeak, hasSlovakVoice, ensureAudio, sfx, speak } from './audio.js';
import { renderReport } from './report.js';
import { renderParent } from './parent.js';

const app = document.getElementById('app');
const title = document.getElementById('page-title');
const homeBtn = document.getElementById('btn-home');
const levelBtn = document.getElementById('level-badge');

homeBtn.addEventListener('click', () => { location.hash = ''; });
levelBtn.addEventListener('click', () => {
  const info = levelInfo();
  toast(info.next
    ? `${info.emoji} Level ${info.level} – ${info.title}. Do ďalšieho: ${info.toNext} 💎`
    : `${info.emoji} Level ${info.level} – ${info.title}. Najvyšší level! 👑`);
});

// oslava pri novom leveli
window.addEventListener('levelup', (e) => {
  const info = e.detail;
  ensureAudio();
  sfx.win();
  confetti(24);
  // oneskorene, aby oslavný odkaz prekryl bežnú pochvalu „+1 💎"
  setTimeout(() => {
    toast(`🎉 NOVÝ LEVEL ${info.level}! Si ${info.title} ${info.emoji}`, 3600);
    speak(`Nový level! Si ${info.title}!`, 1);
  }, 900);
});

function renderMenu() {
  title.textContent = 'Škola hrou';
  app.innerHTML = '';

  const info = levelInfo();
  const lvlBox = el('div', 'level-box');
  lvlBox.appendChild(el('div', '', `${info.emoji} <b>Level ${info.level} – ${info.title}</b>`));
  const bar = el('div', 'progress-bar');
  const fill = el('div', 'fill');
  fill.style.width = info.pct + '%';
  bar.appendChild(fill);
  lvlBox.appendChild(bar);
  lvlBox.appendChild(el('div', 'muted',
    info.next ? `Do ďalšieho levelu: ${info.toNext} 💎` : 'Najvyšší level! 👑'));
  app.appendChild(lvlBox);

  app.appendChild(el('p', 'subtitle', 'Ahoj! Vyber si hru 👇'));

  const grid = el('div', 'menu-grid');
  GAMES.forEach(game => {
    const card = el('button', 'menu-card',
      `<span class="emoji">${game.emoji}</span>
       <span class="name">${game.name}</span>
       <span class="desc">${game.desc}</span>`);
    card.addEventListener('click', () => {
      ensureAudio();
      sfx.click();
      location.hash = '#/' + game.id;
    });
    grid.appendChild(card);
  });
  app.appendChild(grid);

  // prepínač písaného písma
  const cursiveRow = el('div', 'settings-row');
  cursiveRow.appendChild(el('span', '', '✍️ Písmo pri čítaní:'));
  const tgl = el('button', 'btn btn-toggle', '');
  const paint = () => { tgl.innerHTML = getCursive() ? '✍️ Písané' : '🅰️ Tlačené'; };
  paint();
  tgl.addEventListener('click', () => { ensureAudio(); sfx.click(); setCursive(!getCursive()); paint(); });
  cursiveRow.appendChild(tgl);
  app.appendChild(cursiveRow);

  if (canSpeak() && !hasSlovakVoice()) {
    setTimeout(() => {
      if (!canSpeak() || hasSlovakVoice() || location.hash) return;
      if (document.getElementById('voice-hint')) return;
      const banner = el('div', 'hint-banner',
        '💡 <b>Tip:</b> Ak hry nehovoria pekne po slovensky, nainštalujte v mobile slovenský hlas ' +
        '(Nastavenia → Systém → Jazyk → Prevod textu na reč, alebo aplikácia „Google rozpoznávanie a syntéza reči").');
      banner.id = 'voice-hint';
      app.insertBefore(banner, app.firstChild);
    }, 1500);
  }

  const parents = el('div', 'parents', `
    <h3>👨‍👩‍👧 Pre rodičov</h3>
    <ul>
      <li><b>Ušká</b> – tréning rozlišovania hlások (Š/Č, S/Š, C/Č, Z/Ž). Slovo zaznie nahlas, dieťa vyberie hlásku, ktorú počulo. Doplnok k logopédii, nenahrádza odborníka.</li>
      <li><b>Zvuky</b> – sluchové vnímanie a počítanie zahraných tónov.</li>
      <li><b>Počítanie</b> – sčítanie/odčítanie do 10 a 20, dopĺňanie čísla a porovnávanie (učivo 1. ročníka). Príklad sa prečíta nahlas po slovensky.</li>
      <li><b>Čítanie</b> – slová, prvé písmená, skladanie slov aj čítanie viet. Prepínač <b>Tlačené/Písané</b> precvičí čítanie písaného písma.</li>
      <li>Pri chybe hra <b>nejde ďalej</b> – dieťa skúša znova, po druhom pokuse sa správna odpoveď rozbliká ako pomôcka.</li>
      <li>Za odpovede zbiera 💎 a stúpa v <b>leveloch</b>; v <b>Mojej dedinke</b> si za diamanty vylepšuje domček (stan → hrad) a donekonečna dokupuje zvieratká, postavičky a ozdoby.</li>
      <li><b>Report</b> nižšie ukáže úspešnosť po zručnostiach a presne <b>v čom sa najviac mýli</b>.</li>
      <li>Zvuk funguje po prvom ťuknutí na obrazovku (pravidlo prehliadača).</li>
    </ul>
  `);
  const reportBtn = el('button', 'btn btn-blue btn-big', '📊 Report pre rodiča');
  reportBtn.addEventListener('click', () => { ensureAudio(); sfx.click(); location.hash = '#/report'; });
  parents.appendChild(reportBtn);
  const parentBtn = el('button', 'btn btn-big', '🔒 Rodičovský vstup (odmeny 💎)');
  parentBtn.addEventListener('click', () => { ensureAudio(); sfx.click(); location.hash = '#/rodic'; });
  parents.appendChild(parentBtn);
  app.appendChild(parents);
}

function render() {
  newEpoch(); // zruší čakajúce časovače z predchádzajúcej obrazovky
  updateBadge(); // obnoví diamanty a level v hlavičke
  const hash = location.hash.replace(/^#\/?/, '');
  window.scrollTo(0, 0);
  if (hash === 'report') {
    title.textContent = '📊 Report';
    app.innerHTML = '';
    renderReport(app);
    return;
  }
  if (hash === 'rodic') {
    title.textContent = '👨‍👩‍👧 Rodič';
    app.innerHTML = '';
    renderParent(app);
    return;
  }
  const game = GAMES.find(g => g.id === hash);
  if (!game) { renderMenu(); return; }
  title.textContent = `${game.emoji} ${game.name}`;
  app.innerHTML = '';
  game.render(app);
}

window.addEventListener('hashchange', render);
applyCursive();
updateBadge();
render();
