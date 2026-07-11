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
  PRAISES, ENCOURAGE, HOME_TIERS, DECORATIONS, SENTENCES,
} from './data.js';

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
  const shop = el('button', 'btn btn-green btn-big', '🏠 Do chalúpky');
  shop.addEventListener('click', () => { location.hash = '#/chalupka'; });
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
function onWrongDefault(st, btn, reveal) {
  st.firstTry = false;
  st.tries++;
  btn.classList.add('incorrect');
  btn.disabled = true;
  sfx.wrong();
  toast(st.tries >= 2 ? 'Pozri, správna odpoveď svieti! 👉' : sample(RETRY_MSGS));
  if (st.tries >= 2 && reveal) reveal();
}

// ---------- 1) LOGOPÉDIA ----------
const gameLogopedia = {
  id: 'logopedia',
  name: 'Ušká',
  emoji: '👂',
  desc: 'Š–Č, S–Š a iné hlásky',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Vypočuj slovo a uhádni, ktorú hlásku počuješ! 👂',
      SOUND_PAIRS.map(p => ({ emoji: '🔊', label: `${p.a} alebo ${p.b}`, pair: p })),
      lvl => start(lvl.pair)
    );

    const start = (pair) => {
      const TOTAL = 10;
      const words = shuffle(pair.words).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;
      const ttsOk = canSpeak();

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => start(pair)); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const st = makeState();

        container.innerHTML = '';
        const banner = ttsHintBanner();
        if (banner) container.appendChild(banner);
        container.appendChild(dots.node);

        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        const wordDisplay = el('div', 'word-display read-word', ttsOk ? '• • •' : item.w.toUpperCase());
        panel.appendChild(wordDisplay);

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
              wordDisplay.innerHTML = highlightWord(item.w.toUpperCase(), item.t);
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal);
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
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal);
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
        { emoji: '➕', label: 'Sčítanie do 10', type: 'add10' },
        { emoji: '➖', label: 'Odčítanie do 10', type: 'sub10' },
        { emoji: '🚀', label: 'Plus a mínus do 20', type: 'mix20' },
        { emoji: '🧩', label: 'Doplň číslo (5 + ▢ = 8)', type: 'missing' },
        { emoji: '⚖️', label: 'Porovnaj čísla', type: 'compare' },
      ],
      lvl => (lvl.type === 'compare' ? startCompare(lvl)
        : lvl.type === 'missing' ? startMissing(lvl) : start(lvl))
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
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1500);
            } else {
              onWrongDefault(st, b, reveal);
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
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1500);
            } else {
              onWrongDefault(st, b, reveal);
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
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1500);
            } else {
              onWrongDefault(st, b2, reveal);
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
  desc: 'Slová, písmená, vety',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Poďme čítať! 📖',
      [
        { emoji: '🖼️', label: 'Obrázok a slovo', mode: 'match' },
        { emoji: '🔤', label: 'Prvé písmenko', mode: 'first' },
        { emoji: '🧩', label: 'Poskladaj slovo', mode: 'build' },
        { emoji: '📜', label: 'Čítaj vetu', mode: 'sentence' },
      ],
      lvl => {
        if (lvl.mode === 'match') startMatch();
        else if (lvl.mode === 'first') startFirst();
        else if (lvl.mode === 'build') startBuild();
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
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal);
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
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal);
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
            dots.set(idx, firstTry ? 'ok' : 'bad');
            idx++;
            later(next, 1700);
          } else {
            fails++;
            sfx.wrong();
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

function enablePainting(grid, paintFn) {
  let painting = false;
  grid.addEventListener('pointerdown', e => {
    painting = true;
    const cell = e.target.closest('.cell');
    if (cell) paintFn(cell, true);
  });
  grid.addEventListener('pointermove', e => {
    if (!painting) return;
    e.preventDefault();
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const cell = hit && hit.closest ? hit.closest('.cell') : null;
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

// ---------- 6) CHALÚPKA (obchod) ----------
const gameChalupka = {
  id: 'chalupka',
  name: 'Chalúpka',
  emoji: '🏠',
  desc: 'Stavaj a vylepšuj',
  render(container) {
    const render = () => {
      container.innerHTML = '';
      const tierIndex = lsGet('homeTier', 0);
      const decos = lsGet('decos', []);
      const info = levelInfo();
      const diamonds = getDiamonds();

      // level pruh
      const lvlBox = el('div', 'level-box');
      lvlBox.appendChild(el('div', '', `${info.emoji} <b>Level ${info.level} – ${info.title}</b>`));
      const bar = el('div', 'progress-bar');
      const fill = el('div', 'fill');
      fill.style.width = info.pct + '%';
      bar.appendChild(fill);
      lvlBox.appendChild(bar);
      lvlBox.appendChild(el('div', 'muted',
        info.next ? `Do ďalšieho levelu: ${info.toNext} 💎` : 'Najvyšší level! 👑'));
      container.appendChild(lvlBox);

      // scéna
      const scene = el('div', 'diorama');
      const home = el('div', 'diorama-home', HOME_TIERS[tierIndex].emoji);
      scene.appendChild(home);
      DECORATIONS.forEach(d => {
        if (!decos.includes(d.id)) return;
        const s = el('span', 'deco', d.emoji);
        s.style.left = d.pos.left;
        s.style.bottom = d.pos.bottom;
        scene.appendChild(s);
      });
      container.appendChild(scene);

      container.appendChild(el('p', 'subtitle',
        `Máš <b>${diamonds} 💎</b> – kupuj vylepšenia! 🛒`));

      // obchod – domovy
      container.appendChild(el('h3', 'shop-title', '🏗️ Tvoj domov'));
      const homeShop = el('div', 'shop-list');
      HOME_TIERS.forEach((t, i) => {
        const row = el('div', 'shop-item');
        row.appendChild(el('span', 'shop-emoji', t.emoji));
        const info2 = el('div', 'shop-info');
        info2.appendChild(el('div', 'shop-name', t.name));
        info2.appendChild(el('div', 'shop-cost', i === 0 ? 'základ' : `${t.cost} 💎`));
        row.appendChild(info2);

        let btn;
        if (i <= tierIndex) {
          btn = el('span', 'shop-owned', i === tierIndex ? '✅ tu bývaš' : '✔️ máš');
        } else if (i === tierIndex + 1) {
          btn = el('button', 'btn btn-green', 'Postaviť');
          btn.addEventListener('click', () => {
            if (spend(t.cost)) {
              lsSet('homeTier', i);
              sfx.win(); confetti(16);
              toast(`Nový domov: ${t.name}! 🎉`, 2400);
              speak(t.name, 1);
              render();
            } else {
              sfx.wrong();
              toast(`Ešte ti chýba ${t.cost - diamonds} 💎`);
            }
          });
        } else {
          btn = el('span', 'shop-locked', '🔒');
        }
        row.appendChild(btn);
        homeShop.appendChild(row);
      });
      container.appendChild(homeShop);

      // obchod – ozdoby
      container.appendChild(el('h3', 'shop-title', '🌳 Ozdoby do dvora'));
      const decoShop = el('div', 'shop-list');
      DECORATIONS.forEach(d => {
        const owned = decos.includes(d.id);
        const row = el('div', 'shop-item');
        row.appendChild(el('span', 'shop-emoji', d.emoji));
        const info2 = el('div', 'shop-info');
        info2.appendChild(el('div', 'shop-name', d.name));
        info2.appendChild(el('div', 'shop-cost', `${d.cost} 💎`));
        row.appendChild(info2);

        if (owned) {
          row.appendChild(el('span', 'shop-owned', '✔️ máš'));
        } else {
          const btn = el('button', 'btn btn-green', 'Kúpiť');
          btn.addEventListener('click', () => {
            if (spend(d.cost)) {
              const arr = lsGet('decos', []);
              arr.push(d.id);
              lsSet('decos', arr);
              sfx.place(); confetti(10);
              toast(`Kúpené: ${d.name}! 🎉`, 2000);
              speak(d.name, 1);
              render();
            } else {
              sfx.wrong();
              toast(`Ešte ti chýba ${d.cost - getDiamonds()} 💎`);
            }
          });
          row.appendChild(btn);
        }
        decoShop.appendChild(row);
      });
      container.appendChild(decoShop);

      const goPlay = el('button', 'btn btn-primary btn-big', '🎮 Poď hrať a zbierať 💎');
      goPlay.addEventListener('click', () => { location.hash = ''; });
      container.appendChild(goPlay);
    };

    render();
  },
};

export const GAMES = [
  gameLogopedia,
  gameZvuky,
  gameMatika,
  gameCitanie,
  gameMalovanka,
  gameChalupka,
];
