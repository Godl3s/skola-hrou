// ===== Všetky hry =====
import {
  el, shuffle, randInt, sample, award, spend, toast, confetti,
  progressDots, lsGet, lsSet, getDiamonds, getEarned, levelInfo, later,
  getCursive, setCursive,
} from './core.js';
import {
  speak, canSpeak, sfx, ensureAudio, playCountSounds, COUNT_SOUND_NAMES,
  speakMath, speakNumber, numberToSlovak,
} from './audio.js';
import {
  SOUND_PAIRS, READING_WORDS, BUILD_WORDS, PIXEL_TEMPLATES, FREE_COLORS,
  PRAISES, ENCOURAGE, WORLD, WORLD_BLOCKS, SENTENCES,
  STAMPS, SPRITE_COLORS, DIPHTHONGS, DIPHTHONG_OPTIONS, COUNT_EMOJI, SPELL_WORDS,
} from './data.js';
import { recordResult, recordMistake } from './stats.js';
import { hasSpeechRecognition, listenOnce, matchesWord } from './speech.js';

// ---------- spoločné pomôcky ----------
function praiseNow() {
  const p = sample(PRAISES);
  speak(p, 1);
  return p;
}

function levelScreen(container, introHtml, levels, onPick, extra) {
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

function resultScreen(container, score, total, onAgain) {
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
  const shop = el('button', 'btn btn-green btn-big', '🧱 Môj svet');
  shop.addEventListener('click', () => { location.hash = '#/svet'; });
  const home = el('button', 'btn btn-big', '🎮 Iná hra');
  home.addEventListener('click', () => { location.hash = ''; });
  row.append(again, shop, home);
  panel.appendChild(row);
  container.appendChild(panel);
}

function highlightWord(word, letter) {
  const lower = letter.toLowerCase();
  return word.split('').map(ch =>
    ch.toLowerCase() === lower ? `<span class="hl">${ch}</span>` : ch
  ).join('');
}

function ttsHintBanner() {
  if (!canSpeak()) {
    return el('div', 'hint-banner',
      '🔇 Toto zariadenie nevie čítať nahlas. Slová sa zobrazia napísané – prečítajte ich dieťaťu vy.');
  }
  return null;
}

function cursiveToggle(onChange) {
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
function makeState() { return { firstTry: true, locked: false, tries: 0 }; }

const RETRY_MSGS = ['Skús to ešte raz! 💪', 'Ešte raz to skús! 🙂', 'Nevadí, skús znova! 💪', 'Skúsime znova? 😊'];
function onWrongDefault(st, btn, reveal, mistake) {
  st.firstTry = false;
  st.tries++;
  btn.classList.add('incorrect');
  btn.disabled = true;
  sfx.wrong();
  toast(st.tries >= 2 ? 'Pozri, správna odpoveď svieti! 👉' : sample(RETRY_MSGS));
  if (st.tries === 1 && mistake) recordMistake(mistake);
  if (st.tries >= 2 && reveal) reveal();
}

// zapíše výsledok otázky do štatistík
function trackResult(st, meta) {
  recordResult({ ...meta, firstTry: st.firstTry });
}

// ---------- 1) LOGOPÉDIA ----------
const gameLogopedia = {
  id: 'logopedia',
  name: 'Ušká',
  emoji: '👂',
  desc: 'Š–Č, S–Š, mikrofón',
  render(container) {
    const pick = () => {
      const levels = SOUND_PAIRS.map(p => ({ emoji: '🔊', label: `${p.a} alebo ${p.b}`, pair: p }));
      if (hasSpeechRecognition()) {
        levels.push({ emoji: '🎤', label: 'Povedz slovo (mikrofón)', say: true });
      }
      levelScreen(
        container,
        'Vypočuj slovo a uhádni hlásku – alebo ho sama povedz! 👂',
        levels,
        lvl => (lvl.say ? startSay() : start(lvl.pair))
      );
    };

    const start = (pair) => {
      const TOTAL = 10;
      const words = shuffle(pair.words).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      const skill = `logopedia:${pair.id}`;
      const skillName = `${pair.a}/${pair.b}`;
      let idx = 0, score = 0;
      const ttsOk = canSpeak();

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => start(pair)); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const st = makeState();
        const useCursive = idx % 2 === 1; // strieda tlačené / písané samo
        const shown = useCursive ? item.w : item.w.toUpperCase();

        container.innerHTML = '';
        const banner = ttsHintBanner();
        if (banner) container.appendChild(banner);
        container.appendChild(dots.node);

        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        const wordDisplay = el('div', `word-display read-word${useCursive ? ' cursive-word' : ''}`,
          ttsOk ? '• • •' : shown);
        panel.appendChild(wordDisplay);
        panel.appendChild(el('div', 'script-note', useCursive ? '✍️ písané písmo' : '🅰️ tlačené písmo'));

        if (ttsOk) {
          const replay = el('button', 'btn btn-blue btn-big', '🔊 Vypočuj slovo');
          replay.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(replay);
        }

        panel.appendChild(el('p', '', `Ktorú hlásku počuješ – <b>${pair.a}</b> alebo <b>${pair.b}</b>?`));

        const row = el('div', 'row');
        const btnFor = {};
        const reveal = () => { btnFor[item.t].classList.add('hint'); };
        [pair.a, pair.b].forEach(letter => {
          const b = el('button', 'btn btn-huge', letter);
          btnFor[letter] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (letter === item.t) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              wordDisplay.innerHTML = highlightWord(shown, item.t);
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'logopedia', gameName: 'Ušká', skill, skillName });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal,
                { skill, skillName, label: item.w, chose: letter, correct: item.t });
            }
          });
          row.appendChild(b);
        });
        panel.appendChild(row);
        container.appendChild(panel);

        if (ttsOk) later(() => speak(item.w), 350);
      };
      next();
    };

    // — mikrofón: dieťa povie slovo, appka vyhodnotí —
    const startSay = () => {
      const TOTAL = 6;
      const words = shuffle(READING_WORDS).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      const skill = 'logopedia:say';
      const skillName = 'Výslovnosť 🎤';
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startSay); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const st = makeState();
        let busy = false;

        container.innerHTML = '';
        container.appendChild(el('div', 'hint-banner',
          '🎤 Ťukni na mikrofón a povedz slovo nahlas. Vyhodnotenie je len približné.'));
        container.appendChild(dots.node);

        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        panel.appendChild(el('div', 'word-display read-word', item.w.toUpperCase()));

        if (canSpeak()) {
          const hear = el('button', 'btn btn-blue', '🔊 Vypočuj slovo');
          hear.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(hear);
        }

        const status = el('div', 'mic-status', 'Povedz: <b>' + item.w + '</b>');
        panel.appendChild(status);

        const micBtn = el('button', 'btn btn-green btn-big', '🎤 Povedz slovo');
        const skipBtn = el('button', 'btn', '➡️ Preskočiť');

        const finishOk = () => {
          st.locked = true;
          sfx.correct();
          if (st.firstTry) { score++; award(1); confetti(8); toast(`${praiseNow()} +1 💎`); }
          else toast(praiseNow());
          trackResult(st, { game: 'logopedia', gameName: 'Ušká', skill, skillName });
          status.innerHTML = '✅ Super!';
          dots.set(idx, st.firstTry ? 'ok' : 'bad');
          idx++;
          later(next, 1400);
        };

        micBtn.addEventListener('click', async () => {
          if (busy || st.locked) return;
          busy = true;
          ensureAudio();
          micBtn.disabled = true;
          status.innerHTML = '👂 Počúvam… povedz <b>' + item.w + '</b>';
          const res = await listenOnce('sk-SK');
          busy = false;
          micBtn.disabled = false;
          if (!res.ok) {
            if (res.error === 'not-allowed' || res.error === 'service-not-allowed') {
              status.innerHTML = '🔇 Povoľte mikrofón v prehliadači a skúste znova.';
            } else {
              status.innerHTML = '🤔 Nepočula som ťa, skús ešte raz.';
            }
            return;
          }
          const m = matchesWord(item.w, res.alternatives);
          if (m.match) {
            finishOk();
          } else {
            if (st.firstTry) {
              recordMistake({ skill, skillName, label: item.w, chose: m.heard || '?', correct: item.w });
            }
            st.firstTry = false;
            sfx.wrong();
            status.innerHTML = `🙂 Počula som „<i>${m.heard || '…'}</i>". Skús to povedať zreteľnejšie.`;
          }
        });

        skipBtn.addEventListener('click', () => {
          if (st.locked) return;
          st.locked = true;
          st.firstTry = false;
          trackResult(st, { game: 'logopedia', gameName: 'Ušká', skill, skillName });
          dots.set(idx, 'bad');
          idx++;
          later(next, 400);
        });

        const row = el('div', 'stack');
        row.append(micBtn, skipBtn);
        panel.appendChild(row);
        container.appendChild(panel);

        if (canSpeak()) later(() => speak(item.w), 350);
      };
      next();
    };

    pick();
  },
};

