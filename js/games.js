// ===== Všetky hry =====
import {
  el, shuffle, randInt, sample, award, spend, toast, confetti,
  progressDots, lsGet, lsSet, getDiamonds, getEarned, levelInfo, later,
  getCursive, setCursive, pickFresh,
} from './core.js';
import {
  speak, canSpeak, sfx, ensureAudio, playCountSounds, COUNT_SOUND_NAMES,
  speakMath, speakNumber, numberToSlovak,
} from './audio.js';
import {
  SOUND_PAIRS, READING_WORDS, READING_WORDS_L2, BUILD_WORDS, PIXEL_TEMPLATES, FREE_COLORS,
  PRAISES, ENCOURAGE, SENTENCES, SENTENCES_L2, HOME_TIERS, COLLECTIBLES,
  DIPHTHONGS, DIPHTHONG_OPTIONS, COUNT_EMOJI, SPELL_WORDS, SYLLABLES, YDY_WORDS,
} from './data.js';
import { recordResult, recordMistake } from './stats.js';
import { hasSpeechRecognition, listenOnce, matchesWord, matchesSentence } from './speech.js';
import { gameKampan } from './campaign.js';
import { gamePeniaze, gameTvary } from './games2.js';
import { gameHlavolamy, gameVelka } from './games3.js';
import { gameAnglictina } from './games4.js';
import { diffLevel } from './adaptive.js';
import {
  praiseNow, levelScreen, resultScreen, highlightWord, ttsHintBanner,
  cursiveToggle, makeState, onWrongDefault, trackResult,
  armIdleHint, disarmIdleHint,
} from './shared.js';

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
      const words = pickFresh(pair.words, TOTAL, `logo-${pair.id}`, x => x.w);
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

        armIdleHint(ttsOk ? () => speak(item.w) : null, reveal);
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
  mem20: 'Pamäťové do 20', chain: 'Kombinované počítanie', parity: 'Párne a nepárne',
  sign: 'Doplň znamienko',
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
        { emoji: '🧠', label: 'Pamäťové do 20 (z hlavy)', type: 'mem20' },
        { emoji: '🔗', label: 'Kombinované (3 + 4 − 2)', type: 'chain' },
        { emoji: '🧩', label: 'Doplň číslo (15 − ▢ = 10)', type: 'missing' },
        { emoji: '➕➖', label: 'Doplň znamienko (8 ▢ 3 = 5)', type: 'sign' },
        { emoji: '⚖️', label: 'Porovnaj čísla', type: 'compare' },
        { emoji: '👯', label: 'Párne a nepárne', type: 'parity' },
      ],
      lvl => (lvl.type === 'compare' ? startCompare(lvl)
        : lvl.type === 'missing' ? startMissing(lvl)
        : lvl.type === 'count' ? startCount(lvl)
        : lvl.type === 'chain' ? startChain(lvl)
        : lvl.type === 'parity' ? startParity(lvl)
        : lvl.type === 'sign' ? startSign(lvl) : start(lvl))
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
      if (type === 'mem20') {
        const d = diffLevel('matika:mem20');
        if (d === 1) {
          // ľahšie: do 20 BEZ prechodu cez desiatku
          if (Math.random() < 0.5) {
            const u = randInt(1, 8);
            const a = 10 + u;
            const b = randInt(1, 9 - u);
            return { a, b, op: '+', ans: a + b, max: 20 };
          }
          const u = randInt(2, 9);
          const a = 10 + u;
          const b = randInt(1, u - 1);
          return { a, b, op: '−', ans: a - b, max: 20 };
        }
        // ťažšie: s prechodom cez desiatku
        if (Math.random() < 0.5) {
          const a = randInt(4, 9);
          const b = randInt(Math.max(2, 11 - a), 9);
          return { a, b, op: '+', ans: a + b, max: 20 };
        }
        const a = randInt(11, 18);
        const b = randInt(Math.max(2, a - 9), 9);
        return { a, b, op: '−', ans: a - b, max: 20 };
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

        if (lvl.type !== 'mem20' && p.a <= 10 && p.b <= 10) {
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

        // metodická pomôcka pri pamäťovom počítaní: rozklad cez desiatku
        const strategyHint = () => {
          if (lvl.type === 'mem20' && p.op === '+' && p.a < 10 && p.a + p.b > 10) {
            const toTen = 10 - p.a;
            const rest = p.b - toTen;
            speak(`Pomôcka: najprv doplň do desať. ${numberToSlovak(p.a)} plus ${numberToSlovak(toTen)} je desať, a ešte ${numberToSlovak(rest)}.`, 0.85);
          } else if (lvl.type === 'mem20' && p.op === '−' && p.a > 10 && p.a - p.b < 10) {
            const toTen = p.a - 10;
            const rest = p.b - toTen;
            speak(`Pomôcka: najprv odčítaj po desať. ${numberToSlovak(p.a)} mínus ${numberToSlovak(toTen)} je desať, a ešte mínus ${numberToSlovak(rest)}.`, 0.85);
          } else {
            speakMath(p.a, p.b, p.op);
          }
        };
        armIdleHint(strategyHint, reveal);
        later(() => speakMath(p.a, p.b, p.op), 350);
      };
      next();
    };

    const startMissing = (lvl) => {
      const TOTAL = 10;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const gen = () => {
        const kind = randInt(0, 3);
        if (kind === 0) {
          // a + ▢ = c
          const a = randInt(1, 9), b = randInt(1, 9);
          return { text: `${a} + ▢ = ${a + b}`, ans: b, kind, a, b, c: a + b };
        }
        if (kind === 1) {
          // ▢ + b = c
          const a = randInt(1, 9), b = randInt(1, 9);
          return { text: `▢ + ${b} = ${a + b}`, ans: a, kind, a, b, c: a + b };
        }
        if (kind === 2) {
          // a − ▢ = c  (napr. 15 − ▢ = 10)
          const a = randInt(4, 18), b = randInt(1, a - 1);
          return { text: `${a} − ▢ = ${a - b}`, ans: b, kind, a, b, c: a - b };
        }
        // ▢ − b = c  (napr. ▢ − 4 = 6)
        const b = randInt(1, 9), c = randInt(1, 11);
        return { text: `▢ − ${b} = ${c}`, ans: b + c, kind, b, c };
      };
      const say = (p) => {
        if (p.kind === 0) speak(`${numberToSlovak(p.a)} plus koľko je ${numberToSlovak(p.c)}?`, 0.85);
        else if (p.kind === 1) speak(`Koľko plus ${numberToSlovak(p.b)} je ${numberToSlovak(p.c)}?`, 0.85);
        else if (p.kind === 2) speak(`${numberToSlovak(p.a)} mínus koľko je ${numberToSlovak(p.c)}?`, 0.85);
        else speak(`Koľko mínus ${numberToSlovak(p.b)} je ${numberToSlovak(p.c)}?`, 0.85);
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
        makeOptions(p.ans, 20).forEach(opt => {
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

    const startSign = (lvl) => {
      const TOTAL = 10;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const gen = () => {
        // a ▢ b = c, jednoznačné: b ≥ 1, a ± b v obore 0..20
        for (let t = 0; t < 40; t++) {
          const op = Math.random() < 0.5 ? '+' : '−';
          const a = randInt(1, 15);
          const b = randInt(1, 9);
          const c = op === '+' ? a + b : a - b;
          if (c < 0 || c > 20) continue;
          return { a, b, c, op };
        }
        return { a: 8, b: 3, c: 5, op: '−' };
      };
      const say = (p) => speak(
        `${numberToSlovak(p.a)}, ${numberToSlovak(p.b)}, rovná sa ${numberToSlovak(p.c)}. Plus alebo mínus?`, 0.85);

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => startSign(lvl)); return; }
        dots.set(idx, 'current');
        const p = gen();
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', `${p.a} ▢ ${p.b} = ${p.c}`));
        panel.appendChild(el('p', '', 'Aké znamienko patrí do políčka ▢?'));

        const replay = el('button', 'btn btn-blue', '🔊 Prečítaj príklad');
        replay.addEventListener('click', () => { ensureAudio(); say(p); });
        panel.appendChild(replay);

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[p.op]) btnFor[p.op].classList.add('hint'); };
        shuffle(['+', '−']).forEach(op => {
          const b = el('button', 'btn btn-huge', op);
          btnFor[op] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (op === p.op) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(`Áno! ${numberToSlovak(p.a)} ${p.op === '+' ? 'plus' : 'mínus'} ${numberToSlovak(p.b)} je ${numberToSlovak(p.c)}.`, 0.9);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'matika', gameName: 'Počítanie', skill: 'matika:sign', skillName: MATIKA_NAMES.sign });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'matika:sign', skillName: MATIKA_NAMES.sign,
                label: `${p.a} ? ${p.b} = ${p.c}`, chose: op, correct: p.op,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => say(p), reveal);
        later(() => say(p), 350);
      };
      next();
    };

    const startParity = (lvl) => {
      const TOTAL = 10;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => startParity(lvl)); return; }
        dots.set(idx, 'current');
        const n = randInt(1, 20);
        const isEven = n % 2 === 0;
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', String(n)));
        // vizuál: kocky vo dvojiciach – ak jedna ostane sama, číslo je nepárne
        const pairs = Math.floor(n / 2);
        const rest = n % 2;
        panel.appendChild(el('div', 'math-blocks',
          '🟩🟩 '.repeat(pairs) + (rest ? '🟨' : '')));
        panel.appendChild(el('p', '',
          '<small>Rozdeľ kocky do dvojíc. Ostane jedna sama? Potom je číslo nepárne.</small>'));

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const correct = isEven ? 'párne' : 'nepárne';
        const reveal = () => { if (btnFor[correct]) btnFor[correct].classList.add('hint'); };
        ['párne', 'nepárne'].forEach(opt => {
          const b = el('button', 'btn btn-big', opt.toUpperCase());
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === correct) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(`Áno, ${numberToSlovak(n)} je ${correct} číslo.`, 0.95);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'matika', gameName: 'Počítanie', skill: 'matika:parity', skillName: MATIKA_NAMES.parity });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'matika:parity', skillName: MATIKA_NAMES.parity,
                label: String(n), chose: opt, correct,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak('Rozdeľ kocky po dvoch. Ak jedna ostane sama, číslo je nepárne.', 0.9), reveal);
        later(() => speak(`Je číslo ${numberToSlovak(n)} párne alebo nepárne?`, 0.9), 350);
      };
      next();
    };

    const startChain = (lvl) => {
      const TOTAL = 10;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const gen = () => {
        for (let t = 0; t < 50; t++) {
          const a = randInt(1, 10);
          const op1 = Math.random() < 0.5 ? '+' : '−';
          const b = randInt(1, 9);
          const mid = op1 === '+' ? a + b : a - b;
          if (mid < 0 || mid > 20) continue;
          const op2 = Math.random() < 0.5 ? '+' : '−';
          const c = randInt(1, 9);
          const ans = op2 === '+' ? mid + c : mid - c;
          if (ans < 0 || ans > 20) continue;
          return { a, b, c, op1, op2, ans };
        }
        return { a: 2, b: 3, c: 1, op1: '+', op2: '+', ans: 6 };
      };
      const opWord = (o) => (o === '+' ? 'plus' : 'mínus');
      const say = (p) => speak(
        `Koľko je ${numberToSlovak(p.a)} ${opWord(p.op1)} ${numberToSlovak(p.b)} ${opWord(p.op2)} ${numberToSlovak(p.c)}?`,
        0.85);

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => startChain(lvl)); return; }
        dots.set(idx, 'current');
        const p = gen();
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', `${p.a} ${p.op1} ${p.b} ${p.op2} ${p.c} = ?`));
        panel.appendChild(el('p', '', '<small>Počítaj postupne zľava doprava. 👉</small>'));

        const replay = el('button', 'btn btn-blue', '🔊 Prečítaj príklad');
        replay.addEventListener('click', () => { ensureAudio(); say(p); });
        panel.appendChild(replay);

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[p.ans]) btnFor[p.ans].classList.add('hint'); };
        makeOptions(p.ans, 20).forEach(opt => {
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
              trackResult(st, { game: 'matika', gameName: 'Počítanie', skill: 'matika:chain', skillName: MATIKA_NAMES.chain });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1500);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'matika:chain', skillName: MATIKA_NAMES.chain,
                label: `${p.a} ${p.op1} ${p.b} ${p.op2} ${p.c}`, chose: opt, correct: p.ans,
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
    const pick = () => {
      const levels = [
        { emoji: '🖼️', label: 'Obrázok a slovo', mode: 'match' },
        { emoji: '🔤', label: 'Prvé písmenko', mode: 'first' },
        { emoji: '🧩', label: 'Poskladaj slovo', mode: 'build' },
        { emoji: '🔠', label: 'Hláskovanie', mode: 'spell' },
        { emoji: '👏', label: 'Slabiky (vytlieskaj)', mode: 'syllable' },
        { emoji: '🅰️', label: 'Dvojhlásky ia ie iu ô', mode: 'diphthong' },
        { emoji: '✏️', label: 'Y alebo I', mode: 'ydy' },
        { emoji: '🔡', label: 'Abeceda', mode: 'abeceda' },
        { emoji: '📜', label: 'Čítaj vetu', mode: 'sentence' },
      ];
      if (hasSpeechRecognition()) {
        levels.push({ emoji: '🎤', label: 'Čítaj nahlas (mikrofón)', mode: 'read' });
      }
      levelScreen(container, 'Poďme čítať! 📖', levels, lvl => {
        if (lvl.mode === 'match') startMatch();
        else if (lvl.mode === 'first') startFirst();
        else if (lvl.mode === 'build') startBuild();
        else if (lvl.mode === 'spell') startSpell();
        else if (lvl.mode === 'syllable') startSyllable();
        else if (lvl.mode === 'diphthong') startDiphthong();
        else if (lvl.mode === 'ydy') startYdy();
        else if (lvl.mode === 'abeceda') startAbeceda();
        else if (lvl.mode === 'read') startRead();
        else startSentence();
      }, cursiveToggle());
    };

    // — abeceda: ktoré písmeno nasleduje / predchádza —
    const startAbeceda = () => {
      const TOTAL = 8;
      const ABC = 'ABCDEFGHIJKLMNOPRSTUVZ'.split(''); // zjednodušená abeceda
      const dots = progressDots(TOTAL);
      const skill = 'citanie:abeceda';
      const skillName = 'Abeceda';
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startAbeceda); return; }
        dots.set(idx, 'current');
        const i = randInt(1, ABC.length - 2);
        const after = Math.random() < 0.5;
        const base = ABC[i];
        const correct = after ? ABC[i + 1] : ABC[i - 1];
        const distractors = shuffle(ABC.filter(l => l !== correct && l !== base)).slice(0, 3);
        const options = shuffle([correct, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'word-display', `… ${after ? base + ' → ▢' : '▢ → ' + base} …`));
        panel.appendChild(el('p', '', after
          ? `Ktoré písmeno je v abecede hneď <b>po ${base}</b>?`
          : `Ktoré písmeno je v abecede hneď <b>pred ${base}</b>?`));

        const say = () => speak(after
          ? `Ktoré písmeno nasleduje v abecede po ${base}?`
          : `Ktoré písmeno je v abecede pred ${base}?`, 0.85);

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[correct]) btnFor[correct].classList.add('hint'); };
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
              sfx.correct();
              speak(after ? `Áno, po ${base} nasleduje ${correct}.` : `Áno, pred ${base} je ${correct}.`, 0.9);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'citanie', gameName: 'Čítanie', skill, skillName });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal, { skill, skillName, label: `${after ? 'po' : 'pred'} ${base}`, chose: letter, correct });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(say, reveal);
        later(say, 350);
      };
      next();
    };

    // sady sa rozširujú od Levelu 3 (Staviteľ) o ťažšie slová/vety
    const isTier2 = () => levelInfo().level >= 3;
    const readingPool = () => (isTier2() ? READING_WORDS.concat(READING_WORDS_L2) : READING_WORDS);
    const sentencePool = () => (isTier2() ? SENTENCES.concat(SENTENCES_L2) : SENTENCES);
    const tierNote = () => (isTier2()
      ? el('div', 'tier-badge', '📈 Level 2 – ťažšie slová a vety!') : null);

    // — obrázok a slovo —
    const startMatch = () => {
      const TOTAL = 8;
      const pool = readingPool();
      const words = pickFresh(pool, TOTAL, 'read-match', x => x.w);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startMatch); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const distractors = shuffle(pool.filter(x => x.w !== item.w)).slice(0, 2);
        const options = shuffle([item, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        const tn = tierNote(); if (tn) container.appendChild(tn);
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

        armIdleHint(() => speak(`Hľadaj slovo ${item.w}.`, 0.9), reveal);
      };
      next();
    };

    // — prvé písmenko —
    const startFirst = () => {
      const TOTAL = 8;
      const ALPHABET = 'ABCČDEFGHJKLMNOPRSŠTUVZŽ'.split('');
      const words = pickFresh(readingPool(), TOTAL, 'read-first', x => x.w);
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
      const words = pickFresh(BUILD_WORDS, TOTAL, 'read-build', x => x.w);
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

    // — čítaj vetu (samostatné čítanie, aj mikrofón) —
    const startSentence = () => {
      const TOTAL = 6;
      const items = pickFresh(sentencePool(), TOTAL, 'read-sent', x => x.s);
      const dots = progressDots(TOTAL);
      let idx = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, TOTAL, TOTAL, startSentence); return; }
        dots.set(idx, 'current');
        const item = items[idx];
        let solved = false;

        container.innerHTML = '';
        const tn = tierNote(); if (tn) container.appendChild(tn);
        container.appendChild(cursiveToggle());
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        panel.appendChild(el('div', 'sentence read-word', item.s));
        panel.appendChild(el('p', '', 'Prečítaj vetu nahlas. 📣'));

        const status = el('div', 'mic-status', '');
        const advance = () => {
          if (solved) return;
          solved = true;
          sfx.correct(); award(1); confetti(6);
          toast(`${sample(PRAISES)} +1 💎`);
          recordResult({ game: 'citanie', gameName: 'Čítanie', skill: 'citanie:sentence', skillName: 'Čítanie viet', firstTry: true });
          dots.set(idx, 'ok');
          idx++;
          later(next, 1000);
        };

        const row = el('div', 'stack');
        if (canSpeak()) {
          const hear = el('button', 'btn btn-blue', '🔊 Vypočuj vetu');
          hear.addEventListener('click', () => { ensureAudio(); speak(item.s, 0.8); });
          row.appendChild(hear);
        }
        if (hasSpeechRecognition()) {
          let busy = false;
          const mic = el('button', 'btn btn-green btn-big', '🎤 Prečítam ju');
          mic.addEventListener('click', async () => {
            if (busy || solved) return;
            busy = true; ensureAudio(); mic.disabled = true;
            status.innerHTML = '👂 Počúvam… čítaj vetu';
            const res = await listenOnce('sk-SK', 8000);
            busy = false; mic.disabled = false;
            if (!res.ok) {
              status.innerHTML = (res.error === 'not-allowed' || res.error === 'service-not-allowed')
                ? '🔇 Povoľte mikrofón a skúste znova.' : '🤔 Nepočula som ťa, skús znova.';
              return;
            }
            const m = matchesSentence(item.s, res.alternatives);
            if (m.match) { status.innerHTML = '✅ Super, prečítané!'; mic.disabled = true; advance(); }
            else { status.innerHTML = `🙂 Počula som „<i>${m.heard || '…'}</i>". Skús znova, alebo daj „Prečítal(a) som".`; }
          });
          row.appendChild(mic);
        }
        const done = el('button', hasSpeechRecognition() ? 'btn' : 'btn btn-green btn-big', '✅ Prečítal(a) som!');
        done.addEventListener('click', () => { ensureAudio(); advance(); });
        row.appendChild(done);
        panel.appendChild(row);
        panel.appendChild(status);
        container.appendChild(panel);
      };
      next();
    };

    // — slabiky: koľko ich má slovo (vytlieskaj) —
    const startSyllable = () => {
      const TOTAL = 8;
      const words = pickFresh(SYLLABLES, TOTAL, 'read-syll', x => x.w);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startSyllable); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const correct = item.s.length;
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        const wd = el('div', 'word-display read-word', item.w.toUpperCase());
        panel.appendChild(wd);
        panel.appendChild(el('p', '', 'Vytlieskaj slovo! 👏 Koľko má slabík?'));

        if (canSpeak()) {
          const hear = el('button', 'btn btn-blue', '🔊 Vypočuj slovo');
          hear.addEventListener('click', () => { ensureAudio(); speak(item.w, 0.75); });
          panel.appendChild(hear);
        }

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[correct]) btnFor[correct].classList.add('hint'); };
        [1, 2, 3, 4].forEach(nOpt => {
          const b = el('button', 'btn', String(nOpt));
          btnFor[nOpt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (nOpt === correct) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              wd.innerHTML = item.s.join('<span class="hl">-</span>');
              sfx.correct();
              speak(item.s.join(', '), 0.7);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'citanie', gameName: 'Čítanie', skill: 'citanie:syllable', skillName: 'Slabiky' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1900);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'citanie:syllable', skillName: 'Slabiky',
                label: item.w, chose: nOpt, correct,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(item.s.join(', '), 0.65), reveal);
        if (canSpeak()) later(() => speak(item.w, 0.75), 350);
      };
      next();
    };

    // — Y alebo I (tvrdé a mäkké spoluhlásky) —
    const startYdy = () => {
      const TOTAL = 8;
      const words = pickFresh(YDY_WORDS, TOTAL, 'read-ydy', x => x.w);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startYdy); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const blank = item.w.replace(/[yi]/, '▢').toUpperCase();
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        const wd = el('div', 'word-display read-word', blank);
        panel.appendChild(wd);

        if (canSpeak()) {
          const hear = el('button', 'btn btn-blue', '🔊 Vypočuj slovo');
          hear.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(hear);
        }
        panel.appendChild(el('p', '', 'Aké písmenko patrí do slova – <b>Y</b> alebo <b>I</b>?'));

        const row = el('div', 'row');
        const btnFor = {};
        const reveal = () => { if (btnFor[item.ans]) btnFor[item.ans].classList.add('hint'); };
        ['y', 'i'].forEach(opt => {
          const b = el('button', 'btn btn-huge', opt.toUpperCase());
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === item.ans) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              wd.innerHTML = highlightWord(item.w.toUpperCase(), item.ans);
              sfx.correct();
              speak(item.w);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'citanie', gameName: 'Čítanie', skill: 'citanie:ydy', skillName: 'Y alebo I' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1800);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'citanie:ydy', skillName: 'Y alebo I',
                label: item.w, chose: opt, correct: item.ans,
              });
            }
          });
          row.appendChild(b);
        });
        panel.appendChild(row);
        container.appendChild(panel);

        armIdleHint(() => speak(item.w, 0.8), reveal);
        if (canSpeak()) later(() => speak(item.w), 350);
      };
      next();
    };

    // — čítaj slovo nahlas (mikrofón počúva a vyhodnotí) —
    const startRead = () => {
      const TOTAL = 6;
      const words = pickFresh(readingPool(), TOTAL, 'read-read', x => x.w);
      const dots = progressDots(TOTAL);
      const skill = 'citanie:read';
      const skillName = 'Čítanie nahlas 🎤';
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startRead); return; }
        dots.set(idx, 'current');
        const item = words[idx];
        const st = makeState();
        let busy = false;

        container.innerHTML = '';
        const tn = tierNote(); if (tn) container.appendChild(tn);
        container.appendChild(el('div', 'hint-banner',
          '🎤 Prečítaj slovo nahlas – appka ťa počúva. Vyhodnotenie je približné.'));
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        panel.appendChild(el('div', 'word-display read-word', item.w.toUpperCase()));
        if (canSpeak()) {
          const hear = el('button', 'btn btn-blue', '🔊 Vypočuj');
          hear.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(hear);
        }
        const status = el('div', 'mic-status', 'Prečítaj: <b>' + item.w + '</b>');
        panel.appendChild(status);

        const finishOk = () => {
          st.locked = true;
          sfx.correct();
          if (st.firstTry) { score++; award(1); confetti(8); toast(`${praiseNow()} +1 💎`); }
          else toast(praiseNow());
          trackResult(st, { game: 'citanie', gameName: 'Čítanie', skill, skillName });
          status.innerHTML = '✅ Super, prečítané!';
          dots.set(idx, st.firstTry ? 'ok' : 'bad');
          idx++;
          later(next, 1300);
        };

        const mic = el('button', 'btn btn-green btn-big', '🎤 Prečítaj slovo');
        mic.addEventListener('click', async () => {
          if (busy || st.locked) return;
          busy = true; ensureAudio(); mic.disabled = true;
          status.innerHTML = '👂 Počúvam… čítaj <b>' + item.w + '</b>';
          const res = await listenOnce('sk-SK');
          busy = false; mic.disabled = false;
          if (!res.ok) {
            status.innerHTML = (res.error === 'not-allowed' || res.error === 'service-not-allowed')
              ? '🔇 Povoľte mikrofón a skúste znova.' : '🤔 Nepočula som ťa, skús ešte raz.';
            return;
          }
          const m = matchesWord(item.w, res.alternatives);
          if (m.match) { finishOk(); }
          else {
            if (st.firstTry) recordMistake({ skill, skillName, label: item.w, chose: m.heard || '?', correct: item.w });
            st.firstTry = false;
            sfx.wrong();
            status.innerHTML = `🙂 Počula som „<i>${m.heard || '…'}</i>". Skús to prečítať zreteľnejšie.`;
          }
        });
        const skip = el('button', 'btn', '➡️ Preskočiť');
        skip.addEventListener('click', () => {
          if (st.locked) return;
          st.locked = true; st.firstTry = false;
          trackResult(st, { game: 'citanie', gameName: 'Čítanie', skill, skillName });
          dots.set(idx, 'bad');
          idx++;
          later(next, 400);
        });
        const row = el('div', 'stack');
        row.append(mic, skip);
        panel.appendChild(row);
        container.appendChild(panel);
      };
      next();
    };

    // — hláskovanie (spelovanie) —
    const startSpell = () => {
      const TOTAL = 6;
      const words = pickFresh(SPELL_WORDS, TOTAL, 'read-spell', x => x.w);
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
      const words = pickFresh(DIPHTHONGS, TOTAL, 'read-diph', x => x.w);
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

// ---------- 5) HODINY (ručičkové) ----------
// čas po slovensky
const HOUR_FEM = ['dvanásť', 'jedna', 'dve', 'tri', 'štyri', 'päť', 'šesť',
  'sedem', 'osem', 'deväť', 'desať', 'jedenásť', 'dvanásť'];
const ORD_GEN = ['dvanástej', 'prvej', 'druhej', 'tretej', 'štvrtej', 'piatej',
  'šiestej', 'siedmej', 'ôsmej', 'deviatej', 'desiatej', 'jedenástej', 'dvanástej'];
const NA_HOUR = ['dvanásť', 'jednu', 'dve', 'tri', 'štyri', 'päť', 'šesť',
  'sedem', 'osem', 'deväť', 'desať', 'jedenásť', 'dvanásť'];

function timeToSlovak(h, m) {
  if (m === 0) {
    if (h === 1) return 'Je jedna hodina.';
    if (h >= 2 && h <= 4) return `Sú ${HOUR_FEM[h]} hodiny.`;
    return `Je ${HOUR_FEM[h]} hodín.`;
  }
  const next = (h % 12) + 1;
  if (m === 15) return `Je štvrť na ${NA_HOUR[next]}.`;
  if (m === 30) return `Je pol ${ORD_GEN[next]}.`;
  if (m === 45) return `Je trištvrte na ${NA_HOUR[next]}.`;
  return `Je ${h}:${String(m).padStart(2, '0')}.`;
}

function buildClockSVG(h, m) {
  const cx = 100, cy = 100;
  const hourAng = ((h % 12) * 30 + m * 0.5) * Math.PI / 180;
  const minAng = (m * 6) * Math.PI / 180;
  const hx = cx + 42 * Math.sin(hourAng), hy = cy - 42 * Math.cos(hourAng);
  const mx = cx + 66 * Math.sin(minAng), my = cy - 66 * Math.cos(minAng);
  let nums = '', ticks = '';
  for (let n = 1; n <= 12; n++) {
    const a = n * 30 * Math.PI / 180;
    const x = cx + 74 * Math.sin(a), y = cy - 74 * Math.cos(a);
    nums += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="17" font-weight="900" fill="#2b2b2b" font-family="Nunito, sans-serif">${n}</text>`;
  }
  for (let n = 0; n < 12; n++) {
    const a = n * 30 * Math.PI / 180;
    const x1 = cx + 85 * Math.sin(a), y1 = cy - 85 * Math.cos(a);
    const x2 = cx + 92 * Math.sin(a), y2 = cy - 92 * Math.cos(a);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#2b2b2b" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 200 200" class="clock-svg" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="94" fill="#fff" stroke="#2b2b2b" stroke-width="5"/>
    ${ticks}${nums}
    <line x1="100" y1="100" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#2b2b2b" stroke-width="7" stroke-linecap="round"/>
    <line x1="100" y1="100" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="#e05656" stroke-width="5" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="6" fill="#2b2b2b"/>
  </svg>`;
}

const gameHodiny = {
  id: 'hodiny',
  name: 'Hodiny',
  emoji: '🕐',
  desc: 'Koľko je hodín?',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Nauč sa čítať ručičkové hodiny! 🕐',
      [
        { emoji: '🕐', label: 'Celé hodiny', mode: 'whole' },
        { emoji: '🕧', label: 'Celé a pol', mode: 'half' },
        { emoji: '⏱️', label: 'Aj štvrť a trištvrte', mode: 'quarter' },
      ],
      lvl => start(lvl.mode)
    );

    const start = (mode) => {
      const TOTAL = 8;
      const dots = progressDots(TOTAL);
      const skill = `hodiny:${mode}`;
      const skillName = mode === 'whole' ? 'Celé hodiny'
        : mode === 'half' ? 'Celé a pol' : 'Štvrť hodiny';
      const minutesFor = mode === 'whole' ? [0] : mode === 'half' ? [0, 30] : [0, 15, 30, 45];
      let idx = 0, score = 0;

      const label = (H, M) => `${H}:${String(M).padStart(2, '0')}`;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, () => start(mode)); return; }
        dots.set(idx, 'current');
        const h = randInt(1, 12);
        const m = sample(minutesFor);
        const st = makeState();
        const correct = label(h, m);

        const opts = new Set([correct]);
        while (opts.size < 4) {
          let hh = h, mm = m;
          if (minutesFor.length > 1 && Math.random() < 0.5) mm = sample(minutesFor);
          else hh = ((h - 1 + randInt(1, 11)) % 12) + 1;
          opts.add(label(hh, mm));
        }
        const options = shuffle([...opts]);

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        const clockWrap = el('div', 'clock-wrap');
        clockWrap.innerHTML = buildClockSVG(h, m);
        panel.appendChild(clockWrap);
        panel.appendChild(el('p', '', 'Koľko je hodín?'));

        if (canSpeak()) {
          const say = el('button', 'btn btn-blue', '🔊 Vypočuj čas');
          say.addEventListener('click', () => { ensureAudio(); speak(timeToSlovak(h, m)); });
          panel.appendChild(say);
        }

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[correct]) btnFor[correct].classList.add('hint'); };
        options.forEach(opt => {
          const b = el('button', 'btn', opt);
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === correct) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(timeToSlovak(h, m));
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'hodiny', gameName: 'Hodiny', skill, skillName });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal, { skill, skillName, label: correct, chose: opt, correct });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(timeToSlovak(h, m)), reveal);
        if (canSpeak()) later(() => speak(timeToSlovak(h, m)), 350);
      };
      next();
    };

    pick();
  },
};

