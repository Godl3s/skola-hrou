// ===== Kampaň – misie s odmenami =====
import {
  el, award, toast, confetti, lsGet, lsSet,
} from './core.js';
import { ensureAudio, sfx, speak } from './audio.js';
import { getStats } from './stats.js';
import { MISSIONS } from './data.js';

// stav: { idx: číslo aktuálnej misie, base: {missionId: počet správnych pri štarte} }
function getState() { return lsGet('campaign', { idx: 0, base: {} }); }
function saveState(s) { lsSet('campaign', s); }

function correctFor(skill) {
  const s = getStats();
  return (s.bySkill[skill] && s.bySkill[skill].correct) || 0;
}

export const gameKampan = {
  id: 'kampan',
  name: 'Kampaň',
  emoji: '🗺️',
  desc: 'Misie a odmeny',
  render(container) {
    const draw = () => {
      container.innerHTML = '';
      const st = getState();

      container.appendChild(el('p', 'subtitle',
        `Plň misie a zbieraj odmeny! 🗺️ (${Math.min(st.idx, MISSIONS.length)}/${MISSIONS.length})`));

      if (st.idx >= MISSIONS.length) {
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', '👑'));
        panel.appendChild(el('p', '', '<b>Kampaň dokončená!</b> Si ozajstná šampiónka! Ďalšie misie pribudnú v novej verzii. 🎉'));
        const home = el('button', 'btn btn-primary btn-big', '🏠 Domov');
        home.addEventListener('click', () => { location.hash = ''; });
        panel.appendChild(home);
        container.appendChild(panel);
        drawDone(st);
        return;
      }

      const m = MISSIONS[st.idx];
      // zafixuj štartovací počet pri prvom zobrazení misie
      if (st.base[m.id] === undefined) {
        st.base[m.id] = correctFor(m.skill);
        saveState(st);
      }
      const progress = Math.min(m.need, Math.max(0, correctFor(m.skill) - st.base[m.id]));
      const complete = progress >= m.need;

      // aktuálna misia
      const panel = el('div', 'game-panel mission-card');
      panel.appendChild(el('div', 'mission-num', `Misia ${st.idx + 1}`));
      panel.appendChild(el('div', 'big-emoji', m.emoji));
      panel.appendChild(el('h3', 'mission-name', m.name));
      panel.appendChild(el('p', '', m.desc));

      const bar = el('div', 'progress-bar');
      const fill = el('div', 'fill');
      fill.style.width = Math.round((progress / m.need) * 100) + '%';
      bar.appendChild(fill);
      panel.appendChild(bar);
      panel.appendChild(el('p', '', `<b>${progress} / ${m.need}</b> · odmena: <b>+${m.reward} 💎</b>`));

      if (complete) {
        const claim = el('button', 'btn btn-primary btn-big', `🎁 Vyzdvihnúť odmenu +${m.reward} 💎`);
        claim.addEventListener('click', () => {
          ensureAudio();
          award(m.reward);
          sfx.win();
          confetti(20);
          toast(`Misia splnená! +${m.reward} 💎 🎉`, 2600);
          speak('Misia splnená! Výborne!', 1);
          const s2 = getState();
          s2.idx += 1;
          saveState(s2);
          draw();
        });
        panel.appendChild(claim);
      } else {
        const play = el('button', 'btn btn-green btn-big', '▶️ Hrať misiu');
        play.addEventListener('click', () => {
          ensureAudio(); sfx.click();
          location.hash = '#/' + m.route;
        });
        panel.appendChild(play);
      }
      container.appendChild(panel);

      // náhľad ďalšej misie
      const nxt = MISSIONS[st.idx + 1];
      if (nxt) {
        const teaser = el('div', 'mission-teaser',
          `🔒 Ďalšia misia: <b>${nxt.emoji} ${nxt.name}</b> (+${nxt.reward} 💎)`);
        container.appendChild(teaser);
      }

      drawDone(st);
    };

    const drawDone = (st) => {
      const doneCount = Math.min(st.idx, MISSIONS.length);
      if (doneCount === 0) return;
      container.appendChild(el('h3', 'shop-title', '✅ Splnené misie'));
      const list = el('div', 'report-list');
      for (let i = doneCount - 1; i >= 0; i--) {
        const m = MISSIONS[i];
        const row = el('div', 'mission-done');
        row.appendChild(el('span', '', `${m.emoji} <b>${m.name}</b>`));
        row.appendChild(el('span', 'shop-owned', `✔️ +${m.reward} 💎`));
        list.appendChild(row);
      }
      container.appendChild(list);
    };

    draw();
  },
};
