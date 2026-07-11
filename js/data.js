// ===== Dáta pre hry =====

// Logopédia – dvojice hlások. Slová sú vybrané tak, aby obsahovali
// LEN jednu hlásku z dvojice (nikdy obe naraz).
export const SOUND_PAIRS = [
  {
    id: 'sc', a: 'Š', b: 'Č', name: 'Š alebo Č',
    words: [
      { w: 'šašo', e: '🤡', t: 'Š' },
      { w: 'škola', e: '🏫', t: 'Š' },
      { w: 'šál', e: '🧣', t: 'Š' },
      { w: 'myš', e: '🐭', t: 'Š' },
      { w: 'hruška', e: '🍐', t: 'Š' },
      { w: 'šaty', e: '👗', t: 'Š' },
      { w: 'kôš', e: '🗑️', t: 'Š' },
      { w: 'fľaša', e: '🍼', t: 'Š' },
      { w: 'mašľa', e: '🎀', t: 'Š' },
      { w: 'šálka', e: '☕', t: 'Š' },
      { w: 'čiapka', e: '🧢', t: 'Č' },
      { w: 'mačka', e: '🐱', t: 'Č' },
      { w: 'čokoláda', e: '🍫', t: 'Č' },
      { w: 'kľúč', e: '🔑', t: 'Č' },
      { w: 'včela', e: '🐝', t: 'Č' },
      { w: 'čaj', e: '🍵', t: 'Č' },
      { w: 'čerešňa', e: '🍒', t: 'Č' },
      { w: 'čln', e: '🛶', t: 'Č' },
      { w: 'oči', e: '👀', t: 'Č' },
      { w: 'koláč', e: '🍰', t: 'Č' },
    ],
  },
  {
    id: 'ss', a: 'S', b: 'Š', name: 'S alebo Š',
    words: [
      { w: 'slon', e: '🐘', t: 'S' },
      { w: 'syr', e: '🧀', t: 'S' },
      { w: 'sova', e: '🦉', t: 'S' },
      { w: 'pes', e: '🐶', t: 'S' },
      { w: 'slnko', e: '☀️', t: 'S' },
      { w: 'autobus', e: '🚌', t: 'S' },
      { w: 'ananás', e: '🍍', t: 'S' },
      { w: 'nos', e: '👃', t: 'S' },
      { w: 'husle', e: '🎻', t: 'S' },
      { w: 'sob', e: '🦌', t: 'S' },
      { w: 'šašo', e: '🤡', t: 'Š' },
      { w: 'škola', e: '🏫', t: 'Š' },
      { w: 'šál', e: '🧣', t: 'Š' },
      { w: 'myš', e: '🐭', t: 'Š' },
      { w: 'hruška', e: '🍐', t: 'Š' },
      { w: 'šaty', e: '👗', t: 'Š' },
      { w: 'kôš', e: '🗑️', t: 'Š' },
      { w: 'fľaša', e: '🍼', t: 'Š' },
      { w: 'mašľa', e: '🎀', t: 'Š' },
      { w: 'guláš', e: '🍲', t: 'Š' },
    ],
  },
  {
    id: 'cc', a: 'C', b: 'Č', name: 'C alebo Č',
    words: [
      { w: 'cibuľa', e: '🧅', t: 'C' },
      { w: 'ovca', e: '🐑', t: 'C' },
      { w: 'cukrík', e: '🍬', t: 'C' },
      { w: 'palec', e: '👍', t: 'C' },
      { w: 'citrón', e: '🍋', t: 'C' },
      { w: 'tanec', e: '💃', t: 'C' },
      { w: 'noc', e: '🌃', t: 'C' },
      { w: 'cirkus', e: '🎪', t: 'C' },
      { w: 'srdce', e: '❤️', t: 'C' },
      { w: 'cesta', e: '🛣️', t: 'C' },
      { w: 'čiapka', e: '🧢', t: 'Č' },
      { w: 'mačka', e: '🐱', t: 'Č' },
      { w: 'čokoláda', e: '🍫', t: 'Č' },
      { w: 'kľúč', e: '🔑', t: 'Č' },
      { w: 'včela', e: '🐝', t: 'Č' },
      { w: 'čaj', e: '🍵', t: 'Č' },
      { w: 'čerešňa', e: '🍒', t: 'Č' },
      { w: 'čln', e: '🛶', t: 'Č' },
      { w: 'meč', e: '⚔️', t: 'Č' },
      { w: 'koláč', e: '🍰', t: 'Č' },
    ],
  },
  {
    id: 'zz', a: 'Z', b: 'Ž', name: 'Z alebo Ž',
    words: [
      { w: 'zajac', e: '🐰', t: 'Z' },
      { w: 'zima', e: '❄️', t: 'Z' },
      { w: 'koza', e: '🐐', t: 'Z' },
      { w: 'zub', e: '🦷', t: 'Z' },
      { w: 'zmrzlina', e: '🍦', t: 'Z' },
      { w: 'váza', e: '🏺', t: 'Z' },
      { w: 'zebra', e: '🦓', t: 'Z' },
      { w: 'zvon', e: '🔔', t: 'Z' },
      { w: 'žaba', e: '🐸', t: 'Ž' },
      { w: 'žirafa', e: '🦒', t: 'Ž' },
      { w: 'ruža', e: '🌹', t: 'Ž' },
      { w: 'lyže', e: '🎿', t: 'Ž' },
      { w: 'jež', e: '🦔', t: 'Ž' },
      { w: 'nožík', e: '🔪', t: 'Ž' },
      { w: 'nožnice', e: '✂️', t: 'Ž' },
      { w: 'žalúdok', e: '🫃', t: 'Ž' },
    ],
  },
];

