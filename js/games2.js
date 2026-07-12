// ===== Nové hry: Obchodík (peniaze) a Tvary =====
import {
  el, shuffle, randInt, sample, award, toast, confetti,
  progressDots, later,
} from './core.js';
import { speak, canSpeak, sfx, ensureAudio, numberToSlovak } from './audio.js';
import { SHOP_ITEMS, SHAPES, SHAPE_REAL, PRAISES } from './data.js';
import { recordResult, recordMistake } from './stats.js';
import {
  makeState, onWrongDefault, trackResult, praiseNow,
  resultScreen, levelScreen, armIdleHint,
} from './shared.js';

// ---------- peniaze: vykreslenie mincí a bankoviek ----------
function moneyEl(v) {
  const cls = v >= 5 ? `money note note-${v}` : `money coin coin-${v}`;
  return el('span', cls, `${v}€`);
}

// rozloží sumu na mince/bankovky (10, 5, 2, 1)
function decompose(total) {
  const out = [];
  [10, 5, 2, 1].forEach(v => {
    while (total >= v) { out.push(v); total -= v; }
  });
  return out;
}

function eurWord(n) {
  if (n === 1) return 'jedno euro';
  if (n >= 2 && n <= 4) return `${numberToSlovak(n)} eurá`;
  return `${numberToSlovak(n)} eur`;
}

