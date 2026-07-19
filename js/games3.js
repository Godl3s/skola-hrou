// ===== Hlavolamy (hadík, pyramídy, rady, rozklady, slovné úlohy)
// ===== a Veľká matika (do 100, násobilka) =====
import {
  el, shuffle, randInt, sample, award, toast, confetti,
  progressDots, later, pickFresh,
} from './core.js';
import { speak, canSpeak, sfx, ensureAudio, numberToSlovak } from './audio.js';
import { WORD_PROBLEMS, PRAISES } from './data.js';
import { recordResult, recordMistake } from './stats.js';
import {
  makeState, onWrongDefault, trackResult, praiseNow,
  resultScreen, levelScreen, armIdleHint, disarmIdleHint, numPad,
} from './shared.js';
import { diffLevel, reportAnswer } from './adaptive.js';

function makeOptions(ans, max = 20, step = 1) {
  const set = new Set([ans]);
  const deltas = shuffle([-1, 1, -2, 2, 3, -3, 4, -4].map(d => d * step));
  for (const d of deltas) {
    if (set.size >= 4) break;
    const c = ans + d;
    if (c >= 0 && c <= max) set.add(c);
  }
  let x = 0;
  while (set.size < 4 && x <= max) { set.add(x); x += step; }
  return shuffle([...set]);
}