// Čítanie – slová s obrázkami (emoji)
export const READING_WORDS = [
  { w: 'dom', e: '🏠' }, { w: 'mama', e: '👩' }, { w: 'auto', e: '🚗' },
  { w: 'pes', e: '🐶' }, { w: 'oko', e: '👁️' }, { w: 'ryba', e: '🐟' },
  { w: 'ruka', e: '✋' }, { w: 'kôň', e: '🐴' }, { w: 'les', e: '🌲' },
  { w: 'syr', e: '🧀' }, { w: 'mesiac', e: '🌙' }, { w: 'slnko', e: '☀️' },
  { w: 'kvet', e: '🌸' }, { w: 'strom', e: '🌳' }, { w: 'lopta', e: '⚽' },
  { w: 'kniha', e: '📖' }, { w: 'jablko', e: '🍎' }, { w: 'banán', e: '🍌' },
  { w: 'mlieko', e: '🥛' }, { w: 'vajce', e: '🥚' }, { w: 'myš', e: '🐭' },
  { w: 'sova', e: '🦉' }, { w: 'žaba', e: '🐸' }, { w: 'zub', e: '🦷' },
  { w: 'mrkva', e: '🥕' }, { w: 'hviezda', e: '⭐' }, { w: 'srdce', e: '❤️' },
  { w: 'kľúč', e: '🔑' }, { w: 'medveď', e: '🐻' }, { w: 'noha', e: '🦵' },
];

// Krátke slová na skladanie z písmen (3–5 písmen)
export const BUILD_WORDS = [
  { w: 'dom', e: '🏠' }, { w: 'pes', e: '🐶' }, { w: 'oko', e: '👁️' },
  { w: 'les', e: '🌲' }, { w: 'syr', e: '🧀' }, { w: 'zub', e: '🦷' },
  { w: 'kvet', e: '🌸' }, { w: 'ryba', e: '🐟' }, { w: 'ruka', e: '✋' },
  { w: 'sova', e: '🦉' }, { w: 'žaba', e: '🐸' }, { w: 'myš', e: '🐭' },
  { w: 'auto', e: '🚗' }, { w: 'mama', e: '👩' }, { w: 'mak', e: '🌺' },
  { w: 'lopta', e: '⚽' },
];