// ---------- 6) MAĽOVANKA ----------
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
// ---------- DEDINKA 2.0: živá dedinka so starostlivosťou ----------
// Obyvatelia (zvieratká a postavičky) chodia po dedinke a treba ich
// kŕmiť. Väčší dom = viac miest pre kamarátov. Keď sú všetci najedení,
// dedinka daruje denný poklad. Krmivo sa kupuje za 💎 z učenia.
const HOME_SLOTS = [2, 4, 6, 8, 10, 12];
const FEED_FRESH_H = 8;    // do 8 h po nakŕmení = šťastný
const FEED_HUNGRY_H = 24;  // do 24 h = hladný, potom smutný

const DECO_SPOTS = [
  { left: '5%', bottom: '8%' }, { left: '84%', bottom: '10%' },
  { left: '14%', bottom: '44%' }, { left: '74%', bottom: '46%' },
  { left: '4%', bottom: '66%' }, { left: '87%', bottom: '68%' },
  { left: '30%', bottom: '62%' }, { left: '58%', bottom: '64%' },
  { left: '22%', bottom: '8%' }, { left: '68%', bottom: '9%' },
  { left: '44%', bottom: '70%' }, { left: '9%', bottom: '28%' },
  { left: '80%', bottom: '30%' }, { left: '48%', bottom: '9%' },
];

