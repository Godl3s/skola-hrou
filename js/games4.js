// ===== Angličtina: slovíčka, počúvanie, farby a čísla =====
import {
  el, shuffle, sample, award, toast, confetti,
  progressDots, later, pickFresh,
} from './core.js';
import { speak, canSpeak, sfx, ensureAudio } from './audio.js';
import { PRAISES } from './data.js';
import { EN_WORDS, EN_COLORS, EN_NUMBERS } from './data-en.js';
import {
  makeState, onWrongDefault, trackResult,
  resultScreen, levelScreen, armIdleHint, ttsHintBanner,
} from './shared.js';

// emoji na počítanie v režime Čísla
const COUNT_EMOJI = ['🍎', '⭐', '🐤', '🌸', '⚽', '🍓', '🎈', '🐞'];

export const gameAnglictina = {
  id: 'anglictina',
  name: 'Angličtina',
  emoji: '🇬🇧',
  desc: 'Slovíčka s obrázkami',
  render(container) {
    const pick = () => levelScreen(
      container,
      'Poďme sa učiť po anglicky! 🇬🇧',
      [
        { emoji: '🖼️', label: 'Obrázok a slovíčko', mode: 'word' },
        { emoji: '🎧', label: 'Počúvaj a vyber', mode: 'listen' },
        { emoji: '🎨', label: 'Farby', mode: 'colors' },
        { emoji: '🔢', label: 'Čísla', mode: 'numbers' },
      ],
      lvl => (lvl.mode === 'word' ? startWord()
        : lvl.mode === 'listen' ? startListen()
        : lvl.mode === 'colors' ? startColors() : startNumbers())
    );

    // — 🖼️ obrázok a slovíčko: emoji → vyber anglické slovo —
    const startWord = () => {
      const TOTAL = 8;
      const words = pickFresh(EN_WORDS, TOTAL, 'en-word', x => x.en);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startWord); return; }
        dots.set(idx, 'current');
        const word = words[idx];
        const distractors = shuffle(EN_WORDS.filter(x => x.en !== word.en)).slice(0, 3);
        const options = shuffle([word, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'big-emoji', word.e));
        panel.appendChild(el('p', '', 'Ako sa to povie po anglicky?'));

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[word.en]) btnFor[word.en].classList.add('hint'); };
        options.forEach(o => {
          const b = el('button', 'btn', o.en.toUpperCase());
          btnFor[o.en] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (o.en === word.en) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(word.en, 0.85, 'en-GB');
              panel.appendChild(el('div', 'en-translate', `${word.en} = ${word.sk}`));
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'anglictina', gameName: 'Angličtina', skill: 'en:word', skillName: 'Slovíčka' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 2000);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'en:word', skillName: 'Slovíčka',
                label: word.en, chose: o.en, correct: word.en,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(word.en, 0.8, 'en-GB'), reveal);
        later(() => speak(`Ako sa povie ${word.sk} po anglicky?`, 0.9), 350);
      };
      next();
    };

    // — 🎧 počúvaj a vyber správny obrázok —
    const startListen = () => {
      const TOTAL = 8;
      const words = pickFresh(EN_WORDS, TOTAL, 'en-listen', x => x.en);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startListen); return; }
        dots.set(idx, 'current');
        const word = words[idx];
        const distractors = shuffle(EN_WORDS.filter(x => x.en !== word.en)).slice(0, 3);
        const options = shuffle([word, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const banner = ttsHintBanner();
        if (banner) container.appendChild(banner);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('p', '', 'Počúvaj slovíčko a ťukni na správny obrázok! 🎧'));
        if (!canSpeak()) panel.appendChild(el('div', 'word-display', word.en));

        const say = el('button', 'btn en-say-btn', '🔊 Povedz znova');
        say.addEventListener('click', () => {
          ensureAudio(); sfx.click();
          speak(word.en, 0.8, 'en-GB');
        });
        panel.appendChild(say);

        const grid = el('div', 'answers-grid emoji-options');
        const btnFor = {};
        const reveal = () => { if (btnFor[word.en]) btnFor[word.en].classList.add('hint'); };
        options.forEach(o => {
          const b = el('button', 'btn', o.e);
          btnFor[o.en] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (o.en === word.en) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(word.en, 0.85, 'en-GB');
              panel.appendChild(el('div', 'en-translate', `${word.en} = ${word.sk}`));
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'anglictina', gameName: 'Angličtina', skill: 'en:listen', skillName: 'Počúvanie po anglicky' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 2000);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'en:listen', skillName: 'Počúvanie po anglicky',
                label: word.en, chose: o.en, correct: word.en,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(word.en, 0.8, 'en-GB'), reveal);
        later(() => {
          if (idx === 0) speak('Počúvaj a ťukni na správny obrázok.', 0.9).then(() => speak(word.en, 0.8, 'en-GB'));
          else speak(word.en, 0.8, 'en-GB');
        }, 450);
      };
      next();
    };

    // — 🎨 farby po anglicky —
    const startColors = () => {
      const TOTAL = 8;
      const colors = pickFresh(EN_COLORS, TOTAL, 'en-colors', x => x.en);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startColors); return; }
        dots.set(idx, 'current');
        const color = colors[idx];
        const distractors = shuffle(EN_COLORS.filter(x => x.en !== color.en)).slice(0, 3);
        const options = shuffle([color, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        const square = el('div', 'color-big');
        square.style.background = color.color;
        panel.appendChild(square);
        panel.appendChild(el('p', '', 'Aká je to farba po anglicky?'));

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[color.en]) btnFor[color.en].classList.add('hint'); };
        options.forEach(o => {
          const b = el('button', 'btn', o.en.toUpperCase());
          btnFor[o.en] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (o.en === color.en) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(color.en, 0.85, 'en-GB');
              panel.appendChild(el('div', 'en-translate', `${color.en} = ${color.sk}`));
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'anglictina', gameName: 'Angličtina', skill: 'en:colors', skillName: 'Farby po anglicky' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 2000);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'en:colors', skillName: 'Farby po anglicky',
                label: color.sk, chose: o.en, correct: color.en,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(color.en, 0.8, 'en-GB'), reveal);
        later(() => speak('Aká je to farba po anglicky?', 0.9), 350);
      };
      next();
    };

    // — 🔢 čísla po anglicky —
    const startNumbers = () => {
      const TOTAL = 8;
      const numbers = pickFresh(EN_NUMBERS, TOTAL, 'en-numbers', x => x.n);
      const dots = progressDots(TOTAL);
      let idx = 0, score = 0;

      const next = () => {
        if (idx >= TOTAL) { resultScreen(container, score, TOTAL, startNumbers); return; }
        dots.set(idx, 'current');
        const num = numbers[idx];
        const em = sample(COUNT_EMOJI);
        const distractors = shuffle(EN_NUMBERS.filter(x => x.n !== num.n)).slice(0, 3);
        const options = shuffle([num, ...distractors]);
        const st = makeState();

        container.innerHTML = '';
        container.appendChild(dots.node);
        const panel = el('div', 'game-panel');
        panel.appendChild(el('div', 'en-count-row', em.repeat(num.n)));
        panel.appendChild(el('p', '', 'Koľko ich je? Vyber anglické číslo.'));

        const grid = el('div', 'answers-grid');
        const btnFor = {};
        const reveal = () => { if (btnFor[num.en]) btnFor[num.en].classList.add('hint'); };
        options.forEach(o => {
          const b = el('button', 'btn', o.en.toUpperCase());
          btnFor[o.en] = b;
          b.addEventListener('click', () => {
            if (st.locked) return;
            ensureAudio();
            if (o.n === num.n) {
              st.locked = true;
              b.classList.add('correct');
              b.classList.remove('hint');
              sfx.correct();
              speak(num.en, 0.85, 'en-GB');
              panel.appendChild(el('div', 'en-translate', `${num.en} = ${num.sk} (${num.n})`));
              if (st.firstTry) { score++; award(1); confetti(6); toast(`${sample(PRAISES)} +1 💎`); }
              else toast(sample(PRAISES));
              trackResult(st, { game: 'anglictina', gameName: 'Angličtina', skill: 'en:numbers', skillName: 'Čísla po anglicky' });
              dots.set(idx, st.firstTry ? 'ok' : 'bad');
              idx++;
              later(next, 2000);
            } else {
              onWrongDefault(st, b, reveal, {
                skill: 'en:numbers', skillName: 'Čísla po anglicky',
                label: `${num.n}`, chose: o.en, correct: num.en,
              });
            }
          });
          grid.appendChild(b);
        });
        panel.appendChild(grid);
        container.appendChild(panel);

        armIdleHint(() => speak(num.en, 0.8, 'en-GB'), reveal);
        later(() => speak('Spočítaj obrázky a vyber číslo po anglicky.', 0.9), 350);
      };
      next();
    };

    pick();
  },
};
