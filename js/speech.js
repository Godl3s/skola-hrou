// ===== Rozpoznávanie reči – dieťa povie slovo, appka vyhodnotí =====
// Pozn.: presnosť je len približná (prehliadačové ASR), nie náhrada logopéda.
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function hasSpeechRecognition() { return !!SR; }

// Odpočúva jedno slovo. Vráti { ok, alternatives?, error? }.
export function listenOnce(lang = 'sk-SK', timeoutMs = 6000) {
  return new Promise(resolve => {
    if (!SR) { resolve({ ok: false, error: 'unsupported' }); return; }
    let rec;
    try { rec = new SR(); } catch { resolve({ ok: false, error: 'init' }); return; }
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;

    const alts = [];
    let done = false;
    let gotError = null;
    const finish = (r) => { if (done) return; done = true; try { rec.stop(); } catch {} resolve(r); };

    rec.onresult = (e) => {
      const res = e.results[0];
      for (let i = 0; i < res.length; i++) alts.push(res[i].transcript);
    };
    rec.onerror = (e) => { gotError = e.error || 'error'; };
    rec.onend = () => {
      if (alts.length) finish({ ok: true, alternatives: alts });
      else finish({ ok: false, error: gotError || 'no-speech' });
    };

    try { rec.start(); } catch { finish({ ok: false, error: 'start' }); return; }
    setTimeout(() => { try { rec.stop(); } catch {} }, timeoutMs);
  });
}

function norm(x) {
  return (x || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    }
  }
  return d[m][n];
}

function tokens(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter(Boolean);
}

// Porovná celú vetu – koľko cieľových slov sa objavilo v tom, čo bolo počuť.
export function matchesSentence(target, alternatives) {
  const tw = tokens(target);
  if (!tw.length) return { match: false, heard: '', score: 0 };
  let best = 0, heard = (alternatives && alternatives[0]) || '';
  for (const a of (alternatives || [])) {
    const aw = new Set(tokens(a));
    let hit = 0;
    tw.forEach(w => { if (aw.has(w)) hit++; });
    const frac = hit / tw.length;
    if (frac > best) { best = frac; heard = a; }
  }
  return { match: best >= 0.6, heard, score: best };
}

// Porovná cieľové slovo s tým, čo bolo počuť.
export function matchesWord(target, alternatives) {
  const t = norm(target);
  let best = 0, heard = (alternatives && alternatives[0]) || '';
  for (const a of (alternatives || [])) {
    if (norm(a) === t) return { match: true, heard: a, score: 1 };
    for (const word of a.split(/\s+/)) {
      const w = norm(word);
      if (!w) continue;
      if (w === t) return { match: true, heard: a, score: 1 };
      const sim = 1 - lev(w, t) / Math.max(w.length, t.length, 1);
      if (sim > best) { best = sim; }
    }
  }
  return { match: best >= 0.62, heard, score: best };
}
