// ===== Štatistiky pre report rodičom =====
import { lsGet, lsSet } from './core.js';

function blank() { return { attempts: 0, correct: 0, wrong: 0, name: '' }; }

export function getStats() {
  return lsGet('stats', {
    totals: { attempts: 0, correct: 0, wrong: 0 },
    byGame: {},
    bySkill: {},
    mistakes: {},   // "skill|label" -> počet
    recent: [],     // posledné chyby [{t, skill, skillName, label, chose, correct}]
    days: {},       // "YYYY-MM-DD" -> počet úloh
    firstPlayed: 0,
    lastPlayed: 0,
  });
}

function save(s) { lsSet('stats', s); }

function bump(map, key, field) {
  if (!map[key]) map[key] = blank();
  map[key][field] += 1;
}

// Zavolá sa po vyriešení jednej otázky.
export function recordResult({ game, gameName, skill, skillName, firstTry }) {
  const s = getStats();
  s.totals.attempts++;
  bump(s.byGame, game, 'attempts');
  bump(s.bySkill, skill, 'attempts');
  s.byGame[game].name = gameName;
  s.bySkill[skill].name = skillName;
  if (firstTry) {
    s.totals.correct++; s.byGame[game].correct++; s.bySkill[skill].correct++;
  } else {
    s.totals.wrong++; s.byGame[game].wrong++; s.bySkill[skill].wrong++;
  }
  const now = Date.now();
  const day = new Date().toISOString().slice(0, 10);
  s.days[day] = (s.days[day] || 0) + 1;
  if (!s.firstPlayed) s.firstPlayed = now;
  s.lastPlayed = now;
  save(s);
}

// Zavolá sa pri PRVEJ chybe v otázke (čo si pomýlila).
export function recordMistake({ skill, skillName, label, chose, correct }) {
  const s = getStats();
  const key = `${skill}|${label}`;
  s.mistakes[key] = (s.mistakes[key] || 0) + 1;
  s.recent.unshift({
    t: Date.now(), skill, skillName: skillName || '',
    label, chose: String(chose), correct: String(correct),
  });
  s.recent = s.recent.slice(0, 40);
  save(s);
}

export function resetStats() { lsSet('stats', null); }
