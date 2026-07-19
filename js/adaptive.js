// ===== Adaptívna náročnosť =====
// Metodika: 3 správne za sebou → ťažšie (max 3), 2 chyby za sebou →
// ľahšie (min 1). Ukladá sa per zručnosť (a per profil cez lsGet).
import { lsGet, lsSet, toast } from './core.js';

function getAll() { return lsGet('adaptive', {}); }

// úroveň náročnosti pre zručnosť: 1 (ľahké), 2 (stredné), 3 (ťažké)
export function diffLevel(skill) {
  const a = getAll()[skill];
  return a ? a.lvl : 1;
}

// zavolá sa po každej otázke (z trackResult)
export function reportAnswer(skill, ok) {
  const all = getAll();
  const a = all[skill] || { lvl: 1, up: 0, down: 0 };
  if (ok) {
    a.up += 1;
    a.down = 0;
    if (a.up >= 3 && a.lvl < 3) {
      a.lvl += 1;
      a.up = 0;
      toast('🔥 Ide ti to výborne! Skúsime trochu ťažšie.', 2600);
    }
  } else {
    a.down += 1;
    a.up = 0;
    if (a.down >= 2 && a.lvl > 1) {
      a.lvl -= 1;
      a.down = 0;
      toast('🙂 Dáme na chvíľu ľahšie, nech si to precvičíš.', 2600);
    }
  }
  all[skill] = a;
  lsSet('adaptive', all);
}