// ---------- 2) POČÚVAJ A POČÍTAJ ----------
const gameZvuky = {
  id: 'zvuky',
  name: 'Zvuky',
  emoji: '🔔',
  desc: 'Počúvaj a počítaj',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Zahrám ti zvuky – spočítaj ich! 🔔',
      [
        { emoji: '🐣', label: 'Počítame do 5', min: 1, max: 5 },
        { emoji: '🦊', label: 'Počítame do 10', min: 3, max: 10 },
      ],
      lvl => start(lvl)
    );

    const start = (lvl) => {
      const TOTAL = 8;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => start(lvl)); return; }
        dots.set(idx, 'current');
        const n = randInt(lvl.min, lvl.max);
        const kind = sample(COUNT_SOUND_NAMES);
        const st = makeState();
        let playing = false;

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        const speaker = el('div', 'big-emoji', '🔊');
        speaker.style.transition = 'transform .15s ease';
        panel.appendChild(speaker);
        panel.appendChild(el('p', '', `Koľko zvukov (${kind}) počuješ?`));

        const playBtn = el('button', 'btn btn-blue btn-big', '▶️ Zahraj zvuky');
        panel.appendChild(playBtn);

        const grid = el('div', 'numbers-grid');
        const numBtns = [];
        const reveal = () => { numBtns[n - 1].classList.add('hint'); };
        for (let i = 1; i <= lvl.max; i++) {
          const b = el('button', 'btn', String(i));
          b.disabled = true;
          b.addEventListener('click', () => {
            if (st.locked || playing || b.disabled) return;
            ensureAudio();
            if (i === n) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'zvuky', gameName: 'Zvuky', skill: 'zvuky', skillName: 'Počúvanie zvukov' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal,
                { skill: 'zvuky', skillName: 'Počúvanie zvukov', label: `${kind} × ${n}`, chose: i, correct: n });
            }
          });
          numBtns.push(b);
          grid.appendChild(b);
        }
        panel.appendChild(grid);
        container.appendChild(panel);

        playBtn.addEventListener('click', async () => {
          if (playing || st.locked) return;
          playing = true;
          playBtn.disabled = true;
          ensureAudio();
          await playCountSounds(n, kind, () => {
            speaker.style.transform = 'scale(1.35)';
            setTimeout(() => { speaker.style.transform = 'scale(1)'; }, 180);
          });
          playing = false;
          playBtn.disabled = false;
          playBtn.innerHTML = '🔁 Vypočuj ešte raz';
          numBtns.forEach(b => { if (!b.classList.contains('incorrect')) b.disabled = false; });
        });
      };
      next();
    };

    pick();
  },
};

// ---------- 3) MATEMATIKA ----------
const MATIKA_NAMES = {
  add10: 'Sčítanie do 10', sub10: 'Odčítanie do 10', mix20: 'Plus/mínus do 20',
  missing: 'Doplň číslo', compare: 'Porovnávanie', count: 'Počítanie predmetov',
};
function makeOptions(ans, max = 20) {
  const set = new Set([ans]);
  const candidates = shuffle([ans - 1, ans + 1, ans - 2, ans + 2, ans + 3, ans - 3, ans + 4, ans - 4]);
  for (const c of candidates) {
    if (set.size >= 4) break;
    if (c >= 0 && c <= max) set.add(c);
  }
  let x = 0;
  while (set.size < 4 && x <= max) { set.add(x); x++; }
  return shuffle([...set]);
}