const gameSvet = {
  id: 'svet',
  name: 'Moja dedinka',
  emoji: '🏡',
  desc: 'Staraj sa o kamarátov',
  render(container) {
    // migrácia zo starej zbierky (collect → obyvatelia + ozdoby)
    if (lsGet('villagers', null) === null) {
      const old = lsGet('collect', []);
      const vill = [], deco = [];
      old.forEach(id => {
        const it = COLLECTIBLES.find(c => c.id === id);
        if (!it) return;
        if (it.cat === 'zvierata' || it.cat === 'postavicky') vill.push({ id, fed: Date.now() });
        else deco.push(id);
      });
      lsSet('villagers', vill);
      lsSet('decos2', deco);
      if (lsGet('food', null) === null) lsSet('food', 3); // štartovacie krmivo
    }

    const hungerOf = (v) => {
      const h = (Date.now() - (v.fed || 0)) / 3600000;
      if (h < FEED_FRESH_H) return 'happy';
      if (h < FEED_HUNGRY_H) return 'hungry';
      return 'sad';
    };
    const todayStr = () => new Date().toISOString().slice(0, 10);

    const draw = () => {
      container.innerHTML = '';
      const tierIndex = Math.min(lsGet('homeTier', 0), HOME_TIERS.length - 1);
      const slots = HOME_SLOTS[tierIndex] || 12;
      const villagers = lsGet('villagers', []);
      const decos = lsGet('decos2', []);
      const food = lsGet('food', 0);
      const fedCount = villagers.filter(v => hungerOf(v) === 'happy').length;

      container.appendChild(el('p', 'subtitle',
        villagers.length
          ? 'Ťukni na kamaráta a nakŕm ho! 💚'
          : 'Adoptuj si kamarátov dole v obchode! 🐾'));

      // ——— živá scéna ———
      const scene = el('div', 'v2-scene');
      scene.appendChild(el('span', 'v2-home', HOME_TIERS[tierIndex].emoji));
      decos.forEach((id, i) => {
        const it = COLLECTIBLES.find(c => c.id === id);
        if (!it) return;
        const spot = DECO_SPOTS[i % DECO_SPOTS.length];
        const s = el('span', 'v2-deco', it.emoji);
        s.style.left = spot.left;
        s.style.bottom = spot.bottom;
        scene.appendChild(s);
      });
      villagers.forEach((v, i) => {
        const it = COLLECTIBLES.find(c => c.id === v.id);
        if (!it) return;
        const state = hungerOf(v);
        const w = el('button', `v2-walker ${state}`);
        if (state !== 'happy') {
          w.appendChild(el('span', 'v2-bubble', state === 'hungry' ? '🍽️' : '💔'));
        }
        w.appendChild(el('span', 'v2-emoji', it.emoji));
        w.style.left = `${6 + (i * 83) % 68}%`;
        w.style.setProperty('--dist', `${30 + (i * 37) % 60}px`);
        w.style.setProperty('--dur', `${7 + (i * 3) % 8}s`);
        w.title = it.name;
        w.addEventListener('click', () => {
          ensureAudio();
          if (hungerOf(v) === 'happy') {
            sfx.click();
            toast(`${it.name} má plné bruško a teší sa! 💚`);
            return;
          }
          const f = lsGet('food', 0);
          if (f <= 0) { sfx.wrong(); toast('Nemáš krmivo! Kúp ho dole 🥕'); return; }
          lsSet('food', f - 1);
          const arr = lsGet('villagers', []);
          const me = arr.find(x => x.id === v.id);
          if (me) me.fed = Date.now();
          lsSet('villagers', arr);
          sfx.correct();
          confetti(6);
          toast(`Mňam! ${it.name} má plné bruško. ❤️`);
          speak('Mňam, mňam! Ďakujem!', 1);
          draw();
        });
        scene.appendChild(w);
      });
      container.appendChild(scene);

      // ——— stav dedinky ———
      const bar = el('div', 'v2-status');
      bar.appendChild(el('span', '', `🥕 Krmivo: <b>${food}</b>`));
      bar.appendChild(el('span', '', `💚 Najedení: <b>${fedCount}/${villagers.length}</b>`));
      bar.appendChild(el('span', '', `🏠 Miesta: <b>${villagers.length}/${slots}</b>`));
      container.appendChild(bar);

      // ——— denný poklad za starostlivosť ———
      const claimed = lsGet('villageBonusDay', '') === todayStr();
      if (villagers.length >= 3 && fedCount === villagers.length && !claimed) {
        const chest = el('button', 'btn btn-primary btn-big', '🎁 Všetci najedení! Otvor denný poklad (+5 💎)');
        chest.addEventListener('click', () => {
          ensureAudio();
          lsSet('villageBonusDay', todayStr());
          award(5);
          sfx.win(); confetti(20);
          toast('Denný poklad! +5 💎 🎉', 2600);
          speak('Denný poklad! Kamaráti ti ďakujú!', 1);
          draw();
        });
        container.appendChild(chest);
      } else if (claimed) {
        container.appendChild(el('p', 'muted center-note', '🎁 Denný poklad si dnes už našla – príď zajtra!'));
      } else if (villagers.length > 0) {
        container.appendChild(el('p', 'muted center-note',
          villagers.length < 3
            ? '🎁 Denný poklad dostaneš, keď sa budeš starať aspoň o 3 kamarátov.'
            : '🎁 Nakŕm všetkých kamarátov a dedinka ti daruje denný poklad!'));
      }

      // ——— krmivo ———
      const foodBtn = el('button', 'btn btn-green btn-big', '🥕 Kúpiť krmivo ×5 (3 💎)');
      foodBtn.addEventListener('click', () => {
        ensureAudio();
        if (spend(3)) {
          lsSet('food', lsGet('food', 0) + 5);
          sfx.place();
          toast('+5 🥕 krmiva!');
          draw();
        } else { sfx.wrong(); toast(`Ešte ti chýba ${3 - getDiamonds()} 💎`); }
      });
      container.appendChild(foodBtn);

      // ——— domov = viac miest pre kamarátov ———
      container.appendChild(el('h3', 'shop-title', '🏗️ Tvoj domov'));
      const homeShop = el('div', 'shop-list');
      const cur = HOME_TIERS[tierIndex];
      const curRow = el('div', 'shop-item');
      curRow.appendChild(el('span', 'shop-emoji', cur.emoji));
      const ci = el('div', 'shop-info');
      ci.appendChild(el('div', 'shop-name', cur.name));
      ci.appendChild(el('div', 'shop-cost', `miesta pre ${slots} kamarátov`));
      curRow.appendChild(ci);
      curRow.appendChild(el('span', 'shop-owned', '✅'));
      homeShop.appendChild(curRow);

      const nextTier = HOME_TIERS[tierIndex + 1];
      if (nextTier) {
        const row = el('div', 'shop-item');
        row.appendChild(el('span', 'shop-emoji', nextTier.emoji));
        const inf = el('div', 'shop-info');
        inf.appendChild(el('div', 'shop-name', `Vylepšiť na: ${nextTier.name}`));
        inf.appendChild(el('div', 'shop-cost',
          `${nextTier.cost} 💎 · miesta pre ${HOME_SLOTS[tierIndex + 1]} kamarátov`));
        row.appendChild(inf);
        const btn = el('button', 'btn btn-green', 'Vylepšiť');
        btn.addEventListener('click', () => {
          ensureAudio();
          if (spend(nextTier.cost)) {
            lsSet('homeTier', tierIndex + 1);
            sfx.win(); confetti(16);
            toast(`Nový domov: ${nextTier.name}! Viac miesta pre kamarátov! 🎉`, 2600);
            speak(nextTier.name, 1);
            draw();
          } else { sfx.wrong(); toast(`Ešte ti chýba ${nextTier.cost - getDiamonds()} 💎`); }
        });
        row.appendChild(btn);
        homeShop.appendChild(row);
      }
      container.appendChild(homeShop);

      // ——— adopcia kamarátov ———
      const pool = COLLECTIBLES.filter(c => c.cat === 'zvierata' || c.cat === 'postavicky');
      const ownedIds = new Set(villagers.map(v => v.id));
      container.appendChild(el('h3', 'shop-title',
        `🐾 Adoptuj kamaráta <span class="muted">(${ownedIds.size}/${pool.length})</span>`));
      const full = villagers.length >= slots;
      if (full) {
        container.appendChild(el('div', 'hint-banner',
          '🔒 Domov je plný! Vylepši domček vyššie, aby sa zmestili ďalší kamaráti.'));
      }
      const adoptList = el('div', 'shop-list');
      pool.forEach(it => {
        const row = el('div', 'shop-item');
        row.appendChild(el('span', 'shop-emoji', it.emoji));
        const inf = el('div', 'shop-info');
        inf.appendChild(el('div', 'shop-name', it.name));
        inf.appendChild(el('div', 'shop-cost', `${it.cost} 💎`));
        row.appendChild(inf);
        if (ownedIds.has(it.id)) {
          row.appendChild(el('span', 'shop-owned', '✔️ býva tu'));
        } else if (full) {
          row.appendChild(el('span', 'shop-locked', '🔒'));
        } else {
          const btn = el('button', 'btn btn-green', 'Adoptovať');
          btn.addEventListener('click', () => {
            ensureAudio();
            if (spend(it.cost)) {
              const arr = lsGet('villagers', []);
              arr.push({ id: it.id, fed: Date.now() });
              lsSet('villagers', arr);
              sfx.win(); confetti(12);
              toast(`${it.name} sa prisťahoval! Staraj sa oňho. 🎉`, 2400);
              speak(`${it.name} je tvoj nový kamarát!`, 1);
              draw();
            } else { sfx.wrong(); toast(`Ešte ti chýba ${it.cost - getDiamonds()} 💎`); }
          });
          row.appendChild(btn);
        }
        adoptList.appendChild(row);
      });
      container.appendChild(adoptList);

      // ——— ozdoby dedinky ———
      const decoPool = COLLECTIBLES.filter(c => c.cat === 'rastliny' || c.cat === 'zabava');
      const decoOwned = new Set(decos);
      container.appendChild(el('h3', 'shop-title',
        `🌳 Ozdoby dedinky <span class="muted">(${decoOwned.size}/${decoPool.length})</span>`));
      const decoList = el('div', 'shop-list');
      decoPool.forEach(it => {
        const row = el('div', 'shop-item');
        row.appendChild(el('span', 'shop-emoji', it.emoji));
        const inf = el('div', 'shop-info');
        inf.appendChild(el('div', 'shop-name', it.name));
        inf.appendChild(el('div', 'shop-cost', `${it.cost} 💎`));
        row.appendChild(inf);
        if (decoOwned.has(it.id)) {
          row.appendChild(el('span', 'shop-owned', '✔️ máš'));
        } else {
          const btn = el('button', 'btn btn-green', 'Kúpiť');
          btn.addEventListener('click', () => {
            ensureAudio();
            if (spend(it.cost)) {
              const arr = lsGet('decos2', []);
              arr.push(it.id);
              lsSet('decos2', arr);
              sfx.place(); confetti(8);
              toast(`Pribudlo: ${it.name}! 🎉`, 1800);
              draw();
            } else { sfx.wrong(); toast(`Ešte ti chýba ${it.cost - getDiamonds()} 💎`); }
          });
          row.appendChild(btn);
        }
        decoList.appendChild(row);
      });
      container.appendChild(decoList);

      const goPlay = el('button', 'btn btn-primary btn-big', '🎮 Poď hrať a zbierať 💎');
      goPlay.addEventListener('click', () => { location.hash = ''; });
      container.appendChild(goPlay);
    };

    draw();
  },
};

export const GAMES = [
  gameKampan,
  gameLogopedia,
  gameZvuky,
  gameMatika,
  gameHlavolamy,
  gameVelka,
  gameHodiny,
  gamePeniaze,
  gameTvary,
  gameCitanie,
  gameAnglictina,
  gameMalovanka,
  gameSvet,
];