// ===== Pixelové maľovanky =====
// grid: každý znak = farba z palety, '.' = prázdne políčko
export const PIXEL_TEMPLATES = [
  {
    id: 'kamos', name: 'Zelený kamoš', emoji: '🟩',
    palette: [
      { ch: 'g', color: '#8fe07a', name: 'svetlozelená' },
      { ch: 'G', color: '#4e9b40', name: 'tmavozelená' },
      { ch: 'b', color: '#222222', name: 'čierna' },
    ],
    grid: [
      'gGgGgGgGgG',
      'GgGgGgGgGg',
      'gGbbgGbbgG',
      'GgbbGgbbGg',
      'gGgGgGgGgG',
      'GgGbbbbgGg',
      'gGgbbbbGgG',
      'GgGbGgbgGg',
      'gGgGgGgGgG',
      'GgGgGgGgGg',
    ],
  },
  {
    id: 'srdce', name: 'Srdiečko', emoji: '❤️',
    palette: [
      { ch: 'r', color: '#e0455a', name: 'červená' },
      { ch: 'p', color: '#ff9db0', name: 'ružová' },
    ],
    grid: [
      '.rrr...rrr.',
      'rpprr.rrrrr',
      'rpprrrrrrrr',
      'rrrrrrrrrrr',
      '.rrrrrrrrr.',
      '..rrrrrrr..',
      '...rrrrr...',
      '....rrr....',
      '.....r.....',
    ],
  },
  {
    id: 'mec', name: 'Diamantový meč', emoji: '⚔️',
    palette: [
      { ch: 'd', color: '#5fd8e8', name: 'svetlomodrá' },
      { ch: 'D', color: '#2b9fb5', name: 'tmavomodrá' },
      { ch: 'y', color: '#f5c542', name: 'žltá' },
      { ch: 'h', color: '#8d6e4b', name: 'hnedá' },
    ],
    grid: [
      '...d...',
      '..ddd..',
      '..dDd..',
      '..dDd..',
      '..dDd..',
      '..dDd..',
      '..dDd..',
      '.yyyyy.',
      '...h...',
      '...h...',
      '...h...',
      '..yyy..',
    ],
  },
  {
    id: 'kvet', name: 'Kvietok', emoji: '🌸',
    palette: [
      { ch: 'p', color: '#f48fb1', name: 'ružová' },
      { ch: 'y', color: '#f5c542', name: 'žltá' },
      { ch: 'g', color: '#58b24c', name: 'zelená' },
    ],
    grid: [
      '...ppp...',
      '..ppypp..',
      '.ppyyypp.',
      '..ppypp..',
      '...ppp...',
      '....g....',
      '....gg...',
      '..ggg....',
      '....g....',
      '...ggg...',
    ],
  },
  {
    id: 'hviezda', name: 'Hviezda', emoji: '⭐',
    palette: [
      { ch: 'y', color: '#f5c542', name: 'žltá' },
      { ch: 'o', color: '#f09030', name: 'oranžová' },
    ],
    grid: [
      '.....o.....',
      '....yyy....',
      '....yyy....',
      'ooyyyyyyyoo',
      '.yyyyyyyyy.',
      '..yyyyyyy..',
      '...yyyyy...',
      '..yyy.yyy..',
      '.oy.....yo.',
    ],
  },
  {
    id: 'duha', name: 'Dúha', emoji: '🌈',
    palette: [
      { ch: 'r', color: '#e0455a', name: 'červená' },
      { ch: 'o', color: '#f09030', name: 'oranžová' },
      { ch: 'y', color: '#f5c542', name: 'žltá' },
      { ch: 'g', color: '#58b24c', name: 'zelená' },
      { ch: 'b', color: '#3fa7d6', name: 'modrá' },
      { ch: 'W', color: '#f2f6f8', name: 'biela' },
    ],
    grid: [
      '...rrrrrr...',
      '..rroooorr..',
      '.rroyyyyorr.',
      '.royggggyor.',
      'roygbbbbgyor',
      'roygb..bgyor',
      'WWWgb..bgWWW',
      'WWWW....WWWW',
    ],
  },
  {
    id: 'diamant', name: 'Diamant', emoji: '💎',
    palette: [
      { ch: 'd', color: '#5fd8e8', name: 'svetlomodrá' },
      { ch: 'D', color: '#2b9fb5', name: 'tmavomodrá' },
      { ch: 'w', color: '#f2f6f8', name: 'biela' },
    ],
    grid: [
      '..DdddD..',
      '.dwdddwd.',
      'DdddddddD',
      '.ddddddd.',
      '..ddddd..',
      '...ddd...',
      '....d....',
    ],
  },
];