const gameMatika = {
  id: 'matika',
  name: 'Počítanie',
  emoji: '🧮',
  desc: 'Plus a mínus do 20',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Vyber si, čo budeme počítať! 🧮',
      [
        { emoji: '🍎', label: 'Koľko ich je?', type: 'count' },
        { emoji: '➕', label: 'Sčítanie do 10', type: 'add10' },
        { emoji: '➖', label: 'Odčítanie do 10', type: 'sub10' },
        { emoji: '🚀', label: 'Plus a mínus do 20', type: 'mix20' },
        { emoji: '🧩', label: 'Doplň číslo (5 + ▢ = 8)', type: 'missing' },
        { emoji: '⚖️', label: 'Porovnaj čísla', type: 'compare' },
      ],
      lvl => (lvl.type === 'compare' ? startCompare(lvl)
        : lvl.type === 'missing' ? startMissing(lvl)
        : lvl.type === 'count' ? startCount(lvl) : start(lvl))
    );

    const genProblem = (type) => {
      if (type === 'add10') {
        const a = randInt(0, 10);
        const b = randInt(0, 10 - a);
        if (a + b === 0) return genProblem(type);
        return { a, b, op: '+', ans: a + b, max: 10 };
      }
      if (type === 'sub10') {
        const a = randInt(1, 10);
        const b = randInt(0, a);
        return { a, b, op: '−', ans: a - b, max: 10 };
      }
      if (Math.random() < 0.5) {
        const a = randInt(1, 19);
        const b = randInt(1, 20 - a);
        return { a, b, op: '+', ans: a + b, max: 20 };
      }
      const a = randInt(2, 20);
      const b = randInt(1, a - 1);
      return { a, b, op: '−', ans: a - b, max: 20 };
    };

    const start = (lvl) => {
      const TOTAL = 10;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => start(lvl)); return; }
        dots.set(idx, 'current');
        const p = genProblem(lvl.type);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', `${p.a} ${p.op} ${p.b} = ?`));

        const replay = el('button', 'btn btn-blue', '🔊 Prečítaj príklad');
        replay.addEventListener('click', () => { ensureAudio(); speakMath(p.a, p.b, p.op); });
        panel.appendChild(replay);

        if (p.a <= 10 && p.b <= 10) {
          if (p.op === '+') {
            panel.appendChild(el('div', 'math-blocks', '🟩'.repeat(p.a) + '🟨'.repeat(p.b)));
          } else {
            panel.appendChild(el('div', 'math-blocks', '🟦'.repeat(p.ans) + '🟥'.repeat(p.b)));
            if (p.b > 0) panel.appendChild(el('p', '', '<small>🟥 = tie zoberieme preč</small>'));
          }
        }

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[p.ans]) btnFor[p.ans].classList.add('hint'); };
        makeOptions(p.ans, p.max).forEach(opt => {
          const b = el('button', 'btn', String(opt));
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === p.ans) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'matika', gameName: 'Počítanie', skill: `matika:${lvl.type}`, skillName: MATIKA_NAMES[lvl.type] });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1500);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: `matika:${lvl.type}`, skillName: MATIKA_NAMES[lvl.type],
                label: `${p.a} ${p.op} ${p.b}`, chose: opt, correct: p.ans,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        later(() => speakMath(p.a, p.b, p.op), 350);
      };
      next();
    };

    const startMissing = (lvl) => {
      const TOTAL = 10;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const gen = () => {
        const a = randInt(1, 9);
        const b = randInt(1, 9);
        const c = a + b;
        if (Math.random() < 0.5) return { text: `${a} + ▢ = ${c}`, ans: b, a, c, first: true };
        return { text: `▢ + ${b} = ${c}`, ans: a, b, c, first: false };
      };
      const say = (p) => {
        if (p.first) speak(`${numberToSlovak(p.a)} plus koľko je ${numberToSlovak(p.c)}?`, 0.85);
        else speak(`Koľko plus ${numberToSlovak(p.b)} je ${numberToSlovak(p.c)}?`, 0.85);
      };

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => startMissing(lvl)); return; }
        dots.set(idx, 'current');
        const p = gen();
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', p.text));
        panel.appendChild(el('p', '', 'Aké číslo patrí do políčka ▢?'));

        const replay = el('button', 'btn btn-blue', '🔊 Prečítaj príklad');
        replay.addEventListener('click', () => { ensureAudio(); say(p); });
        panel.appendChild(replay);

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[p.ans]) btnFor[p.ans].classList.add('hint'); };
        makeOptions(p.ans, 12).forEach(opt => {
          const b = el('button', 'btn', String(opt));
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === p.ans) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'matika', gameName: 'Počítanie', skill: 'matika:missing', skillName: MATIKA_NAMES.missing });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1500);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'matika:missing', skillName: MATIKA_NAMES.missing,
                label: p.text, chose: opt, correct: p.ans,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        later(() => say(p), 350);
      };
      next();
    };

    const startCount = (lvl) => {
      const TOTAL = 10;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => startCount(lvl)); return; }
        dots.set(idx, 'current');
        const n = randInt(1, 10);
        const emoji = sample(COUNT_EMOJI);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('p', '', `Koľko je tu <b>${emoji}</b>? Spočítaj ich!`));
        panel.appendChild(el('div', 'count-items', emoji.repeat(n)));

        const grid = el('div', 'numbers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[n]) btnFor[n].classList.add('hint'); };
        for (let i = 1; i <= 10; i++) {
          const b = el('button', 'btn', String(i));
          btnFor[i] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (i === n) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speakNumber(n);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'matika', gameName: 'Počítanie', skill: 'matika:count', skillName: MATIKA_NAMES.count });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1500);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'matika:count', skillName: MATIKA_NAMES.count,
                label: `${emoji} × ${n}`, chose: i, correct: n,
              });
            }
          });
          grid.appendChild(b);
        }
        panel.appendChild(grid);
        container.appendChild(panel);
      };
      next();
    };

    const startCompare = (lvl) => {
      const TOTAL = 10;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => startCompare(lvl)); return; }
        dots.set(idx, 'current');
        const a = randInt(0, 10);
        const b = Math.random() < 0.25 ? a : randInt(0, 10);
        const correct = a < b ? '<' : (a > b ? '>' : '=');
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', `${a} ❓ ${b}`));
        panel.appendChild(el('div', 'math-blocks', '🟦'.repeat(a) || '⬜'));
        panel.appendChild(el('div', 'math-blocks', '🟥'.repeat(b) || '⬜'));
        panel.appendChild(el('p', '', `Je ${a} menej, rovnako alebo viac ako ${b}?`));

        const grid = el('div', 'answers-grid cols-3');
        const btnFor = {};
        const reveal = () => { if (btnFor[correct]) btnFor[correct].classList.add('hint'); };
        [
          { sym: '<', label: 'menej' },
          { sym: '=', label: 'rovnako' },
          { sym: '>', label: 'viac' },
        ].forEach(o => {
          const b2 = el('button', 'btn', `${o.sym}<br><small>${o.label}</small>`);
          btnFor[o.sym] = b2;
          b2.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (o.sym === correct) {
              st.locked = true;
              b2.classList.add('correct');
              b2.classList.remove('hint');
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'matika', gameName: 'Počítanie', skill: 'matika:compare', skillName: MATIKA_NAMES.compare });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1500);
            } else {
              onWrongDefault(st, b2, reveal, {
                skill: 'matika:compare', skillName: MATIKA_NAMES.compare,
                label: `${a} ? ${b}`, chose: o.sym, correct,
              });
            }
          });
          grid.appendChild(b2);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        later(() => speak(`Porovnaj: ${numberToSlovak(a)} a ${numberToSlovak(b)}.`, 0.9), 350);
      };
      next();
    };

    pick();
  },
};

