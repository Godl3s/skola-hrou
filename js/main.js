// ===== Škola hrou – menu a navigácia =====
import { el, updateBadge, newEpoch } from './core.js';
import { GAMES } from './games.js';
import { canSpeak, hasSlovakVoice, ensureAudio, sfx } from './audio.js';

const app = document.getElementById('app');
const title = document.getElementById('page-title');
const homeBtn = document.getElementById('btn-home');

homeBtn.addEventListener('click', () => { location.hash = ''; });

function renderMenu() {
  title.textContent = 'Škola hrou';
  app.innerHTML = '';
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

  // upozornenie na slovenský hlas (zobrazí sa len ak treba)
  if (canSpeak() && !hasSlovakVoice()) {
    setTimeout(() => {
      if (!canSpeak() || hasSlovakVoice()) return;
      const existing = document.getElementById('voice-hint');
      if (existing || location.hash) return;
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
      <li><b>Ušká</b> – tréning rozlišovania hlások (Š/Č, S/Š, C/Č, Z/Ž). Slovo zaznie nahlas, dieťa vyberie hlásku, ktorú počulo. Je to doplnok k logopédii, nenahrádza odborníka.</li>
      <li><b>Zvuky</b> – sluchové vnímanie a počítanie: dieťa spočíta zahrané tóny.</li>
      <li><b>Počítanie</b> – sčítanie a odčítanie do 10/20 a porovnávanie čísel (učivo 1. ročníka).</li>
      <li><b>Čítanie</b> – veľké tlačené slová, prvé písmená, skladanie slov.</li>
      <li>Za správne odpovede zbiera 💎 diamanty a v <b>Môj domček</b> sa jej za ne stavia pixelový svet.</li>
      <li>Zvuk funguje po prvom ťuknutí na obrazovku (pravidlo prehliadača).</li>
    </ul>
  `);
  app.appendChild(parents);
}

function render() {
  newEpoch(); // zruší čakajúce časovače z predchádzajúcej obrazovky
  const hash = location.hash.replace(/^#\/?/, '');
  const game = GAMES.find(g => g.id === hash);
  window.scrollTo(0, 0);
  if (!game) { renderMenu(); return; }
  title.textContent = `${game.emoji} ${game.name}`;
  app.innerHTML = '';
  game.render(app);
}

window.addEventListener('hashchange', render);
updateBadge();
render();