// ---------- OBCHODÍK ----------
export const gamePeniaze = {
  id: 'peniaze',
  name: 'Obchodík',
  emoji: '💶',
  desc: 'Eurá a nakupovanie',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Vitaj v obchodíku! Nauč sa počítať peniaze 💶',
      [
        { emoji: '👛', label: 'Koľko peňazí?', mode: 'count' },
        { emoji: '🛒', label: 'Zaplať presne', mode: 'pay' },
        { emoji: '🤔', label: 'Čo si môžeš kúpiť?', mode: 'afford' },
      ],
      lvl => (lvl.mode === 'count' ? startCount()
        : lvl.mode === 'pay' ? startPay() : startAfford())
    );

    // — koľko peňazí je v peňaženke —
    const startCount = () => {
      const TOTAL = 8;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const gen = () => {
        for (let t = 0; t < 30; t++) {
          const parts = [];
          if (Math.random() < 0.4) parts.push(10);
          if (Math.random() < 0.5) parts.push(5);
          for (let i = 0; i < randInt(0, 2); i++) parts.push(2);
          for (let i = 0; i < randInt(0, 2); i++) parts.push(1);
          const total = parts.reduce((a, b) => a + b, 0);
          if (total >= 1 && total <= 20 && parts.length >= 1) return shuffle(parts);
        }
        return [2, 1];
      };

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startCount); return; }
        dots.set(idx, 'current');
        const parts = gen();
        const total = parts.reduce((a, b) => a + b, 0);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('p', '', 'Koľko peňazí je v peňaženke? 👛'));
        const wallet = el('div', 'money-row');
        parts.forEach(v => wallet.appendChild(moneyEl(v)));
        panel.appendChild(wallet);

        const opts = new Set([total]);
        while (opts.size < 4) {
          const d = total + sample([-3, -2, -1, 1, 2, 3]);
          if (d >= 1 && d <= 23) opts.add(d);
        }
        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[total]) btnFor[total].classList.add('hint'); };
        shuffle([...opts]).forEach(opt => {
          const b = el('button', 'btn', `${opt} €`);
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === total) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(`Áno, je to ${eurWord(total)}!`, 0.95);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'peniaze', gameName: 'Obchodík', skill: 'peniaze:count', skillName: 'Počítanie peňazí' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'peniaze:count', skillName: 'Počítanie peňazí',
                label: parts.join('+') + '€', chose: opt, correct: total,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak('Sčítaj všetky peniaze v peňaženke.', 0.9), reveal);
        later(() => speak('Koľko peňazí vidíš?', 0.9), 350);
      };
      next();
    };

    // — zaplať presne (realistická scéna) —
    const startPay = () => {
      const TOTAL = 6;
      const WALLET = [10, 5, 2, 2, 1, 1];
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startPay); return; }
        dots.set(idx, 'current');
        const item = sample(SHOP_ITEMS);
        const price = randInt(2, 15);
        const st = makeState();
        let paid = [];      // hodnoty na pulte
        let busy = false;

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel shop-panel');
        const scene = el('div', 'shop-scene');
        const card = el('div', 'shop-card');
        card.appendChild(el('div', 'shop-item-emoji', item.e));
        card.appendChild(el('div', 'price-tag', `${price} €`));
        scene.appendChild(card);
        panel.appendChild(scene);
        panel.appendChild(el('p', '', `Kúp si <b>${item.name}</b> – zaplať presne <b>${price} €</b>. Ťukaj na peniaze!`));

        const counter = el('div', 'money-row counter');
        const counterInfo = el('div', 'counter-info', 'Zaplatené: <b>0 €</b>');
        panel.appendChild(counter);
        panel.appendChild(counterInfo);

        const walletRow = el('div', 'money-row wallet');
        panel.appendChild(walletRow);

        const sum = () => paid.reduce((a, b) => a + b, 0);
        const refresh = () => {
          counterInfo.innerHTML = `Zaplatené: <b>${sum()} €</b> z ${price} €`;
        };

        const success = () => {
          st.locked = true;
          sfx.correct();
          confetti(10);
          speak(`Výborne, zaplatila si presne ${eurWord(price)}!`, 0.95);
          if (st.firstTry) { score++; award(1); toast(`${sample(PRAISES)} +1 💎`); }
          else toast(sample(PRAISES));
          trackResult(st, { game: 'peniaze', gameName: 'Obchodík', skill: 'peniaze:pay', skillName: 'Platenie' });
          dots.set(idx, st.firstTry ? 'ok' : 'bad');
          idx++;
          later(next, 1800);
        };

        const overshoot = () => {
          if (st.firstTry) {
            recordMistake({ skill: 'peniaze:pay', skillName: 'Platenie', label: `${item.name} za ${price}€`, chose: `${sum()}€`, correct: `${price}€` });
          }
          st.firstTry = false;
          busy = true;
          sfx.wrong();
          counter.classList.add('wiggle');
          toast('To je priveľa peňazí! Skús znova. 🙂');
          later(() => {
            counter.classList.remove('wiggle');
            paid = [];
            counter.innerHTML = '';
            walletRow.querySelectorAll('.money').forEach(m => { m.classList.remove('used'); });
            refresh();
            busy = false;
          }, 900);
        };

        WALLET.forEach(v => {
          const m = moneyEl(v);
          m.addEventListener('click', () => {
            if (st.locked || busy || m.classList.contains('used')) return;
            ensureAudio();
            sfx.click();
            m.classList.add('used');
            paid.push(v);
            const c = moneyEl(v);
            c.dataset.v = v;
            c.addEventListener('click', () => {
              // vrátenie mince z pultu
              if (st.locked || busy) return;
              ensureAudio(); sfx.click();
              paid.splice(paid.indexOf(v), 1);
              c.remove();
              const back = [...walletRow.querySelectorAll('.money.used')]
                .find(x => x.textContent === `${v}€`);
              if (back) back.classList.remove('used');
              refresh();
            });
            counter.appendChild(c);
            refresh();
            const s = sum();
            if (s === price) success();
            else if (s > price) overshoot();
          });
          walletRow.appendChild(m);
        });
        refresh();
        container.appendChild(panel);

        armIdleHint(
          () => speak(`Zaplať presne ${eurWord(price)}. Skladaj peniaze, kým nebude súčet ${price}.`, 0.9),
          null);
        later(() => speak(`Kúp si ${item.name}. Stojí ${eurWord(price)}.`, 0.9), 350);
      };
      next();
    };

    // — čo si môžeš kúpiť —
    const startAfford = () => {
      const TOTAL = 8;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startAfford); return; }
        dots.set(idx, 'current');
        const budget = randInt(3, 15);
        const okPrice = randInt(1, budget);
        const items = shuffle(SHOP_ITEMS).slice(0, 3);
        const prices = [okPrice, budget + randInt(1, 5), budget + randInt(6, 10)];
        const order = shuffle([0, 1, 2]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('p', '', `Máš <b>${budget} €</b>:`));
        const purse = el('div', 'money-row');
        decompose(budget).forEach(v => purse.appendChild(moneyEl(v)));
        panel.appendChild(purse);
        panel.appendChild(el('p', '', 'Na čo ti to stačí? 🤔'));

        const scene = el('div', 'shop-scene');
        const btnFor = {};
        const reveal = () => { if (btnFor.ok) btnFor.ok.classList.add('hint'); };
        order.forEach(i => {
          const card = el('button', 'shop-card buyable');
          card.appendChild(el('div', 'shop-item-emoji', items[i].e));
          card.appendChild(el('div', 'price-tag', `${prices[i]} €`));
          if (i === 0) btnFor.ok = card;
          card.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (i === 0) {
              st.locked = true;
              card.classList.add('correct');
              card.classList.remove('hint');
              sfx.correct();
              speak(`Áno! ${items[0].name} stojí ${eurWord(prices[0])} a ty máš ${eurWord(budget)}.`, 0.92);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'peniaze', gameName: 'Obchodík', skill: 'peniaze:afford', skillName: 'Rozhodovanie o nákupe' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1900);
            } else {
              onWrongDefault(st, card, reveal, {
                skill: 'peniaze:afford', skillName: 'Rozhodovanie o nákupe',
                label: `${budget}€ vs ${prices[i]}€`, chose: `${prices[i]}€`, correct: `${prices[0]}€`,
              });
            }
          });
          scene.appendChild(card);
        });
        panel.appendChild(scene);
        container.appendChild(panel);

        armIdleHint(() => speak(`Hľadaj vec, ktorá stojí ${eurWord(budget)} alebo menej.`, 0.9), reveal);
        later(() => speak(`Máš ${eurWord(budget)}. Čo si môžeš kúpiť?`, 0.9), 350);
      };
      next();
    };

    pick();
  },
};