// ---------- 4) ČÍTANIE ----------
const gameCitanie = {
  id: 'citanie',
  name: 'Čítanie',
  emoji: '📖',
  desc: 'Slová, hláskovanie, dvojhlásky',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Poďme čítať! 📖',
      [
        { emoji: '🖼️', label: 'Obrázok a slovo', mode: 'match' },
        { emoji: '🔤', label: 'Prvé písmenko', mode: 'first' },
        { emoji: '🧩', label: 'Poskladaj slovo', mode: 'build' },
        { emoji: '🔠', label: 'Hláskovanie', mode: 'spell' },
        { emoji: '🅰️', label: 'Dvojhlásky ia ie iu ô', mode: 'diphthong' },
        { emoji: '📜', label: 'Čítaj vetu', mode: 'sentence' },
      ],
      lvl => {
        if (lvl.mode === 'match') startMatch();
        else if (lvl.mode === 'first') startFirst();
        else if (lvl.mode === 'build') startBuild();
        else if (lvl.mode === 'spell') startSpell();
        else if (lvl.mode === 'diphthong') startDiphthong();
        else startSentence();
      },
      cursiveToggle()
    );

    // — obrázok a slovo —
    const startMatch = () => {
      const TOTAL = 8;
      const words = shuffle(READING_WORDS).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startMatch); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const distractors = shuffle(READING_WORDS.filter(x => x.w !== item.w)).slice(0, 2);
        const options = shuffle([item, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        panel.appendChild(el('p', '', 'Ktoré slovo patrí k obrázku?'));

        const stack = el('div', 'stack');
        const btnFor = {};
        const reveal = () => { btnFor[item.w].classList.add('hint'); };
        options.forEach(o => {
          const b = el('button', 'btn btn-big read-word', o.w.toUpperCase());
          btnFor[o.w] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (o.w === item.w) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(item.w);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'citanie', gameName: 'Čítanie', skill: 'citanie:match', skillName: 'Obrázok a slovo' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'citanie:match', skillName: 'Obrázok a slovo',
                label: item.w, chose: o.w, correct: item.w,
              });
            }
          });
          stack.appendChild(b);
        });
        panel.appendChild(stack);
        container.appendChild(panel);
      };
      next();
    };

    // — prvé písmenko —
    const startFirst = () => {
      const TOTAL = 8;
      const ALPHABET = 'ABCČDEFGHJKLMNOPRSŠTUVZŽ'.split('');
      const words = shuffle(READING_WORDS).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startFirst); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const correct = item.w[0].toUpperCase();
        const distractors = shuffle(ALPHABET.filter(l => l !== correct)).slice(0, 3);
        const options = shuffle([correct, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        if (canSpeak()) {
          const replay = el('button', 'btn btn-blue', '🔊 Vypočuj slovo');
          replay.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(replay);
        } else {
          panel.appendChild(el('div', 'word-display read-word', item.w.toUpperCase()));
        }
        panel.appendChild(el('p', '', 'Akým písmenkom sa slovo začína?'));

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { btnFor[correct].classList.add('hint'); };
        options.forEach(letter => {
          const b = el('button', 'btn', letter);
          btnFor[letter] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (letter === correct) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              const wd = el('div', 'word-display read-word', highlightWord(item.w.toUpperCase(), correct));
              panel.insertBefore(wd, grid);
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'citanie', gameName: 'Čítanie', skill: 'citanie:first', skillName: 'Prvé písmenko' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'citanie:first', skillName: 'Prvé písmenko',
                label: `${item.w} (${correct}?)`, chose: letter, correct,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        if (canSpeak()) later(() => speak(item.w), 350);
      };
      next();
    };

    // — poskladaj slovo —
    const startBuild = () => {
      const TOTAL = 6;
      const words = shuffle(BUILD_WORDS).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startBuild); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const target = item.w.toUpperCase();
        let letters = shuffle(target.split(''));
        if (letters.join('') === target) letters = letters.reverse();
        let filled = [];
        let fails = 0;
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        if (canSpeak()) {
          const replay = el('button', 'btn btn-blue', '🔊 Vypočuj slovo');
          replay.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(replay);
        }
        const hint = el('p', '', 'Poskladaj slovo z písmeniek!');
        panel.appendChild(hint);

        const slots = el('div', 'slots');
        const slotEls = [];
        for (let i = 0; i < target.length; i++) {
          const s = el('div', 'slot', '');
          slots.appendChild(s);
          slotEls.push(s);
        }
        panel.appendChild(slots);

        const tiles = el('div', 'letter-tiles');
        const tileEls = [];
        letters.forEach((letter, tileIndex) => {
          const t = el('button', 'btn', letter);
          t.addEventListener('click', () => {
            if (st.locked || filled.length >= target.length) return;
            ensureAudio();
            sfx.click();
            t.classList.add('used');
            slotEls[filled.length].textContent = letter;
            slotEls[filled.length].classList.add('filled');
            filled.push({ letter, tileIndex });
            if (filled.length === target.length) check();
          });
          tiles.appendChild(t);
          tileEls.push(t);
        });
        panel.appendChild(tiles);

        const undo = el('button', 'btn', '↩️ Zmaž písmenko');
        undo.addEventListener('click', () => {
          if (st.locked || filled.length === 0) return;
          const last = filled.pop();
          tileEls[last.tileIndex].classList.remove('used');
          slotEls[filled.length].textContent = '';
          slotEls[filled.length].classList.remove('filled');
        });
        panel.appendChild(undo);
        container.appendChild(panel);

        const check = () => {
          const built = filled.map(f => f.letter).join('');
          if (built === target) {
            st.locked = true;
            sfx.correct();
            const firstTry = fails === 0;
            if (firstTry) { score++; award(1); }
            confetti(8);
            speak(item.w);
            toast(firstTry ? `${sample(PRAISES)} +1 💎` : sample(PRAISES));
            recordResult({ game: 'citanie', gameName: 'Čítanie', skill: 'citanie:build', skillName: 'Skladanie slov', firstTry });
            dots.set(idx, firstTry ? 'ok' : 'bad');
            idx++;
            later(next, 1700);
          } else {
            fails++;
            sfx.wrong();
            if (fails === 1) recordMistake({ skill: 'citanie:build', skillName: 'Skladanie slov', label: item.w, chose: built || '—', correct: target });
            slotEls.forEach(s => s.classList.add('wiggle'));
            toast('Skoro! Skús písmenká inak. 🙂');
            if (fails >= 2) hint.innerHTML = `Pomôcka: slovo je <b class="read-word">${target}</b>`;
            setTimeout(() => {
              slotEls.forEach(s => {
                s.classList.remove('wiggle', 'filled');
                s.textContent = '';
              });
              tileEls.forEach(t => t.classList.remove('used'));
              filled = [];
            }, 800);
          }
        };

        if (canSpeak()) later(() => speak(item.w), 350);
      };
      next();
    };

    // — čítaj vetu (samostatné čítanie, aj písané písmo) —
    const startSentence = () => {
      const TOTAL = 6;
      const items = shuffle(SENTENCES).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      let idx = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, TOTAL, TOTAL, startSentence); return; }
        dots.set(idx, 'current');
        const item = items[idx];

        container.innerHTML = '';
        container.appendChild(cursiveToggle());
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        panel.appendChild(el('div', 'sentence read-word', item.s));
        panel.appendChild(el('p', '', 'Prečítaj vetu nahlas. 📣'));

        const row = el('div', 'stack');
        if (canSpeak()) {
          const hear = el('button', 'btn btn-blue', '🔊 Vypočuj vetu');
          hear.addEventListener('click', () => { ensureAudio(); speak(item.s, 0.8); });
          row.appendChild(hear);
        }
        const done = el('button', 'btn btn-green btn-big', '✅ Prečítal(a) som!');
        done.addEventListener('click', () => {
          ensureAudio();
          sfx.correct();
          award(1);
          confetti(6);
          toast(`${sample(PRAISES)} +1 💎`);
          recordResult({ game: 'citanie', gameName: 'Čítanie', skill: 'citanie:sentence', skillName: 'Čítanie viet', firstTry: true });
          dots.set(idx, 'ok');
          idx++;
          later(next, 900);
        });
        row.appendChild(done);
        panel.appendChild(row);
        container.appendChild(panel);
      };
      next();
    };

    // — hláskovanie (spelovanie) —
    const startSpell = () => {
      const TOTAL = 6;
      const words = shuffle(SPELL_WORDS).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      let idx = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, TOTAL, TOTAL, startSpell); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const letters = item.w.toUpperCase().split('');

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));

        const slots = el('div', 'slots');
        const tiles = letters.map(ch => {
          const s = el('div', 'slot filled read-word', ch);
          slots.appendChild(s);
          return s;
        });
        panel.appendChild(slots);
        panel.appendChild(el('p', '', 'Počúvaj, ako sa slovo hláskuje. 🔠'));

        const hlaskuj = () => {
          const seq = item.w.split('');
          let k = 0;
          const step = () => {
            tiles.forEach(t => t.classList.remove('lit'));
            if (k >= seq.length) { speak(item.w); return; }
            tiles[k].classList.add('lit');
            speak(seq[k], 0.9);
            k++;
            later(step, 780);
          };
          step();
        };

        const say = el('button', 'btn btn-blue btn-big', '🔊 Hláskuj slovo');
        say.addEventListener('click', () => { ensureAudio(); hlaskuj(); });
        panel.appendChild(say);

        const done = el('button', 'btn btn-green btn-big', '✅ Zopakoval(a) som!');
        done.addEventListener('click', () => {
          ensureAudio();
          sfx.correct();
          award(1);
          confetti(6);
          speak(item.w);
          toast(`${sample(PRAISES)} +1 💎`);
          recordResult({ game: 'citanie', gameName: 'Čítanie', skill: 'citanie:spell', skillName: 'Hláskovanie', firstTry: true });
          dots.set(idx, 'ok');
          idx++;
          later(next, 900);
        });
        panel.appendChild(done);
        container.appendChild(panel);

        later(hlaskuj, 400);
      };
      next();
    };

    // — dvojhlásky ia / ie / iu / ô —
    const startDiphthong = () => {
      const TOTAL = 8;
      const words = shuffle(DIPHTHONGS).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      const skill = 'citanie:diphthong';
      const skillName = 'Dvojhlásky';
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startDiphthong); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const st = makeState();
        const blank = item.w.replace(item.d, '▢').toUpperCase();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        const wordDisplay = el('div', 'word-display read-word', blank);
        panel.appendChild(wordDisplay);

        if (canSpeak()) {
          const hear = el('button', 'btn btn-blue', '🔊 Vypočuj slovo');
          hear.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(hear);
        }
        panel.appendChild(el('p', '', 'Ktorá dvojhláska patrí do slova?'));

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[item.d]) btnFor[item.d].classList.add('hint'); };
        DIPHTHONG_OPTIONS.forEach(opt => {
          const b = el('button', 'btn', opt);
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === item.d) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              wordDisplay.innerHTML = item.w.toUpperCase().replace(item.d.toUpperCase(), `<span class="hl">${item.d.toUpperCase()}</span>`);
              sfx.correct();
              speak(item.w);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'citanie', gameName: 'Čítanie', skill, skillName });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal,
                { skill, skillName, label: item.w, chose: opt, correct: item.d });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        if (canSpeak()) later(() => speak(item.w), 350);
      };
      next();
    };

    pick();
  },
};