// ---------- HLAVOLAMY ----------
export const gameHlavolamy = {
  id: 'hlavolamy',
  name: 'Hlavolamy',
  emoji: '🐍',
  desc: 'Hadík, pyramídy, rady',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Matematické hlavolamy ako z učebnice! 🧠',
      [
        { emoji: '🐍', label: 'Počítací had', mode: 'had' },
        { emoji: '🔺', label: 'Súčtová pyramída', mode: 'pyramida' },
        { emoji: '🔢', label: 'Číselný rad', mode: 'rad' },
        { emoji: '🌳', label: 'Rozklad čísla', mode: 'rozklad' },
        { emoji: '📖', label: 'Slovné úlohy', mode: 'slovne' },
      ],
      lvl => ({ had: startHad, pyramida: startPyramida, rad: startRad, rozklad: startRozklad, slovne: startSlovne }[lvl.mode]())
    );

    // ===== 🐍 Počítací had =====
    // Dieťa píše medzivýsledky číselnou klávesnicou; vyhodnotenie až na konci.
    const startHad = () => {
      const TOTAL = 5;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0; // score = úplne správne hady

      const genChain = () => {
        // adaptívne: L1 = 2 kroky do 10, L2 = 3 kroky do 20, L3 = 4 kroky aj ±10
        const d = diffLevel('hlavolamy:had');
        const cap = d === 1 ? 10 : 20;
        for (let t = 0; t < 120; t++) {
          const steps = d === 1 ? 2 : d === 2 ? 3 : 4;
          let v = randInt(1, d === 1 ? 8 : 10);
          const chain = { start: v, ops: [], values: [] };
          let ok = true;
          for (let i = 0; i < steps; i++) {
            // metodika: znamienka striedať (nie 3× rovnaké za sebou)
            let op = Math.random() < 0.5 ? '+' : '−';
            const prev = chain.ops.slice(-2);
            if (prev.length === 2 && prev[0].op === op && prev[1].op === op) {
              op = op === '+' ? '−' : '+';
            }
            // na najvyššej úrovni občas krok ±10 (učebnicová reťazovka)
            const n = (d === 3 && Math.random() < 0.25) ? 10 : randInt(1, d === 1 ? 4 : 9);
            const nv = op === '+' ? v + n : v - n;
            if (nv < 0 || nv > cap) { ok = false; break; }
            chain.ops.push({ op, n });
            chain.values.push(nv);
            v = nv;
          }
          if (ok) return chain;
        }
        return { start: 5, ops: [{ op: '+', n: 3 }, { op: '−', n: 2 }, { op: '+', n: 4 }], values: [8, 6, 10] };
      };

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startHad); return; }
        dots.set(idx, 'current');
        const chain = genChain();
        const entered = [];
        let active = 0;
        let finished = false;

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('p', 'subtitle', '🐍 Počítaj hadíka krok za krokom!'));

        const snake = el('div', 'snake');
        snake.appendChild(el('div', 'snake-cell head', String(chain.start)));
        const cellEls = [];
        chain.ops.forEach(o => {
          snake.appendChild(el('div', 'snake-op', `${o.op}${o.n}`));
          const c = el('div', 'snake-cell entry');
          snake.appendChild(c);
          cellEls.push(c);
        });
        panel.appendChild(snake);
        panel.appendChild(el('p', '', '<small>Píš výsledky postupne – na konci uvidíš, či si trafila! 🎯</small>'));

        const paintActive = () => {
          cellEls.forEach((c, i) => c.classList.toggle('active', i === active && !finished));
        };
        paintActive();

        const evaluate = () => {
          finished = true;
          disarmIdleHint();
          paintActive();
          let correctSteps = 0;
          chain.values.forEach((v, i) => {
            const okStep = entered[i] === v;
            cellEls[i].classList.add(okStep ? 'ok' : 'bad');
            if (okStep) correctSteps++;
            else cellEls[i].appendChild(el('span', 'snake-fix', String(v)));
            recordResult({ game: 'hlavolamy', gameName: 'Hlavolamy', skill: 'hlavolamy:had', skillName: 'Počítací had', firstTry: okStep });
            reportAnswer('hlavolamy:had', okStep);
            if (!okStep) {
              const from = i === 0 ? chain.start : chain.values[i - 1];
              recordMistake({
                skill: 'hlavolamy:had', skillName: 'Počítací had',
                label: `${from} ${chain.ops[i].op} ${chain.ops[i].n}`,
                chose: entered[i], correct: v,
              });
            }
          });
          const perfect = correctSteps === chain.values.length;
          if (perfect) {
            score++;
            award(chain.values.length);
            sfx.win(); confetti(14);
            toast(`🎯 Trafila si! Celý hadík správne! +${chain.values.length} 💎`, 2600);
            speak('Trafila si! Celý hadík je správne!', 1);
            dots.set(idx, 'ok');
          } else if (correctSteps > 0) {
            award(correctSteps);
            sfx.correct();
            toast(`Správne kroky: ${correctSteps} z ${chain.values.length} (+${correctSteps} 💎). Zelené sedia, červené si pozri. 🙂`, 3200);
            speak('Pozri si, kde sa hadík pomýlil. Zelené kroky máš správne!', 0.95);
            dots.set(idx, 'bad');
          } else {
            sfx.wrong();
            toast('Nevadí! Pozri si správne čísla a skús ďalšieho hadíka. 💪', 3000);
            dots.set(idx, 'bad');
          }
          idx++;
          later(next, perfect ? 2300 : 4200);
        };

        const pad = numPad({
          onChange: (v) => { if (!finished && cellEls[active]) cellEls[active].textContent = v; },
          onOk: (n) => {
            if (finished) return;
            entered.push(n);
            cellEls[active].textContent = String(n);
            cellEls[active].classList.add('filled');
            sfx.click();
            active++;
            if (active >= cellEls.length) evaluate();
            else paintActive();
          },
        });
        panel.appendChild(pad.node);
        container.appendChild(panel);

        armIdleHint(() => speak(
          `Začni číslom ${numberToSlovak(chain.start)}. ` +
          `${chain.ops[0].op === '+' ? 'Pripočítaj' : 'Odpočítaj'} ${numberToSlovak(chain.ops[0].n)} a napíš výsledok.`, 0.9), null);
        later(() => speak('Počítaj hadíka! Píš výsledky postupne.', 0.95), 350);
      };
      next();
    };

    // ===== 🔺 Súčtová pyramída =====
    const startPyramida = () => {
      const TOTAL = 5;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const gen = () => {
        const d = diffLevel('hlavolamy:pyramida');
        const hi = d === 1 ? 4 : 6;
        for (let t = 0; t < 60; t++) {
          const a = randInt(1, hi), b = randInt(1, hi), c = randInt(1, hi);
          if (a + 2 * b + c <= 20) return { a, b, c, m1: a + b, m2: b + c, top: a + 2 * b + c };
        }
        return { a: 2, b: 3, c: 1, m1: 5, m2: 4, top: 9 };
      };

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startPyramida); return; }
        dots.set(idx, 'current');
        const p = gen();
        // na vyššej náročnosti obrátený variant: stredy dané, chýba spodná tehlička
        const inverse = diffLevel('hlavolamy:pyramida') >= 2 && idx % 2 === 1;
        const targets = inverse
          ? [
            { key: 'b', val: p.b, hintA: p.m1, hintB: p.a, hintOp: '−' },
            { key: 'top', val: p.top, hintA: p.m1, hintB: p.m2, hintOp: '+' },
          ]
          : [
            { key: 'm1', val: p.m1, hintA: p.a, hintB: p.b, hintOp: '+' },
            { key: 'm2', val: p.m2, hintA: p.b, hintB: p.c, hintOp: '+' },
            { key: 'top', val: p.top, hintA: p.m1, hintB: p.m2, hintOp: '+' },
          ];
        let active = 0;
        let errors = 0;
        let tries = 0;
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('p', 'subtitle', inverse
          ? '🔺 Pozor, teraz chýba tehlička dole – počítaj odčítaním!'
          : '🔺 Každá tehlička = súčet dvoch pod ňou!'));

        const pyr = el('div', 'pyramid');
        const rowTop = el('div', 'pyr-row');
        const topEl = el('div', 'pyr-brick entry');
        rowTop.appendChild(topEl);
        const rowMid = el('div', 'pyr-row');
        const m1El = el('div', inverse ? 'pyr-brick given' : 'pyr-brick entry', inverse ? String(p.m1) : '');
        const m2El = el('div', inverse ? 'pyr-brick given' : 'pyr-brick entry', inverse ? String(p.m2) : '');
        rowMid.append(m1El, m2El);
        const rowBot = el('div', 'pyr-row');
        const bEl = el('div', inverse ? 'pyr-brick entry' : 'pyr-brick given', inverse ? '' : String(p.b));
        rowBot.append(
          el('div', 'pyr-brick given', String(p.a)),
          bEl,
          el('div', 'pyr-brick given', String(p.c)),
        );
        pyr.append(rowTop, rowMid, rowBot);
        panel.appendChild(pyr);
        const brickEls = { m1: m1El, m2: m2El, top: topEl, b: bEl };

        const paintActive = () => {
          targets.forEach((t, i) => brickEls[t.key].classList.toggle('active', i === active));
        };
        paintActive();

        const sayHint = () => {
          const t = targets[active];
          if (t) speak(`Spočítaj ${numberToSlovak(t.hintA)} ${t.hintOp === '−' ? 'mínus' : 'plus'} ${numberToSlovak(t.hintB)}.`, 0.9);
        };

        const pad = numPad({
          onChange: (v) => {
            const t = targets[active];
            if (t) brickEls[t.key].textContent = v;
          },
          onOk: (n) => {
            const t = targets[active];
            if (!t) return;
            const elB = brickEls[t.key];
            tries++;
            if (n === t.val) {
              elB.textContent = String(n);
              elB.classList.remove('active', 'wiggle');
              elB.classList.add('ok');
              sfx.correct();
              active++;
              if (active >= targets.length) {
                disarmIdleHint();
                const firstTry = errors === 0;
                if (firstTry) score++;
                const gain = firstTry ? 2 : 1;
                award(gain);
                confetti(firstTry ? 12 : 6);
                toast(`${sample(PRAISES)} Pyramída hotová! +${gain} 💎`, 2400);
                speak(firstTry ? 'Pyramída bez jedinej chyby! Fantastické!' : 'Pyramída hotová!', 0.95);
                recordResult({ game: 'hlavolamy', gameName: 'Hlavolamy', skill: 'hlavolamy:pyramida', skillName: 'Súčtová pyramída', firstTry });
                reportAnswer('hlavolamy:pyramida', firstTry);
                dots.set(idx, firstTry ? 'ok' : 'bad');
                idx++;
                later(next, 2000);
              } else {
                paintActive();
                later(sayHint, 250);
              }
            } else {
              errors++;
              if (errors === 1) {
                recordMistake({
                  skill: 'hlavolamy:pyramida', skillName: 'Súčtová pyramída',
                  label: `${t.hintA} ${t.hintOp} ${t.hintB}`, chose: n, correct: t.val,
                });
              }
              elB.textContent = '';
              elB.classList.remove('wiggle');
              void elB.offsetWidth;
              elB.classList.add('wiggle');
              sfx.wrong();
              toast(errors >= 2 ? `Pomôcka: ${t.hintA} ${t.hintOp} ${t.hintB} 🙂` : 'Skús to ešte raz! 💪');
            }
          },
        });
        panel.appendChild(pad.node);
        container.appendChild(panel);

        armIdleHint(sayHint, null);
        later(sayHint, 400);
      };
      next();
    };

    // ===== 🔢 Číselný rad =====
    const startRad = () => {
      const TOTAL = 8;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const gen = () => {
        const d = diffLevel('hlavolamy:rad');
        const kind = sample(d === 1
          ? ['up1', 'down1', 'sused']
          : d === 2
            ? ['up1', 'down1', 'up2', 'up5', 'sused']
            : ['up1', 'down1', 'up2', 'up5', 'up10', 'down10', 'sused']);
        if (kind === 'sused') {
          const n = randInt(2, 19);
          const before = Math.random() < 0.5;
          return {
            kind, text: before
              ? `Ktoré číslo je hneď <b>pred</b> číslom ${n}?`
              : `Ktoré číslo je hneď <b>za</b> číslom ${n}?`,
            say: before ? `Ktoré číslo je hneď pred číslom ${numberToSlovak(n)}?`
              : `Ktoré číslo je hneď za číslom ${numberToSlovak(n)}?`,
            ans: before ? n - 1 : n + 1, max: 21, step: 1,
          };
        }
        let start, step, max;
        if (kind === 'up1') { start = randInt(1, 15); step = 1; max = 20; }
        else if (kind === 'down1') { start = randInt(8, 20); step = -1; max = 20; }
        else if (kind === 'up2') { start = randInt(1, 12); step = 2; max = 20; }
        else if (kind === 'up5') { start = sample([5, 10, 15, 20]); step = 5; max = 100; }
        else if (kind === 'down10') { start = sample([100, 90, 80, 70]); step = -10; max = 100; }
        else { start = sample([10, 20, 30, 40, 50, 60]); step = 10; max = 100; }
        const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
        const gap = randInt(1, 3);
        return { kind, seq, gap, ans: seq[gap], max, step: Math.abs(step) };
      };

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startRad); return; }
        dots.set(idx, 'current');
        const p = gen();
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');

        if (p.seq) {
          panel.appendChild(el('p', '', 'Aké číslo chýba v rade?'));
          const row = el('div', 'rad-row');
          p.seq.forEach((n, i) => {
            row.appendChild(el('div', `rad-cell${i === p.gap ? ' gap' : ''}`, i === p.gap ? '▢' : String(n)));
          });
          panel.appendChild(row);
        } else {
          panel.appendChild(el('p', 'sentence', p.text));
        }

        const sayIt = () => {
          if (p.say) speak(p.say, 0.85);
          else speak('Aké číslo chýba v rade?', 0.9);
        };
        if (canSpeak()) {
          const replay = el('button', 'btn btn-blue', '🔊 Prečítaj');
          replay.addEventListener('click', () => { ensureAudio(); sayIt(); });
          panel.appendChild(replay);
        }

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[p.ans]) btnFor[p.ans].classList.add('hint'); };
        makeOptions(p.ans, p.max, p.step).forEach(opt => {
          const b = el('button', 'btn', String(opt));
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === p.ans) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              if (p.seq) {
                const gapEl = panel.querySelector('.rad-cell.gap');
                if (gapEl) { gapEl.textContent = String(p.ans); gapEl.classList.add('ok'); }
              }
              sfx.correct();
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${praiseNow()} +1 💎`); }
              else toast(praiseNow());
              trackResult(st, { game: 'hlavolamy', gameName: 'Hlavolamy', skill: 'hlavolamy:rad', skillName: 'Číselný rad' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'hlavolamy:rad', skillName: 'Číselný rad',
                label: p.seq ? p.seq.map((n, i) => i === p.gap ? '▢' : n).join(', ') : p.say,
                chose: opt, correct: p.ans,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(sayIt, reveal);
        later(sayIt, 350);
      };
      next();
    };

    // ===== 🌳 Rozklad čísla =====
    const rozkladSVG = (total, known, side) => {
      const t = String(total);
      const l = side === 'left' ? String(known) : '?';
      const r = side === 'left' ? '?' : String(known);
      return `<svg viewBox="0 0 200 150" class="rozklad-svg" xmlns="http://www.w3.org/2000/svg">
        <line x1="100" y1="45" x2="55" y2="105" stroke="#2b2b2b" stroke-width="4"/>
        <line x1="100" y1="45" x2="145" y2="105" stroke="#2b2b2b" stroke-width="4"/>
        <circle cx="100" cy="35" r="30" fill="#f5c542" stroke="#2b2b2b" stroke-width="4"/>
        <circle cx="55" cy="112" r="27" fill="#aee3f8" stroke="#2b2b2b" stroke-width="4"/>
        <circle cx="145" cy="112" r="27" fill="#aee3f8" stroke="#2b2b2b" stroke-width="4"/>
        <text x="100" y="36" text-anchor="middle" dominant-baseline="central" font-size="26" font-weight="900" font-family="Nunito, sans-serif">${t}</text>
        <text x="55" y="113" text-anchor="middle" dominant-baseline="central" font-size="24" font-weight="900" font-family="Nunito, sans-serif">${l}</text>
        <text x="145" y="113" text-anchor="middle" dominant-baseline="central" font-size="24" font-weight="900" font-family="Nunito, sans-serif">${r}</text>
      </svg>`;
    };

    const startRozklad = () => {
      const TOTAL = 8;
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startRozklad); return; }
        dots.set(idx, 'current');
        // metodická gradácia podľa adaptívnej náročnosti:
        // L1 rozklady do 10 → L2 doplnky do 10 a desiatka+jednotky →
        // L3 aj dvojciferné (47 = 40 + ▢)
        const d = diffLevel('hlavolamy:rozklad');
        let total, known;
        if (d === 1) {
          total = randInt(5, 10);
          known = randInt(1, total - 1);
        } else if (d === 2) {
          if (idx % 2 === 0) {
            total = 10; // doplnky do 10 – kľúč k prechodu cez desiatku
            known = randInt(1, 9);
          } else {
            total = randInt(11, 19);
            known = Math.random() < 0.5 ? 10 : total - 10; // 14 = 10 + ▢
          }
        } else if (idx % 3 === 2) {
          total = randInt(2, 9) * 10 + randInt(1, 9); // 47 = 40 + ▢
          known = Math.floor(total / 10) * 10;
        } else {
          total = randInt(11, 20);
          known = randInt(1, total - 1);
        }
        const ans = total - known;
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('p', '', `Rozlož číslo <b>${total}</b> na dve časti!`));
        const disp = el('div', 'rozklad-wrap');
        disp.innerHTML = rozkladSVG(total, known, side);
        panel.appendChild(disp);
        panel.appendChild(el('p', '', `<small>${known} + ▢ = ${total}</small>`));

        const say = () => speak(`${numberToSlovak(total)} je ${numberToSlovak(known)} a koľko?`, 0.85);

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[ans]) btnFor[ans].classList.add('hint'); };
        makeOptions(ans, 20).forEach(opt => {
          const b = el('button', 'btn', String(opt));
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === ans) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              disp.innerHTML = rozkladSVG(total, known, side).replace('>?<', `>${ans}<`);
              sfx.correct();
              speak(`Áno! ${numberToSlovak(total)} je ${numberToSlovak(known)} a ${numberToSlovak(ans)}.`, 0.9);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'hlavolamy', gameName: 'Hlavolamy', skill: 'hlavolamy:rozklad', skillName: 'Rozklad čísla' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1800);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'hlavolamy:rozklad', skillName: 'Rozklad čísla',
                label: `${total} = ${known} + ▢`, chose: opt, correct: ans,
              });
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

    // ===== 📖 Slovné úlohy =====
    // náročnosť úlohy: 1 = do 10, 2 = do 20, 3 = do 100, 4 = násobenie
    // (násobenie sa zatiaľ nedáva – prváčka ho ešte nemala)
    const problemLvl = (p) => {
      if ((p.hint || '').includes('krát')) return 4;
      const nums = (p.text.match(/\d+/g) || []).map(Number);
      const mx = Math.max(p.answer, ...nums);
      if (mx <= 10) return 1;
      if (mx <= 20) return 2;
      return 3;
    };
    const startSlovne = () => {
      const TOTAL = 6;
      const d = diffLevel('hlavolamy:slovne');
      const pool = WORD_PROBLEMS.filter(p => problemLvl(p) <= d);
      const items = pickFresh(pool, TOTAL, 'slovne' + d, x => x.text);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startSlovne); return; }
        dots.set(idx, 'current');
        const p = items[idx];
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', p.emoji));
        panel.appendChild(el('p', 'word-problem', p.text));

        if (canSpeak()) {
          const replay = el('button', 'btn btn-blue', '🔊 Prečítaj úlohu');
          replay.addEventListener('click', () => { ensureAudio(); speak(p.text, 0.82); });
          panel.appendChild(replay);
        }

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[p.answer]) btnFor[p.answer].classList.add('hint'); };
        makeOptions(p.answer, Math.max(20, p.answer + 5)).forEach(opt => {
          const b = el('button', 'btn', String(opt));
          btnFor[opt] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (opt === p.answer) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(`Správne, ${numberToSlovak(p.answer)}!`, 0.95);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'hlavolamy', gameName: 'Hlavolamy', skill: 'hlavolamy:slovne', skillName: 'Slovné úlohy' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1700);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'hlavolamy:slovne', skillName: 'Slovné úlohy',
                label: p.text.slice(0, 40), chose: opt, correct: p.answer,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(p.hint || p.text, 0.82), reveal);
        later(() => speak(p.text, 0.82), 400);
      };
      next();
    };

    pick();
  },
};

// ---------- VEĽKÁ MATIKA (2. ročník) ----------
export const gameVelka = {
  id: 'velka',
  name: 'Veľká matika',
  emoji: '💯',
  desc: 'Do 100 a násobilka',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Matika pre druhákov – zvládneš to! 💪',
      [
        { emoji: '🔟', label: 'Desiatky (30 + 40)', mode: 'desiatky' },
        { emoji: '💯', label: 'Počítanie do 100', mode: 'do100' },
        { emoji: '✖️', label: 'Násobilka – predpríprava', mode: 'nasobilka' },
      ],
      lvl => ({ desiatky: startDesiatky, do100: startDo100, nasobilka: startNasobilka }[lvl.mode]())
    );

    const runQuestions = ({ TOTAL, skill, skillName, gen, restart }) => {
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, restart); return; }
        dots.set(idx, 'current');
        const p = gen(idx);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'math-expr', p.text));
        if (p.visual) panel.appendChild(el('div', 'math-blocks', p.visual));
        if (p.note) panel.appendChild(el('p', '', `<small>${p.note}</small>`));

        const replay = el('button', 'btn btn-blue', '🔊 Prečítaj príklad');
        replay.addEventListener('click', () => { ensureAudio(); speak(p.say, 0.85); });
        panel.appendChild(replay);

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[p.ans]) btnFor[p.ans].classList.add('hint'); };
        p.options.forEach(opt => {
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
              speak(`Správne, ${numberToSlovak(p.ans)}!`, 0.95);
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'velka', gameName: 'Veľká matika', skill, skillName });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 1600);
            } else {
              onWrongDefault(st, b, reveal, {
                skill, skillName, label: p.text.replace(' = ?', ''), chose: opt, correct: p.ans,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(p.say, 0.85), reveal);
        later(() => speak(p.say, 0.85), 350);
      };
      next();
    };

    // — celé desiatky do 100 —
    const startDesiatky = () => runQuestions({
      TOTAL: 8,
      skill: 'velka:desiatky', skillName: 'Desiatky do 100',
      restart: startDesiatky,
      gen: () => {
        for (let t = 0; t < 40; t++) {
          const op = Math.random() < 0.5 ? '+' : '−';
          const a = randInt(1, 9) * 10;
          const b = randInt(1, 9) * 10;
          const ans = op === '+' ? a + b : a - b;
          if (ans < 0 || ans > 100) continue;
          return {
            text: `${a} ${op} ${b} = ?`, ans,
            visual: '🔟'.repeat(a / 10) + (op === '+' ? ' ➕ ' : ' ➖ ') + '🔟'.repeat(b / 10),
            say: `Koľko je ${numberToSlovak(a)} ${op === '+' ? 'plus' : 'mínus'} ${numberToSlovak(b)}?`,
            options: makeOptions(ans, 100, 10),
          };
        }
        return { text: '30 + 40 = ?', ans: 70, say: 'Koľko je tridsať plus štyridsať?', options: makeOptions(70, 100, 10) };
      },
    });

    // — do 100 bez prechodu —
    const startDo100 = () => runQuestions({
      TOTAL: 8,
      skill: 'velka:do100', skillName: 'Počítanie do 100',
      restart: startDo100,
      gen: (qIdx) => {
        // postupnosť podľa ŠVP: TU±j → TU±desiatky → TU±TU (bez prechodu)
        const kind = qIdx < 5
          ? sample(['pj', 'mj', 'pd', 'md'])
          : sample(['pj', 'mj', 'pd', 'md', 'ptu', 'mtu']);
        if (kind === 'ptu') {
          // dvojciferné + dvojciferné bez prechodu (34 + 25)
          const u1 = randInt(1, 8), u2 = randInt(1, 9 - u1);
          const t1 = randInt(1, 7), t2 = randInt(1, 8 - t1);
          return mk(t1 * 10 + u1, t2 * 10 + u2, '+');
        }
        if (kind === 'mtu') {
          // dvojciferné − dvojciferné bez prechodu (78 − 43)
          const u2 = randInt(1, 8), u1 = randInt(u2 + 0, 9);
          const t2 = randInt(1, 7), t1 = randInt(t2 + 1, 9);
          return mk(t1 * 10 + u1, t2 * 10 + u2, '−');
        }
        if (kind === 'pj') {
          // TU + jednotky bez prechodu (34 + 5)
          const u = randInt(1, 8);
          const a = randInt(2, 9) * 10 + u;
          const b = randInt(1, 9 - u);
          return mk(a, b, '+');
        }
        if (kind === 'mj') {
          // TU − jednotky bez prechodu (67 − 4)
          const u = randInt(2, 9);
          const a = randInt(2, 9) * 10 + u;
          const b = randInt(1, u);
          return mk(a, b, '−');
        }
        if (kind === 'pd') {
          // TU + celé desiatky (34 + 20)
          const a = randInt(1, 7) * 10 + randInt(1, 9);
          const b = randInt(1, Math.floor((100 - a) / 10)) * 10;
          return mk(a, b, '+');
        }
        // TU − celé desiatky (78 − 30)
        const a = randInt(3, 9) * 10 + randInt(1, 9);
        const b = randInt(1, Math.floor(a / 10) - 1) * 10;
        return mk(a, b, '−');

        function mk(a, b, op) {
          const ans = op === '+' ? a + b : a - b;
          return {
            text: `${a} ${op} ${b} = ?`, ans,
            say: `Koľko je ${numberToSlovak(a)} ${op === '+' ? 'plus' : 'mínus'} ${numberToSlovak(b)}?`,
            options: makeOptions(ans, 100),
          };
        }
      },
    });

    // — násobilka v obore do 20 —
    const startNasobilka = () => runQuestions({
      TOTAL: 8,
      skill: 'velka:nasobilka', skillName: 'Násobilka',
      restart: startNasobilka,
      gen: (qIdx) => {
        // poradie radov podľa učebníc: 2 → 10 → 5 → 3 → 4 (súčiny max 20)
        const k = qIdx < 3 ? sample([2, 10]) : sample([2, 2, 10, 5, 3, 3, 4]);
        const n = randInt(1, Math.min(10, Math.floor(20 / k)));
        const ans = k * n;
        const emoji = sample(['🍎', '⭐', '🍓', '🐝', '🎈']);
        const groups = Array.from({ length: k }, () => emoji.repeat(n)).join('  ');
        return {
          text: `${k} × ${n} = ?`, ans,
          visual: k <= 5 ? groups : '',
          note: `${k} ${k >= 5 ? 'skupín' : 'skupiny'} po ${n}` + (k <= 5 && n > 0 ? ` = ${Array(k).fill(n).join(' + ')}` : ''),
          say: `Koľko je ${numberToSlovak(k)} krát ${numberToSlovak(n)}?`,
          options: makeOptions(ans, 20, n >= 2 ? n : 1),
        };
      },
    });

    pick();
  },
};