// ---------- TVARY ----------
function shapeSVG(id, color, size = 90) {
  const s = size;
  const stroke = 'stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"';
  let inner = '';
  if (id === 'kruh') inner = `<circle cx="50" cy="50" r="40" fill="${color}" ${stroke}/>`;
  else if (id === 'stvorec') inner = `<rect x="14" y="14" width="72" height="72" rx="4" fill="${color}" ${stroke}/>`;
  else if (id === 'obdlznik') inner = `<rect x="6" y="26" width="88" height="48" rx="4" fill="${color}" ${stroke}/>`;
  else if (id === 'trojuholnik') inner = `<polygon points="50,12 90,84 10,84" fill="${color}" ${stroke}/>`;
  else if (id === 'oval') inner = `<ellipse cx="50" cy="50" rx="44" ry="30" fill="${color}" ${stroke}/>`;
  else if (id === 'kosostvorec') inner = `<polygon points="50,8 88,50 50,92 12,50" fill="${color}" ${stroke}/>`;
  else if (id === 'hviezda') inner = `<polygon points="50,8 61,38 93,38 67,57 76,88 50,69 24,88 33,57 7,38 39,38" fill="${color}" ${stroke}/>`;
  else if (id === 'srdce') inner = `<path d="M50 88 C20 64 8 44 16 28 C22 15 40 14 50 30 C60 14 78 15 84 28 C92 44 80 64 50 88 Z" fill="${color}" ${stroke}/>`;
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

export const gameTvary = {
  id: 'tvary',
  name: 'Tvary',
  emoji: '🔷',
  desc: 'Kruh, štvorec, trojuholník…',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Poďme spoznávať tvary! 🔷',
      [
        { emoji: '🔷', label: 'Ako sa volá tento tvar?', mode: 'name' },
        { emoji: '🔢', label: 'Spočítaj tvary', mode: 'count' },
        { emoji: '🍕', label: 'Tvary okolo nás', mode: 'real' },
      ],
      lvl => (lvl.mode === 'name' ? startName()
        : lvl.mode === 'count' ? startCountShapes() : startReal())
    );

    // — pomenuj tvar —
    const startName = () => {
      const TOTAL = 8;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startName); return; }
        dots.set(idx, 'current');
        const shape = sample(SHAPES);
        const distractors = shuffle(SHAPES.filter(x => x.id !== shape.id)).slice(0, 3);
        const options = shuffle([shape, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        const disp = el('div', 'shape-display');
        disp.innerHTML = shapeSVG(shape.id, shape.color, 130);
        panel.appendChild(disp);
        panel.appendChild(el('p', '', 'Ako sa volá tento tvar?'));

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[shape.id]) btnFor[shape.id].classList.add('hint'); };
        options.forEach(o => {
          const b = el('button', 'btn', o.name.toUpperCase());
          btnFor[o.id] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (o.id === shape.id) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(shape.name, 0.95);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'tvary', gameName: 'Tvary', skill: 'tvary:name', skillName: 'Názvy tvarov' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'tvary:name', skillName: 'Názvy tvarov',
                label: shape.name, chose: o.name, correct: shape.name,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak('Pozri sa dobre na tvar a vyber jeho meno.', 0.9), reveal);
      };
      next();
    };

    // — spočítaj tvary na obrázku —
    const startCountShapes = () => {
      const TOTAL = 8;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startCountShapes); return; }
        dots.set(idx, 'current');
        const kinds = shuffle(SHAPES).slice(0, 3);
        const target = kinds[0];
        const targetN = randInt(2, 6);
        const st = makeState();

        // rozlož tvary na mriežku 4×3 s náhodným posunom
        const cells = shuffle(Array.from({ length: 12 }, (_, i) => i));
        const placed = [];
        for (let i = 0; i < targetN; i++) placed.push({ kind: target, cell: cells.pop() });
        const otherN = randInt(3, 5);
        for (let i = 0; i < otherN; i++) {
          placed.push({ kind: kinds[1 + (i % 2)], cell: cells.pop() });
        }

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('p', '', `Koľko je tu tvarov <b>${target.name}</b>?`));
        const miniWrap = el('span', 'shape-inline');
        miniWrap.innerHTML = shapeSVG(target.id, target.color, 34);
        panel.querySelector('p').appendChild(miniWrap);

        const field = el('div', 'shape-field');
        placed.forEach(p => {
          const r = Math.floor(p.cell / 4), c = p.cell % 4;
          const sp = el('span', 'shape-abs');
          sp.style.left = `calc(${c * 25}% + ${randInt(2, 8)}%)`;
          sp.style.top = `calc(${r * 33}% + ${randInt(2, 8)}%)`;
          sp.innerHTML = shapeSVG(p.kind.id, p.kind.color, randInt(30, 42));
          field.appendChild(sp);
        });
        panel.appendChild(field);

        const grid = el('div', 'numbers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[targetN]) btnFor[targetN].classList.add('hint'); };
        for (let i = 1; i <= 8; i++) {
          const b = el('button', 'btn', String(i));
          btnFor[i] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (i === targetN) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'tvary', gameName: 'Tvary', skill: 'tvary:count', skillName: 'Počítanie tvarov' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'tvary:count', skillName: 'Počítanie tvarov',
                label: `${target.name} × ${targetN}`, chose: i, correct: targetN,
              });
            }
          });
          grid.appendChild(b);
        }
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(`Spočítaj len tvary ${target.name}. Ostatné nerátaj.`, 0.9), reveal);
        later(() => speak(`Koľko je na obrázku tvarov ${target.name}?`, 0.9), 350);
      };
      next();
    };

    // — tvary okolo nás —
    const startReal = () => {
      const TOTAL = 8;
      const items = shuffle(SHAPE_REAL).slice(0, TOTAL);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startReal); return; }
        dots.set(idx, 'current');
        const item = items[idx];
        const correct = SHAPES.find(s => s.id === item.shape);
        const distractors = shuffle(SHAPES.filter(x => x.id !== item.shape)).slice(0, 3);
        const options = shuffle([correct, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', item.e));
        panel.appendChild(el('p', '', `Aký tvar má ${item.name}?`));

        const grid = el('div', 'answers-grid shape-options');
        const btnFor = {};
        const reveal = () => { if (btnFor[correct.id]) btnFor[correct.id].classList.add('hint'); };
        options.forEach(o => {
          const b = el('button', 'btn shape-btn');
          b.innerHTML = shapeSVG(o.id, o.color, 56) + `<small>${o.name}</small>`;
          btnFor[o.id] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (o.id === correct.id) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(`Áno, ${item.name} má tvar ako ${correct.name}!`, 0.95);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'tvary', gameName: 'Tvary', skill: 'tvary:real', skillName: 'Tvary okolo nás' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'tvary:real', skillName: 'Tvary okolo nás',
                label: item.name, chose: o.name, correct: correct.name,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(`Aký tvar má ${item.name}?`, 0.9), reveal);
        later(() => speak(`Aký tvar má ${item.name}?`, 0.9), 350);
      };
      next();
    };

    pick();
  },
};