// ---------- 5) MAĽOVANKA ----------
function drawPreview(canvas, tpl) {
  const rows = tpl.grid.length;
  const cols = tpl.grid[0].length;
  const px = 8;
  canvas.width = cols * px;
  canvas.height = rows * px;
  const ctx = canvas.getContext('2d');
  const colorFor = {};
  tpl.palette.forEach(p => { colorFor[p.ch] = p.color; });
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = tpl.grid[r][c];
      if (ch === '.' || !colorFor[ch]) continue;
      ctx.fillStyle = colorFor[ch];
      ctx.fillRect(c * px, r * px, px, px);
    }
  }
}

function enablePainting(grid, paintFn, selector = '.cell') {
  let painting = false;
  grid.addEventListener('pointerdown', e => {
    painting = true;
    const cell = e.target.closest(selector);
    if (cell) paintFn(cell, true);
  });
  grid.addEventListener('pointermove', e => {
    if (!painting) return;
    e.preventDefault();
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const cell = hit && hit.closest ? hit.closest(selector) : null;
    if (cell && grid.contains(cell)) paintFn(cell, false);
  });
  ['pointerup', 'pointercancel'].forEach(ev =>
    window.addEventListener(ev, () => { painting = false; })
  );
}

const gameMalovanka = {
  id: 'malovanka',
  name: 'Maľovanka',
  emoji: '🎨',
  desc: 'Pixelové obrázky',
  render(container) {
    const pick = () => {
      container.innerHTML = '';
      container.appendChild(el('p', 'subtitle', 'Vyber si obrázok a vymaľuj ho podľa čísel! 🎨'));
      const grid = el('div', 'template-grid');

      PIXEL_TEMPLATES.forEach(tpl => {
        const card = el('div', 'template-card');
        const canvas = document.createElement('canvas');
        drawPreview(canvas, tpl);
        card.appendChild(canvas);
        card.appendChild(el('span', 'name', `${tpl.emoji} ${tpl.name}`));
        card.addEventListener('click', () => { ensureAudio(); sfx.click(); startColorByNumber(tpl); });
        grid.appendChild(card);
      });

      const freeCard = el('div', 'template-card');
      freeCard.appendChild(el('div', 'big-emoji', '✏️'));
      freeCard.appendChild(el('span', 'name', 'Voľné maľovanie'));
      freeCard.addEventListener('click', () => { ensureAudio(); sfx.click(); startFree(); });
      grid.appendChild(freeCard);

      container.appendChild(grid);
    };

    const startColorByNumber = (tpl) => {
      container.innerHTML = '';
      const panel = el('div', 'game-panel');
      panel.appendChild(el('p', 'subtitle', `${tpl.emoji} ${tpl.name} – vymaľuj podľa čísel!`));

      let selected = tpl.palette[0].ch;
      let remaining = 0;
      let done = false;

      const palette = el('div', 'palette');
      const swatches = {};
      tpl.palette.forEach((p, i) => {
        const s = el('button', 'swatch', String(i + 1));
        s.style.background = p.color;
        s.title = p.name;
        if (i === 0) s.classList.add('selected');
        s.addEventListener('click', () => {
          ensureAudio(); sfx.click();
          selected = p.ch;
          Object.values(swatches).forEach(x => x.classList.remove('selected'));
          s.classList.add('selected');
        });
        swatches[p.ch] = s;
        palette.appendChild(s);
      });
      panel.appendChild(palette);

      const numFor = {};
      const colorFor = {};
      tpl.palette.forEach((p, i) => { numFor[p.ch] = i + 1; colorFor[p.ch] = p.color; });

      const rows = tpl.grid.length;
      const cols = tpl.grid[0].length;
      const grid = el('div', 'pixel-grid');
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ch = tpl.grid[r][c];
          const cell = el('div', 'cell');
          if (ch === '.') {
            cell.classList.add('empty');
          } else {
            cell.dataset.ch = ch;
            cell.textContent = numFor[ch];
            remaining++;
          }
          grid.appendChild(cell);
        }
      }
      panel.appendChild(grid);

      const progress = el('p', '', '');
      const updateProgress = () => {
        progress.innerHTML = remaining > 0 ? `Ešte <b>${remaining}</b> políčok 🖌️` : '';
      };
      updateProgress();
      panel.appendChild(progress);

      const backBtn = el('button', 'btn', '🖼️ Iný obrázok');
      backBtn.addEventListener('click', pick);
      panel.appendChild(backBtn);

      enablePainting(grid, (cell, isTap) => {
        if (done || cell.classList.contains('empty') || cell.classList.contains('filled')) return;
        if (cell.dataset.ch === selected) {
          cell.style.background = colorFor[selected];
          cell.classList.add('filled');
          remaining--;
          updateProgress();
          if (remaining === 0) finish();
        } else if (isTap) {
          cell.classList.remove('wiggle');
          void cell.offsetWidth;
          cell.classList.add('wiggle');
        }
      });

      const finish = () => {
        done = true;
        sfx.win();
        confetti(20);
        award(4);
        toast('Nádherný obrázok! +4 💎', 2600);
        speak('Nádherný obrázok!', 1);
      };

      container.appendChild(panel);
    };

    const startFree = () => {
      container.innerHTML = '';
      const panel = el('div', 'game-panel');
      panel.appendChild(el('p', 'subtitle', '✏️ Maľuj, ako chceš!'));

      let selected = FREE_COLORS[0];

      const palette = el('div', 'palette');
      const swatchEls = [];
      FREE_COLORS.forEach((color, i) => {
        const s = el('button', 'swatch', '');
        s.style.background = color;
        if (i === 0) s.classList.add('selected');
        s.addEventListener('click', () => {
          ensureAudio(); sfx.click();
          selected = color;
          swatchEls.forEach(x => x.classList.remove('selected'));
          eraser.classList.remove('selected');
          s.classList.add('selected');
        });
        swatchEls.push(s);
        palette.appendChild(s);
      });
      const eraser = el('button', 'swatch', '🧽');
      eraser.style.background = '#fff';
      eraser.addEventListener('click', () => {
        ensureAudio(); sfx.click();
        selected = '';
        swatchEls.forEach(x => x.classList.remove('selected'));
        eraser.classList.add('selected');
      });
      palette.appendChild(eraser);
      panel.appendChild(palette);

      const SIZE = 12;
      const grid = el('div', 'pixel-grid');
      grid.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
      for (let i = 0; i < SIZE * SIZE; i++) grid.appendChild(el('div', 'cell'));
      panel.appendChild(grid);

      enablePainting(grid, (cell) => {
        cell.style.background = selected || '#fff';
      });

      const row = el('div', 'stack');
      const doneBtn = el('button', 'btn btn-primary btn-big', '✨ Hotovo!');
      doneBtn.addEventListener('click', () => {
        ensureAudio();
        sfx.win();
        confetti(16);
        award(2);
        toast('Krásne dielo! +2 💎', 2400);
      });
      const clear = el('button', 'btn', '🧹 Zmaž všetko');
      clear.addEventListener('click', () => {
        grid.querySelectorAll('.cell').forEach(c => { c.style.background = '#fff'; });
      });
      const backBtn = el('button', 'btn', '🖼️ Iný obrázok');
      backBtn.addEventListener('click', pick);
      row.append(doneBtn, clear, backBtn);
      panel.appendChild(row);

      container.appendChild(panel);
    };

    pick();
  },
};