// Farby pre voľné maľovanie
export const FREE_COLORS = [
  '#e0455a', '#f09030', '#f5c542', '#58b24c', '#3fa7d6', '#7c5cd6',
  '#f48fb1', '#8d6e4b', '#222222', '#9aa0a6', '#5fd8e8', '#ffffff',
];

// ===== Domček – stavba za diamanty =====
// Scéna 14 × 11, každý krok = jedna „kocka" (skupina políčok)
export const HOUSE_STEP_COST = 5;
export const HOUSE_SCENE = { cols: 14, rows: 11 };
export const HOUSE_STEPS = [
  { name: 'Tráva', color: '#58b24c', cells: [[10,0],[10,1],[10,2],[10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[10,10],[10,11],[10,12],[10,13]] },
  { name: 'Základy', color: '#9aa0a6', cells: [[9,3],[9,4],[9,5],[9,6],[9,7],[9,8]] },
  { name: 'Ľavá stena', color: '#c89b6a', cells: [[8,3],[8,4],[7,3],[6,3],[6,4],[8,5]] },
  { name: 'Pravá stena', color: '#c89b6a', cells: [[8,7],[8,8],[7,8],[6,6],[6,7],[6,8],[7,5],[7,6]] },
  { name: 'Dvere', color: '#6d4c2f', cells: [[8,6],[9,6]] } ,
  { name: 'Okno', color: '#aee3f8', cells: [[7,4]] },
  { name: 'Druhé okno', color: '#aee3f8', cells: [[7,7]] },
  { name: 'Strecha', color: '#b03a3a', cells: [[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],[5,9]] },
  { name: 'Vrch strechy', color: '#8f2e2e', cells: [[4,3],[4,4],[4,5],[4,6],[4,7],[4,8]] },
  { name: 'Komín', color: '#757575', cells: [[3,8]] },
  { name: 'Dym', color: '#e6e6e6', cells: [[2,8],[1,9]] },
  { name: 'Slnko', color: '#f5c542', cells: [[0,12],[0,13],[1,12],[1,13]] },
  { name: 'Oblak', color: '#ffffff', cells: [[1,1],[1,2],[1,3],[0,2]] },
  { name: 'Kmeň stromu', color: '#8d6e4b', cells: [[9,11],[8,11]] },
  { name: 'Koruna stromu', color: '#3e8948', cells: [[7,10],[7,11],[7,12],[6,10],[6,11],[6,12],[5,11]] },
  { name: 'Kvietok', color: '#f48fb1', cells: [[9,1]] },
  { name: 'Druhý kvietok', color: '#f5c542', cells: [[9,9]] },
  { name: 'Mačka', color: '#616161', cells: [[9,2]] },
  { name: 'Motýlik', color: '#f09030', cells: [[3,1]] },
];

// ===== Levely (postup podľa nazbieraných diamantov) =====
export const LEVELS = [
  { need: 0,   title: 'Nováčik',   emoji: '🐣' },
  { need: 12,  title: 'Kopáč',     emoji: '⛏️' },
  { need: 28,  title: 'Staviteľ',  emoji: '🧱' },
  { need: 50,  title: 'Baník',     emoji: '💎' },
  { need: 80,  title: 'Dobrodruh', emoji: '🧭' },
  { need: 120, title: 'Rytier',    emoji: '🛡️' },
  { need: 170, title: 'Majster',   emoji: '🏅' },
  { need: 230, title: 'Šampión',   emoji: '🏆' },
  { need: 300, title: 'Hrdina',    emoji: '🦸' },
  { need: 400, title: 'Legenda',   emoji: '👑' },
];

// ===== Chalúpka – obchod (míňanie diamantov) =====
// Domovy sa postupne odomykajú (vyšší = drahší). Kupuje sa raz.
export const HOME_TIERS = [
  { id: 'tent',   emoji: '⛺', name: 'Stan',              cost: 0 },
  { id: 'wood',   emoji: '🛖', name: 'Drevená chalúpka',  cost: 15 },
  { id: 'house',  emoji: '🏠', name: 'Murovaný dom',      cost: 40 },
  { id: 'castle', emoji: '🏰', name: 'Veľký hrad',        cost: 90 },
];

// Ozdoby do dvora – každá sa kúpi raz a objaví sa v scéne.
export const DECORATIONS = [
  { id: 'flower', emoji: '🌷', name: 'Kvietky',   cost: 5,  pos: { left: '8%',  bottom: '6%'  } },
  { id: 'tree',   emoji: '🌳', name: 'Strom',     cost: 8,  pos: { left: '78%', bottom: '8%'  } },
  { id: 'cat',    emoji: '🐱', name: 'Mačka',     cost: 10, pos: { left: '30%', bottom: '5%'  } },
  { id: 'dog',    emoji: '🐶', name: 'Psík',      cost: 10, pos: { left: '55%', bottom: '5%'  } },
  { id: 'torch',  emoji: '🔥', name: 'Fakľa',     cost: 8,  pos: { left: '20%', bottom: '30%' } },
  { id: 'chick',  emoji: '🐔', name: 'Sliepka',   cost: 9,  pos: { left: '66%', bottom: '6%'  } },
  { id: 'sun',    emoji: '🌞', name: 'Slniečko',  cost: 7,  pos: { left: '6%',  bottom: '68%' } },
  { id: 'rainbow',emoji: '🌈', name: 'Dúha',      cost: 14, pos: { left: '60%', bottom: '60%' } },
  { id: 'pool',   emoji: '⛲', name: 'Fontána',   cost: 16, pos: { left: '42%', bottom: '5%'  } },
  { id: 'chest',  emoji: '🧰', name: 'Truhlica',  cost: 12, pos: { left: '86%', bottom: '30%' } },
  { id: 'flag',   emoji: '🚩', name: 'Zástava',   cost: 11, pos: { left: '48%', bottom: '58%' } },
  { id: 'snow',   emoji: '⛄', name: 'Snehuliak', cost: 13, pos: { left: '14%', bottom: '6%'  } },
];

// ===== Môj svet – stavanie z kociek =====
// Základné kocky (tráva, zem) sú zadarmo. Ostatné si odomkneš za 💎
// a potom ich kladieš koľko chceš (kladenie je zadarmo).
export const WORLD = { cols: 14, rows: 12 };
export const WORLD_BLOCKS = [
  { id: 'grass',   name: 'Tráva',   color: '#58b24c', cost: 0 },
  { id: 'dirt',    name: 'Zem',     color: '#8d6e4b', cost: 0 },
  { id: 'sand',    name: 'Piesok',  color: '#e6d29a', cost: 3 },
  { id: 'stone',   name: 'Kameň',   color: '#9aa0a6', cost: 3 },
  { id: 'cobble',  name: 'Dlažba',  color: '#767b80', cost: 4 },
  { id: 'water',   name: 'Voda',    color: '#3fa7d6', cost: 4 },
  { id: 'log',     name: 'Kmeň',    color: '#6d4c2f', cost: 4 },
  { id: 'leaves',  name: 'Lístie',  color: '#3e8948', cost: 4 },
  { id: 'plank',   name: 'Dosky',   color: '#c08a45', cost: 5 },
  { id: 'snow',    name: 'Sneh',    color: '#eef4f7', cost: 5 },
  { id: 'glass',   name: 'Sklo',    color: '#b7e3f0', cost: 6 },
  { id: 'brick',   name: 'Tehla',   color: '#b0533f', cost: 7 },
  { id: 'lava',    name: 'Láva',    color: '#e8622b', cost: 9 },
  { id: 'gold',    name: 'Zlato',   color: '#f5c542', cost: 14 },
  { id: 'diamond', name: 'Diamant', color: '#5fd8e8', cost: 22 },
  { id: 'torch',   name: 'Fakľa',   color: '', emoji: '🔥', cost: 3 },
  { id: 'flower',  name: 'Kvet',    color: '', emoji: '🌷', cost: 3 },
  { id: 'door',    name: 'Dvere',   color: '', emoji: '🚪', cost: 4 },
  { id: 'tnt',     name: 'TNT',     color: '#c0392b', emoji: '🧨', cost: 8 },
];

// ===== Postavičky – vlastné pixelové farby (mimo bežnej palety) =====
export const SPRITE_COLORS = {
  cg: '#6db24a', cd: '#20301a',                 // creeper
  hair: '#4a3418', sk: '#d0996a', shirt: '#2f9fb5', legs: '#3b4b8f', // steve
  ec: '#161622', ep: '#c26bd6',                 // enderman
};

// ===== Obchod so stavbami a postavičkami (stampy do sveta) =====
// Kúpiš (odomkneš) za 💎 a potom ich pokladáš ťuknutím. '.' = nič.
// Bloky odkazujú na WORLD_BLOCKS (plank, brick…), SPRITE_COLORS alebo 'e:emoji'.
export const STAMPS = [
  // — stavby —
  {
    id: 'domcek', name: 'Drevený domček', emoji: '🏠', cost: 12, kind: 'build',
    rows: [
      ['.', 'brick', 'brick', 'brick', '.'],
      ['plank', 'glass', 'plank', 'glass', 'plank'],
      ['plank', 'plank', 'plank', 'plank', 'plank'],
      ['plank', 'plank', 'door', 'plank', 'plank'],
    ],
  },
  {
    id: 'kamdom', name: 'Kamenný dom', emoji: '🏚️', cost: 22, kind: 'build',
    rows: [
      ['.', 'cobble', 'cobble', 'cobble', '.'],
      ['stone', 'glass', 'stone', 'glass', 'stone'],
      ['stone', 'stone', 'stone', 'stone', 'stone'],
      ['stone', 'stone', 'door', 'stone', 'stone'],
    ],
  },
  {
    id: 'hrad', name: 'Hrad', emoji: '🏰', cost: 45, kind: 'build',
    rows: [
      ['cobble', '.', 'cobble', 'cobble', '.', 'cobble'],
      ['brick', 'brick', 'brick', 'brick', 'brick', 'brick'],
      ['brick', 'glass', 'brick', 'brick', 'glass', 'brick'],
      ['brick', 'brick', 'brick', 'door', 'brick', 'brick'],
      ['brick', 'brick', 'brick', 'brick', 'brick', 'brick'],
    ],
  },
  {
    id: 'veza', name: 'Veža', emoji: '🗼', cost: 25, kind: 'build',
    rows: [
      ['cobble', '.', 'cobble'],
      ['brick', 'glass', 'brick'],
      ['brick', 'brick', 'brick'],
      ['brick', 'glass', 'brick'],
      ['brick', 'door', 'brick'],
    ],
  },
  {
    id: 'strom', name: 'Strom', emoji: '🌳', cost: 6, kind: 'build',
    rows: [
      ['leaves', 'leaves', 'leaves'],
      ['leaves', 'leaves', 'leaves'],
      ['.', 'log', '.'],
      ['.', 'log', '.'],
    ],
  },
  {
    id: 'jazero', name: 'Jazierko', emoji: '💧', cost: 8, kind: 'build',
    rows: [
      ['water', 'water', 'water', 'water'],
      ['water', 'water', 'water', 'water'],
    ],
  },
  {
    id: 'taborak', name: 'Táborák', emoji: '🔥', cost: 6, kind: 'build',
    rows: [
      ['.', 'torch', '.'],
      ['log', 'log', 'log'],
    ],
  },

  // — postavičky (pixelové) —
  {
    id: 'creeper', name: 'Creeper', emoji: '🟩', cost: 18, kind: 'mob',
    rows: [
      ['cg', 'cg', 'cg'],
      ['cd', 'cg', 'cd'],
      ['cg', 'cd', 'cg'],
    ],
  },
  {
    id: 'steve', name: 'Steve', emoji: '🧑', cost: 20, kind: 'mob',
    rows: [
      ['hair', 'hair', 'hair'],
      ['sk', 'sk', 'sk'],
      ['shirt', 'shirt', 'shirt'],
      ['legs', '.', 'legs'],
    ],
  },
  {
    id: 'enderman', name: 'Enderman', emoji: '🟪', cost: 16, kind: 'mob',
    rows: [
      ['ec', 'ec', 'ec'],
      ['ec', 'ec', 'ec'],
      ['ep', 'ec', 'ep'],
      ['ec', 'ec', 'ec'],
      ['ec', '.', 'ec'],
    ],
  },

  // — postavičky (emoji) —
  { id: 'zombie', name: 'Zombík', emoji: '🧟', cost: 8, kind: 'mob', rows: [['e:🧟']] },
  { id: 'kostlivec', name: 'Kostlivec', emoji: '💀', cost: 8, kind: 'mob', rows: [['e:💀']] },
  { id: 'drak', name: 'Drak', emoji: '🐉', cost: 22, kind: 'mob', rows: [['e:🐉']] },
  { id: 'dedincan', name: 'Dedinčan', emoji: '🧑‍🌾', cost: 7, kind: 'mob', rows: [['e:🧑‍🌾']] },
  { id: 'prasa', name: 'Prasiatko', emoji: '🐷', cost: 6, kind: 'mob', rows: [['e:🐷']] },
  { id: 'krava', name: 'Kravička', emoji: '🐮', cost: 7, kind: 'mob', rows: [['e:🐮']] },
  { id: 'ovca', name: 'Ovečka', emoji: '🐑', cost: 6, kind: 'mob', rows: [['e:🐑']] },
  { id: 'sliepka', name: 'Sliepka', emoji: '🐔', cost: 6, kind: 'mob', rows: [['e:🐔']] },
  { id: 'vlk', name: 'Vlk', emoji: '🐺', cost: 8, kind: 'mob', rows: [['e:🐺']] },
  { id: 'macka', name: 'Mačka', emoji: '🐱', cost: 7, kind: 'mob', rows: [['e:🐱']] },

  // — doplnky (emoji) —
  { id: 'hrib', name: 'Hríb', emoji: '🍄', cost: 4, kind: 'deco', rows: [['e:🍄']] },
  { id: 'fontana', name: 'Fontána', emoji: '⛲', cost: 10, kind: 'deco', rows: [['e:⛲']] },
  { id: 'zastava', name: 'Zástava', emoji: '🚩', cost: 5, kind: 'deco', rows: [['e:🚩']] },
  { id: 'stromcek', name: 'Stromček', emoji: '🎄', cost: 6, kind: 'deco', rows: [['e:🎄']] },
  { id: 'dazduh', name: 'Dúha', emoji: '🌈', cost: 8, kind: 'deco', rows: [['e:🌈']] },
  { id: 'oblak', name: 'Obláčik', emoji: '☁️', cost: 3, kind: 'deco', rows: [['e:☁️']] },
];

// ===== Dvojhlásky ia / ie / iu / ô =====
export const DIPHTHONGS = [
  { w: 'piatok', e: '📅', d: 'ia' },
  { w: 'priateľ', e: '👫', d: 'ia' },
  { w: 'piata', e: '✋', d: 'ia' },
  { w: 'hrianka', e: '🍞', d: 'ia' },
  { w: 'mlieko', e: '🥛', d: 'ie' },
  { w: 'hviezda', e: '⭐', d: 'ie' },
  { w: 'chlieb', e: '🥖', d: 'ie' },
  { w: 'diera', e: '🕳️', d: 'ie' },
  { w: 'biely', e: '⚪', d: 'ie' },
  { w: 'akvárium', e: '🐠', d: 'iu' },
  { w: 'terárium', e: '🦎', d: 'iu' },
  { w: 'herbárium', e: '🌿', d: 'iu' },
  { w: 'gymnázium', e: '🏫', d: 'iu' },
  { w: 'kôň', e: '🐴', d: 'ô' },
  { w: 'nôž', e: '🔪', d: 'ô' },
  { w: 'stôl', e: '🪑', d: 'ô' },
  { w: 'kôš', e: '🗑️', d: 'ô' },
  { w: 'vôľa', e: '💪', d: 'ô' },
];
export const DIPHTHONG_OPTIONS = ['ia', 'ie', 'iu', 'ô'];

// ===== Počítanie predmetov („koľko čoho je?") =====
export const COUNT_EMOJI = ['🍎', '🐶', '⭐', '🌸', '🚗', '🐱', '🍌', '🐟', '🎈', '🍓', '🐝', '🦋'];

// ===== Hláskovanie – krátke slová na sluchové skladanie =====
export const SPELL_WORDS = [
  { w: 'mama', e: '👩' }, { w: 'auto', e: '🚗' }, { w: 'pes', e: '🐶' },
  { w: 'dom', e: '🏠' }, { w: 'ryba', e: '🐟' }, { w: 'sova', e: '🦉' },
  { w: 'lopta', e: '⚽' }, { w: 'kvet', e: '🌸' }, { w: 'ruka', e: '✋' },
  { w: 'oko', e: '👁️' }, { w: 'noha', e: '🦵' }, { w: 'myš', e: '🐭' },
];

// ===== Vety na čítanie (ťažšie, aj pre písané písmo) =====
export const SENTENCES = [
  { s: 'Mama má psa.', e: '🐶' },
  { s: 'Ocko číta knihu.', e: '📖' },
  { s: 'Sova sedí na strome.', e: '🦉' },
  { s: 'Máme malé auto.', e: '🚗' },
  { s: 'Mačka pije mlieko.', e: '🐱' },
  { s: 'Slnko svieti na lúku.', e: '☀️' },
  { s: 'Deti sa hrajú vonku.', e: '🧒' },
  { s: 'Ryba pláva vo vode.', e: '🐟' },
  { s: 'Na oblohe je dúha.', e: '🌈' },
  { s: 'Zajko skáče po tráve.', e: '🐰' },
  { s: 'Včela letí ku kvetu.', e: '🐝' },
  { s: 'Máme doma malú myš.', e: '🐭' },
];

// Pochvaly
export const PRAISES = [
  'Výborne!', 'Super!', 'Si šikovná!', 'Paráda!', 'Skvelé!',
  'Bravó!', 'Ide ti to!', 'Juchú!', 'Perfektné!',
];
export const ENCOURAGE = [
  'Skús to ešte raz!', 'Nevadí, nabudúce to vyjde!', 'Takmer!', 'Skoro!',
];
