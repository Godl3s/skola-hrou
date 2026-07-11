// ===== Všetky hry =====
import {
  el, shuffle, randInt, sample, award, toast, confetti,
  progressDots, lsGet, lsSet, getDiamonds, later,
} from './core.js';
import {
  speak, canSpeak, hasSlovakVoice, sfx, ensureAudio,
  playCountSounds, COUNT_SOUND_NAMES,
} from './audio.js';
import {
  SOUND_PAIRS, READING_WORDS, BUILD_WORDS, PIXEL_TEMPLATES, FREE_COLORS,
  HOUSE_STEPS, HOUSE_SCENE, HOUSE_STEP_COST, PRAISES, ENCOURAGE,
} from './data.js';

// ---------- spoločné pomôcky ----------
function praiseNow() {
  const p = sample(PRAISES);
  speak(p, 1);
  return p;
}

function levelScreen(container, introHtml, levels, onPick) {
  container.innerHTML = '';
  if (introHtml) container.appendChild(el('p', 'subtitle', introHtml));
  const list = el('div', 'level-list');
  levels.forEach(lvl => {
    const b = el('button', 'btn', `<span class="lvl-emoji">${lvl.emoji}</span> ${lvl.label}`);
    b.addEventListener('click', () => { ensureAudio(); sfx.click(); onPick(lvl); });
    list.appendChild(b);
  });
  container.appendChild(list);
}

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
  panel.appendChild(el('p', '', msg));
  if (bonus > 0) panel.appendChild(el('p', '', `Bonus: +${bonus} 💎`));
  const row = el('div', 'stack');
  const again = el('button', 'btn btn-primary btn-big', '🔁 Ešte raz');
  again.addEventListener('click', onAgain);
  const home = el('button', 'btn btn-big', '🏠 Domov');
  home.addEventListener('click', () => { location.hash = ''; });
  row.append(again, home);
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
        let locked = false;

        container.innerHTML = '';
        const banner = ttsHintBanner();
        if (banner) container.appendChild(banner);
        container.appendChild(dots.node);

        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        const wordDisplay = el('div', 'word-display', ttsOk ? '• • •' : item.w.toUpperCase());
        panel.appendChild(wordDisplay);

        if (ttsOk) {
          const replay = el('button', 'btn btn-blue btn-big', '🔊 Vypočuj slovo');
          replay.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(replay);
        }

        panel.appendChild(el('p', '', `Ktorú hlásku počuješ – <b>${pair.a}</b> alebo <b>${pair.b}</b>?`));

        const row = el('div', 'row');
        [pair.a, pair.b].forEach(letter => {
          const b = el('button', 'btn btn-huge', letter);
          b.addEventListener('click', () => {
            if (locked) return;
            locked = true;
            ensureAudio();
            const ok = letter === item.t;
            wordDisplay.innerHTML = highlightWord(item.w.toUpperCase(), item.t);
            if (ok) {
              b.classList.add('correct');
              sfx.correct();
              score++;
              award(1);
              toast(`${praiseNow()} +1 💎`);
            } else {
              b.classList.add('incorrect');
              sfx.wrong();
              row.querySelectorAll('.btn').forEach(x => {
                if (x.textContent === item.t) x.classList.add('correct');
              });
              toast(sample(ENCOURAGE));
            }
            dots.set(idx, ok ? 'ok' : 'bad');
            idx++;
            later(next, 1700);
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
        let played = false, playing = false, locked = false;

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
        for (let i = 1; i <= lvl.max; i++) {
          const b = el('button', 'btn', String(i));
          b.disabled = true;
          b.addEventListener('click', () => {
            if (locked || playing) return;
            locked = true;
            ensureAudio();
            const ok = i === n;
            if (ok) {
              b.classList.add('correct');
              sfx.correct();
              score++;
              award(1);
              toast(`${praiseNow()} +1 💎`);
            } else {
              b.classList.add('incorrect');
              sfx.wrong();
              numBtns[n - 1].classList.add('correct');
              toast(`Bolo ich ${n}. ${sample(ENCOURAGE)}`);
            }
            dots.set(idx, ok ? 'ok' : 'bad');
            idx++;
            later(next, 1700);
          });
          numBtns.push(b);
          grid.appendChild(b);
        }
        panel.appendChild(grid);
        container.appendChild(panel);

        playBtn.addEventListener('click', async () => {
          if (playing || locked) return;
          playing = true;
          playBtn.disabled = true;
          ensureAudio();
          await playCountSounds(n, kind, () => {
            speaker.style.transform = 'scale(1.35)';
            setTimeout(() => { speaker.style.transform = 'scale(1)'; }, 180);
          });
          playing = false;
          played = true;
          playBtn.disabled = false;
          playBtn.innerHTML = '🔁 Vypočuj ešte raz';
          numBtns.forEach(b => { b.disabled = false; });
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
        { emoji: '⚖️', label: 'Porovnaj čísla', type: 'compare' },
      ],
      lvl => (lvl.type === 'compare' ? startCompare(lvl) : start(lvl))
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
      // mix20
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
        let locked = false;

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', `${p.a} ${p.op} ${p.b} = ?`));

        // vizuálna pomôcka kockami (len pri menších číslach)
        if (p.a <= 10 && p.b <= 10) {
          if (p.op === '+') {
            panel.appendChild(el('div', 'math-blocks', '🟩'.repeat(p.a) + '🟨'.repeat(p.b)));
          } else {
            panel.appendChild(el('div', 'math-blocks', '🟦'.repeat(p.ans) + '🟥'.repeat(p.b)));
            if (p.b > 0) panel.appendChild(el('p', '', '<small>🟥 = tie zoberieme preč</small>'));
          }
        }

        const grid = el('div', 'answers-grid');
        const options = makeOptions(p.ans, p.max);
        options.forEach(opt => {
          const b = el('button', 'btn', String(opt));
          b.addEventListener('click', () => {
            if (locked) return;
            locked = true;
            ensureAudio();
            const ok = opt === p.ans;
            if (ok) {
              b.classList.add('correct');
              sfx.correct();
              score++;
              award(1);
              toast(`${praiseNow()} +1 💎`);
            } else {
              b.classList.add('incorrect');
              sfx.wrong();
              grid.querySelectorAll('.btn').forEach(x => {
                if (x.textContent === String(p.ans)) x.classList.add('correct');
              });
              toast(`Správne je ${p.ans}. ${sample(ENCOURAGE)}`);
            }
            dots.set(idx, ok ? 'ok' : 'bad');
            idx++;
            later(next, 1600);
          });
          grid.appendChild(b);
        });
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
        let locked = false;

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', `${a} ❓ ${b}`));
        panel.appendChild(el('div', 'math-blocks', '🟦'.repeat(a) || '⬜'));
        panel.appendChild(el('div', 'math-blocks', '🟥'.repeat(b) || '⬜'));
        panel.appendChild(el('p', '', `Je ${a} menej, rovnako alebo viac ako ${b}?`));

        const grid = el('div', 'answers-grid cols-3');
        [
          { sym: '<', label: 'menej' },
          { sym: '=', label: 'rovnako' },
          { sym: '>', label: 'viac' },
        ].forEach(o => {
          const b2 = el('button', 'btn', `${o.sym}<br><small>${o.label}</small>`);
          b2.addEventListener('click', () => {
            if (locked) return;
            locked = true;
            ensureAudio();
            const ok = o.sym === correct;
            if (ok) {
              b2.classList.add('correct');
              sfx.correct();
              score++;
              award(1);
              toast(`${praiseNow()} +1 💎`);
            } else {
              b2.classList.add('incorrect');
              sfx.wrong();
              toast(`Správne: ${a} ${correct} ${b}. ${sample(ENCOURAGE)}`);
            }
            dots.set(idx, ok ? 'ok' : 'bad');
            idx++;
            later(next, 1600);
          });
          grid.appendChild(b2);
        });
        panel.appendChild(grid);
        container.appendChild(panel);
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
  desc: 'Slová a písmenká',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Poďme čítať! 📖',
      [
        { emoji: '🖼️', label: 'Obrázok a slovo', mode: 'match' },
        { emoji: '🔤', label: 'Prvé písmenko', mode: 'first' },
        { emoji: '🧩', label: 'Poskladaj slovo', mode: 'build' },
      ],
      lvl => (lvl.mode === 'match' ? startMatch() : lvl.mode === 'first' ? startFirst() : startBuild())
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
        let locked = false;

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        panel.appendChild(el('p', '', 'Ktoré slovo patrí k obrázku?'));

        const stack = el('div', 'stack');
        options.forEach(o => {
          const b = el('button', 'btn btn-big', o.w.toUpperCase());
          b.addEventListener('click', () => {
            if (locked) return;
            locked = true;
            ensureAudio();
            const ok = o.w === item.w;
            if (ok) {
              b.classList.add('correct');
              sfx.correct();
              score++;
              award(1);
              speak(item.w);
              toast(`${sample(PRAISES)} +1 💎`);
            } else {
              b.classList.add('incorrect');
              sfx.wrong();
              stack.querySelectorAll('.btn').forEach(x => {
                if (x.textContent === item.w.toUpperCase()) x.classList.add('correct');
              });
              toast(`Toto je ${item.w.toUpperCase()}. ${sample(ENCOURAGE)}`);
            }
            dots.set(idx, ok ? 'ok' : 'bad');
            idx++;
            later(next, 1700);
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
        let locked = false;

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        if (canSpeak()) {
          const replay = el('button', 'btn btn-blue', '🔊 Vypočuj slovo');
          replay.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(replay);
        } else {
          panel.appendChild(el('div', 'word-display', item.w.toUpperCase()));
        }
        panel.appendChild(el('p', '', 'Akým písmenkom sa slovo začína?'));

        const grid = el('div', 'answers-grid');
        options.forEach(letter => {
          const b = el('button', 'btn', letter);
          b.addEventListener('click', () => {
            if (locked) return;
            locked = true;
            ensureAudio();
            const ok = letter === correct;
            const wd = el('div', 'word-display', highlightWord(item.w.toUpperCase(), correct));
            panel.insertBefore(wd, grid);
            if (ok) {
              b.classList.add('correct');
              sfx.correct();
              score++;
              award(1);
              toast(`${praiseNow()} +1 💎`);
            } else {
              b.classList.add('incorrect');
              sfx.wrong();
              grid.querySelectorAll('.btn').forEach(x => {
                if (x.textContent === correct) x.classList.add('correct');
              });
              toast(`Začína sa na ${correct}. ${sample(ENCOURAGE)}`);
            }
            dots.set(idx, ok ? 'ok' : 'bad');
            idx++;
            later(next, 1800);
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
        let filled = []; // { letter, tileIndex }
        let locked = false;

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        if (canSpeak()) {
          const replay = el('button', 'btn btn-blue', '🔊 Vypočuj slovo');
          replay.addEventListener('click', () => { ensureAudio(); speak(item.w); });
          panel.appendChild(replay);
        }
        panel.appendChild(el('p', '', 'Poskladaj slovo z písmeniek!'));

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
            if (locked || filled.length >= target.length) return;
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
          if (locked || filled.length === 0) return;
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
            locked = true;
            sfx.correct();
            score++;
            award(1);
            confetti(8);
            speak(item.w);
            toast(`${sample(PRAISES)} +1 💎`);
            dots.set(idx, 'ok');
            idx++;
            later(next, 1700);
          } else {
            sfx.wrong();
            slotEls.forEach(s => s.classList.add('wiggle'));
            toast('Skoro! Skús písmenká inak. 🙂');
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
        progress.innerHTML = remaining > 0
          ? `Ešte <b>${remaining}</b> políčok 🖌️`
          : '';
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
      const clear = el('button', 'btn', '🧹 Zmaž všetko');
      clear.addEventListener('click', () => {
        grid.querySelectorAll('.cell').forEach(c => { c.style.background = '#fff'; });
      });
      const doneBtn = el('button', 'btn btn-primary btn-big', '✨ Hotovo!');
      doneBtn.addEventListener('click', () => {
        ensureAudio();
        sfx.win();
        confetti(16);
        award(2);
        toast('Krásne dielo! +2 💎', 2400);
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

// ---------- 6) DOMČEK ----------
const gameDomcek = {
  id: 'domcek',
  name: 'Môj domček',
  emoji: '🏠',
  desc: 'Stavaj za diamanty',
  render(container) {
    container.innerHTML = '';
    const diamonds = getDiamonds();
    const unlocked = Math.min(Math.floor(diamonds / HOUSE_STEP_COST), HOUSE_STEPS.length);
    const seen = lsGet('houseSeen', 0);

    container.appendChild(el('p', 'subtitle',
      'Za každých 5 💎 sa postaví nová kocka tvojho svetíka!'));

    // scéna
    const wrap = el('div', 'scene-wrap');
    const scene = el('div', 'scene-grid');
    scene.style.gridTemplateColumns = `repeat(${HOUSE_SCENE.cols}, 1fr)`;

    const cellColor = {}; // "r,c" -> { color, isNew }
    HOUSE_STEPS.forEach((step, i) => {
      if (i >= unlocked) return;
      step.cells.forEach(([r, c]) => {
        cellColor[`${r},${c}`] = { color: step.color, isNew: i >= seen };
      });
    });

    for (let r = 0; r < HOUSE_SCENE.rows; r++) {
      for (let c = 0; c < HOUSE_SCENE.cols; c++) {
        const cell = el('div', 'cell');
        const info = cellColor[`${r},${c}`];
        if (info) {
          cell.style.background = info.color;
          if (info.isNew) cell.classList.add('new');
        }
        scene.appendChild(cell);
      }
    }
    wrap.appendChild(scene);
    container.appendChild(wrap);

    // nové kocky – oslava
    if (unlocked > seen) {
      const names = HOUSE_STEPS.slice(seen, unlocked).map(s => s.name).join(', ');
      later(() => {
        sfx.place();
        confetti(10);
        toast(`🧱 Postavené: ${names}!`, 2600);
      }, 400);
      lsSet('houseSeen', unlocked);
    }

    const panel = el('div', 'game-panel');
    panel.style.marginTop = '14px';

    if (unlocked >= HOUSE_STEPS.length) {
      panel.appendChild(el('div', 'big-emoji', '🎉'));
      panel.appendChild(el('p', '', '<b>Svetík je hotový!</b> Si úžasná staviteľka! Diamanty zbieraj ďalej – kto vie, čo pribudne nabudúce…'));
    } else {
      const nextStep = HOUSE_STEPS[unlocked];
      const progress = diamonds - unlocked * HOUSE_STEP_COST;
      const missing = HOUSE_STEP_COST - progress;
      panel.appendChild(el('p', '', `Ďalšia kocka: <b>${nextStep.name}</b>`));
      const bar = el('div', 'progress-bar');
      const fill = el('div', 'fill');
      fill.style.width = (progress / HOUSE_STEP_COST) * 100 + '%';
      bar.appendChild(fill);
      panel.appendChild(bar);
      panel.appendChild(el('p', '', `Ešte <b>${missing} 💎</b> – diamanty získaš v hrách! 🎮`));
      const goPlay = el('button', 'btn btn-primary btn-big', '🎮 Poď hrať!');
      goPlay.addEventListener('click', () => { location.hash = ''; });
      panel.appendChild(goPlay);
    }
    container.appendChild(panel);
  },
};

export const GAMES = [
  gameLogopedia,
  gameZvuky,
  gameMatika,
  gameCitanie,
  gameMalovanka,
  gameDomcek,
];