// ---------- 6) MÔJ SVET (stavanie z kociek) ----------
const gameSvet = {
  id: 'svet',
  name: 'Môj svet',
  emoji: '🧱',
  desc: 'Kupuj domy a postavičky',
  render(container) {
    const blockById = {};
    WORLD_BLOCKS.forEach(b => { blockById[b.id] = b; });
    const stampById = {};
    STAMPS.forEach(s => { stampById[s.id] = s; });
    const N = WORLD.cols * WORLD.rows;
    const state = { selected: 'grass', eraser: false, stamp: null };

    // načítaj / vytvor svet
    let world = lsGet('world', null);
    const freshGround = () => {
      const w = new Array(N).fill(null);
      for (let c = 0; c < WORLD.cols; c++) {
        w[(WORLD.rows - 1) * WORLD.cols + c] = 'dirt';
        w[(WORLD.rows - 2) * WORLD.cols + c] = 'grass';
      }
      return w;
    };
    if (!Array.isArray(world) || world.length !== N) world = freshGround();
    const save = () => lsSet('world', world);

    const applyBlock = (cell, id) => {
      cell.className = 'wcell';
      cell.textContent = '';
      cell.style.background = '';
      if (!id) return;
      if (typeof id === 'string' && id.startsWith('e:')) {
        cell.textContent = id.slice(2);
        cell.classList.add('has-emoji', 'placed');
        return;
      }
      const b = blockById[id];
      if (b) {
        if (b.color) cell.style.background = b.color;
        if (b.emoji) { cell.textContent = b.emoji; cell.classList.add('has-emoji'); }
        cell.classList.add('placed');
        if (id === 'glass') cell.classList.add('glass');
        return;
      }
      if (SPRITE_COLORS[id]) {
        cell.style.background = SPRITE_COLORS[id];
        cell.classList.add('placed');
      }
    };

    const draw = () => {
      container.innerHTML = '';
      const unlocked = new Set(lsGet('blocks', ['grass', 'dirt']));
      const unlockedStamps = new Set(lsGet('stamps', []));
      const info = levelInfo();

      // level pruh
      const lvlBox = el('div', 'level-box');
      lvlBox.appendChild(el('div', '', `${info.emoji} <b>Level ${info.level} – ${info.title}</b>`));
      const bar = el('div', 'progress-bar');
      const fill = el('div', 'fill');
      fill.style.width = info.pct + '%';
      bar.appendChild(fill);
      lvlBox.appendChild(bar);
      container.appendChild(lvlBox);

      container.appendChild(el('p', 'subtitle',
        'Kúp si domy a postavičky za 💎 a ťuknutím ich polož – alebo stavaj z kociek! 🏗️'));

      // mriežka sveta
      const grid = el('div', 'world-grid');
      grid.style.gridTemplateColumns = `repeat(${WORLD.cols}, 1fr)`;
      const cellEls = [];
      for (let i = 0; i < N; i++) {
        const cell = el('div', 'wcell');
        cell.dataset.i = i;
        applyBlock(cell, world[i]);
        grid.appendChild(cell);
        cellEls.push(cell);
      }
      container.appendChild(grid);

      const placeStamp = (i) => {
        const stamp = state.stamp;
        if (!stamp) return;
        const cols = WORLD.cols, rows = WORLD.rows;
        const H = stamp.rows.length;
        const W = Math.max(...stamp.rows.map(r => r.length));
        const r = Math.floor(i / cols), c = i % cols;
        const ar = Math.min(Math.max(r, 0), rows - H);
        const ac = Math.min(Math.max(c, 0), cols - W);
        for (let dr = 0; dr < H; dr++) {
          const rowArr = stamp.rows[dr];
          for (let dc = 0; dc < rowArr.length; dc++) {
            const id = rowArr[dc];
            if (!id || id === '.') continue;
            const wi = (ar + dr) * cols + (ac + dc);
            world[wi] = id;
            applyBlock(cellEls[wi], id);
          }
        }
        save();
        sfx.place();
        confetti(6);
      };

      enablePainting(grid, (cell, isTap) => {
        const i = +cell.dataset.i;
        if (state.stamp) {
          if (isTap) placeStamp(i);
          return;
        }
        if (state.eraser) {
          world[i] = null;
        } else {
          if (!state.selected || !unlocked.has(state.selected)) return;
          world[i] = state.selected;
        }
        applyBlock(cell, world[i]);
        save();
      }, '.wcell');

      // — výber / zvýraznenie —
      const swFor = {};        // bloky
      const stampSwFor = {};   // stampy
      let eraserBtn;
      const clearSel = () => {
        Object.values(swFor).forEach(s => s.classList.remove('sel'));
        Object.values(stampSwFor).forEach(s => s.classList.remove('sel'));
        if (eraserBtn) eraserBtn.classList.remove('sel');
      };
      const selectBlock = (id) => {
        state.selected = id; state.eraser = false; state.stamp = null;
        clearSel(); if (swFor[id]) swFor[id].classList.add('sel');
      };
      const selectStamp = (stamp) => {
        state.stamp = stamp; state.eraser = false; state.selected = null;
        clearSel(); if (stampSwFor[stamp.id]) stampSwFor[stamp.id].classList.add('sel');
        toast(`Ťukni do sveta, kam položiť ${stamp.name} 👆`, 2200);
      };

      // — paleta kociek (voľné staviteľstvo) —
      container.appendChild(el('h3', 'shop-title', '⛏️ Kocky (voľné staviteľstvo)'));
      const paletteWrap = el('div', 'palette-wrap');
      const palette = el('div', 'block-palette');
      WORLD_BLOCKS.forEach(b => {
        const sw = el('button', 'block-sw');
        const chip = el('div', 'chip-color', b.emoji || '');
        if (b.color) chip.style.background = b.color;
        sw.appendChild(chip);
        const isUnlocked = unlocked.has(b.id);
        sw.appendChild(el('div', 'chip-label', isUnlocked ? b.name : `🔒 ${b.cost}💎`));
        if (!isUnlocked) sw.classList.add('locked');
        swFor[b.id] = sw;
        sw.addEventListener('click', () => {
          ensureAudio();
          if (unlocked.has(b.id)) { sfx.click(); selectBlock(b.id); }
          else if (spend(b.cost)) {
            const arr = lsGet('blocks', ['grass', 'dirt']); arr.push(b.id); lsSet('blocks', arr);
            sfx.win(); confetti(10); toast(`Odomknuté: ${b.name}! 🎉`, 1800); speak(b.name, 1);
            state.selected = b.id; state.eraser = false; state.stamp = null;
            draw();
          } else { sfx.wrong(); toast(`Ešte ti chýba ${b.cost - getDiamonds()} 💎`); }
        });
        palette.appendChild(sw);
      });
      eraserBtn = el('button', 'block-sw eraser', '');
      eraserBtn.appendChild(el('div', 'chip-color', '🧽'));
      eraserBtn.appendChild(el('div', 'chip-label', 'Guma'));
      eraserBtn.addEventListener('click', () => {
        ensureAudio(); sfx.click();
        state.eraser = true; state.stamp = null; state.selected = null;
        clearSel(); eraserBtn.classList.add('sel');
      });
      palette.appendChild(eraserBtn);
      paletteWrap.appendChild(palette);
      container.appendChild(paletteWrap);

      // — obchod: stavby a postavičky (kúp a polož) —
      const buildStampSection = (title, items) => {
        container.appendChild(el('h3', 'shop-title', title));
        const wrap = el('div', 'palette-wrap');
        const pal = el('div', 'block-palette');
        items.forEach(stamp => {
          const sw = el('button', 'block-sw');
          sw.appendChild(el('div', 'chip-color', stamp.emoji));
          const isU = unlockedStamps.has(stamp.id);
          sw.appendChild(el('div', 'chip-label', isU ? stamp.name : `🔒 ${stamp.cost}💎`));
          if (!isU) sw.classList.add('locked');
          stampSwFor[stamp.id] = sw;
          sw.addEventListener('click', () => {
            ensureAudio();
            if (unlockedStamps.has(stamp.id)) { sfx.click(); selectStamp(stamp); }
            else if (spend(stamp.cost)) {
              const arr = lsGet('stamps', []); arr.push(stamp.id); lsSet('stamps', arr);
              sfx.win(); confetti(12);
              toast(`Kúpené: ${stamp.name}! Ťukni, kam ho položiť 👆`, 2600);
              speak(stamp.name, 1);
              state.stamp = stamp; state.eraser = false; state.selected = null;
              draw();
            } else { sfx.wrong(); toast(`Ešte ti chýba ${stamp.cost - getDiamonds()} 💎`); }
          });
          pal.appendChild(sw);
        });
        wrap.appendChild(pal);
        container.appendChild(wrap);
      };

      container.appendChild(el('h3', 'shop-title', '🛒 Obchod – kúp a polož'));
      buildStampSection('🏠 Hotové stavby', STAMPS.filter(s => s.kind === 'build'));
      buildStampSection('🎮 Postavičky', STAMPS.filter(s => s.kind === 'mob'));
      buildStampSection('🌈 Doplnky', STAMPS.filter(s => s.kind === 'deco'));

      // obnov zvýraznenie podľa stavu
      if (state.stamp && stampSwFor[state.stamp.id]) stampSwFor[state.stamp.id].classList.add('sel');
      else if (state.eraser && eraserBtn) eraserBtn.classList.add('sel');
      else if (state.selected && swFor[state.selected]) swFor[state.selected].classList.add('sel');

      // spodné tlačidlá
      const row = el('div', 'row');
      const clearBtn = el('button', 'btn', '🗑️ Zbúrať všetko');
      clearBtn.addEventListener('click', () => {
        ensureAudio(); sfx.click();
        if (!confirm('Naozaj zbúrať celý svet? Kúpené veci ti ostanú v obchode.')) return;
        world = freshGround();
        save();
        cellEls.forEach((cell, i) => applyBlock(cell, world[i]));
        toast('Svet vyčistený – stavaj odznova! 🧹');
      });
      const playBtn = el('button', 'btn btn-primary', '🎮 Zbierať 💎');
      playBtn.addEventListener('click', () => { location.hash = ''; });
      row.append(clearBtn, playBtn);
      container.appendChild(row);
    };

    draw();
  },
};

export const GAMES = [
  gameLogopedia,
  gameZvuky,
  gameMatika,
  gameCitanie,
  gameMalovanka,
  gameSvet,
];
