// ===== Profily: prepínanie, premenovanie, prenos medzi zariadeniami =====
import {
  el, toast, confetti, getProfiles, saveProfiles, activeProfileId,
  setActiveProfile, profileSummary, exportProfileData, importProfileData,
  updateBadge,
} from './core.js';
import { ensureAudio, sfx, speak } from './audio.js';

const AVATARS = ['👧', '🧒', '👦', '🦄', '🐱', '🤖', '🦊', '🐼'];
const MAX_PROFILES = 2;

export function renderProfiles(container) {
  container.innerHTML = '';
  const profiles = getProfiles();
  const activeId = activeProfileId();

  container.appendChild(el('p', 'subtitle', 'Kto sa ide hrať? 👇'));

  const list = el('div', 'profile-list');
  profiles.forEach(p => {
    const s = profileSummary(p.id);
    const card = el('div', `profile-card${p.id === activeId ? ' active' : ''}`);
    const face = el('button', 'profile-face', p.emoji);
    face.title = 'Zmeniť obrázok';
    face.addEventListener('click', (e) => {
      e.stopPropagation();
      ensureAudio(); sfx.click();
      const i = AVATARS.indexOf(p.emoji);
      p.emoji = AVATARS[(i + 1) % AVATARS.length];
      saveProfiles(profiles);
      renderProfiles(container);
    });
    card.appendChild(face);

    const info = el('div', 'profile-info');
    info.appendChild(el('div', 'profile-name', p.name));
    info.appendChild(el('div', 'muted', `${s.emoji} Level ${s.level} · 💎 ${s.diamonds}`));
    card.appendChild(info);

    const btns = el('div', 'profile-btns');
    if (p.id === activeId) {
      btns.appendChild(el('span', 'shop-owned', '✅ hrá'));
    } else {
      const pick = el('button', 'btn btn-green', 'Hrať');
      pick.addEventListener('click', () => {
        ensureAudio();
        setActiveProfile(p.id);
        updateBadge();
        sfx.win(); confetti(10);
        toast(`Ahoj, ${p.name}! 👋`, 2000);
        speak(`Ahoj, ${p.name}!`, 1);
        renderProfiles(container);
      });
      btns.appendChild(pick);
    }
    const rename = el('button', 'btn', '✏️');
    rename.title = 'Premenovať';
    rename.addEventListener('click', () => {
      const nn = prompt('Meno profilu:', p.name);
      if (nn === null) return;
      const clean = nn.trim().slice(0, 16);
      if (!clean) return;
      p.name = clean;
      saveProfiles(profiles);
      renderProfiles(container);
    });
    btns.appendChild(rename);
    card.appendChild(btns);
    list.appendChild(card);
  });
  container.appendChild(list);

  if (profiles.length < MAX_PROFILES) {
    const add = el('button', 'btn btn-big', '➕ Pridať druhý profil');
    add.addEventListener('click', () => {
      ensureAudio(); sfx.click();
      const name = prompt('Meno nového profilu:', 'Hráč 2');
      if (name === null) return;
      const clean = name.trim().slice(0, 16) || 'Hráč 2';
      const id = 'p' + Date.now();
      profiles.push({ id, name: clean, emoji: '🧒' });
      saveProfiles(profiles);
      renderProfiles(container);
    });
    container.appendChild(add);
  }

  // — prenos postupu medzi zariadeniami —
  const sec = el('div', 'parent-section');
  sec.appendChild(el('h3', 'shop-title', '📲 Prenos na iné zariadenie'));
  sec.appendChild(el('p', 'muted',
    'Na starom mobile ťukni „Vytvoriť kód" a kód pošli (napr. cez WhatsApp). ' +
    'Na novom mobile ho vlož a ťukni „Nahrať". Prenesie sa postup aktívneho profilu.'));

  const ta = el('textarea', 'sync-code');
  ta.rows = 3;
  ta.placeholder = 'Sem sa vypíše / vloží prenosový kód…';
  sec.appendChild(ta);

  const row = el('div', 'chip-row');
  const make = el('button', 'btn btn-blue', '📤 Vytvoriť kód');
  make.addEventListener('click', async () => {
    ensureAudio(); sfx.click();
    const code = exportProfileData();
    ta.value = code;
    try {
      await navigator.clipboard.writeText(code);
      toast('Kód skopírovaný! 📋 Pošli ho na druhý mobil.', 2600);
    } catch {
      ta.select();
      toast('Kód je v okienku – podrž a skopíruj ho.', 2600);
    }
  });
  const load = el('button', 'btn btn-green', '📥 Nahrať kód');
  load.addEventListener('click', () => {
    ensureAudio();
    const code = ta.value.trim();
    if (!code) { sfx.wrong(); toast('Najprv vlož kód do okienka.'); return; }
    if (!confirm('Nahrať postup z kódu? Prepíše doterajší postup tohto profilu.')) return;
    if (importProfileData(code)) {
      sfx.win(); confetti(14);
      updateBadge();
      toast('Postup nahraný! 🎉', 2400);
      renderProfiles(container);
    } else {
      sfx.wrong();
      toast('Kód sa nepodarilo prečítať – skontroluj, či je celý.');
    }
  });
  row.append(make, load);
  sec.appendChild(row);
  container.appendChild(sec);

  const home = el('button', 'btn btn-primary btn-big', '🏠 Domov');
  home.addEventListener('click', () => { location.hash = ''; });
  container.appendChild(home);
}
