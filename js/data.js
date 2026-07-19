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

// Čítanie – ťažšie slová (Level 2)
export const READING_WORDS_L2 = [
  { w: 'motýľ', e: '🦋' }, { w: 'slnečnica', e: '🌻' }, { w: 'korytnačka', e: '🐢' },
  { w: 'zmrzlina', e: '🍦' }, { w: 'lietadlo', e: '✈️' }, { w: 'bicykel', e: '🚲' },
  { w: 'dáždnik', e: '☂️' }, { w: 'veverička', e: '🐿️' }, { w: 'jahoda', e: '🍓' },
  { w: 'ceruzka', e: '✏️' }, { w: 'delfín', e: '🐬' }, { w: 'tučniak', e: '🐧' },
  { w: 'hodiny', e: '🕐' }, { w: 'pavúk', e: '🕷️' }, { w: 'balón', e: '🎈' },
  { w: 'raketa', e: '🚀' }, { w: 'húsenica', e: '🐛' }, { w: 'lienka', e: '🐞' },
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

// ===== Dedinka – domov sa postupne vylepšuje (míňanie diamantov) =====
export const HOME_TIERS = [
  { id: 'tent',   emoji: '⛺', name: 'Stan',             cost: 0 },
  { id: 'wood',   emoji: '🛖', name: 'Drevená chalúpka', cost: 15 },
  { id: 'house',  emoji: '🏠', name: 'Murovaný dom',     cost: 40 },
  { id: 'villa',  emoji: '🏡', name: 'Vila so záhradou', cost: 70 },
  { id: 'castle', emoji: '🏰', name: 'Hrad',             cost: 110 },
  { id: 'tower',  emoji: '🗼', name: 'Veľká veža',       cost: 170 },
];

// ===== Zbierka do dedinky – dokupovanie donekonečna =====
export const COLLECTIBLES = [
  // 🌳 Príroda
  { id: 'c_flower', emoji: '🌷', name: 'Tulipán',    cost: 4,  cat: 'rastliny' },
  { id: 'c_tree',   emoji: '🌳', name: 'Strom',      cost: 6,  cat: 'rastliny' },
  { id: 'c_xmas',   emoji: '🎄', name: 'Stromček',   cost: 6,  cat: 'rastliny' },
  { id: 'c_cactus', emoji: '🌵', name: 'Kaktus',     cost: 5,  cat: 'rastliny' },
  { id: 'c_mush',   emoji: '🍄', name: 'Hríb',       cost: 4,  cat: 'rastliny' },
  { id: 'c_sunflw', emoji: '🌻', name: 'Slnečnica',  cost: 5,  cat: 'rastliny' },
  { id: 'c_rain',   emoji: '🌈', name: 'Dúha',       cost: 8,  cat: 'rastliny' },
  { id: 'c_cloud',  emoji: '☁️', name: 'Obláčik',    cost: 3,  cat: 'rastliny' },
  { id: 'c_fount',  emoji: '⛲', name: 'Fontána',    cost: 10, cat: 'rastliny' },
  { id: 'c_lake',   emoji: '🏞️', name: 'Jazierko',   cost: 9,  cat: 'rastliny' },
  { id: 'c_fire',   emoji: '🔥', name: 'Táborák',    cost: 6,  cat: 'rastliny' },
  { id: 'c_snowm',  emoji: '⛄', name: 'Snehuliak',  cost: 7,  cat: 'rastliny' },
  { id: 'c_palm',   emoji: '🌴', name: 'Palma',      cost: 7,  cat: 'rastliny' },
  { id: 'c_plant',  emoji: '🪴', name: 'Kvetináč',   cost: 4,  cat: 'rastliny' },

  // 🐾 Zvieratká
  { id: 'c_pig',    emoji: '🐷', name: 'Prasiatko',  cost: 5,  cat: 'zvierata' },
  { id: 'c_cow',    emoji: '🐮', name: 'Kravička',   cost: 6,  cat: 'zvierata' },
  { id: 'c_sheep',  emoji: '🐑', name: 'Ovečka',     cost: 5,  cat: 'zvierata' },
  { id: 'c_chick',  emoji: '🐔', name: 'Sliepka',    cost: 5,  cat: 'zvierata' },
  { id: 'c_bunny',  emoji: '🐰', name: 'Zajko',      cost: 5,  cat: 'zvierata' },
  { id: 'c_cat',    emoji: '🐱', name: 'Mačka',      cost: 6,  cat: 'zvierata' },
  { id: 'c_dog',    emoji: '🐶', name: 'Psík',       cost: 6,  cat: 'zvierata' },
  { id: 'c_horse',  emoji: '🐴', name: 'Koník',      cost: 8,  cat: 'zvierata' },
  { id: 'c_fox',    emoji: '🦊', name: 'Líška',      cost: 8,  cat: 'zvierata' },
  { id: 'c_owl',    emoji: '🦉', name: 'Sova',       cost: 7,  cat: 'zvierata' },
  { id: 'c_bee',    emoji: '🐝', name: 'Včielka',    cost: 4,  cat: 'zvierata' },
  { id: 'c_fly',    emoji: '🦋', name: 'Motýľ',      cost: 4,  cat: 'zvierata' },
  { id: 'c_turtle', emoji: '🐢', name: 'Korytnačka', cost: 7,  cat: 'zvierata' },
  { id: 'c_squir',  emoji: '🐿️', name: 'Veverička',  cost: 7,  cat: 'zvierata' },
  { id: 'c_wolf',   emoji: '🐺', name: 'Vlk',        cost: 8,  cat: 'zvierata' },
  { id: 'c_frog',   emoji: '🐸', name: 'Žabka',      cost: 4,  cat: 'zvierata' },

  // 🎮 Postavičky
  { id: 'c_zombie', emoji: '🧟', name: 'Zombík',     cost: 8,  cat: 'postavicky' },
  { id: 'c_skel',   emoji: '💀', name: 'Kostlivec',  cost: 8,  cat: 'postavicky' },
  { id: 'c_dragon', emoji: '🐉', name: 'Drak',       cost: 20, cat: 'postavicky' },
  { id: 'c_villag', emoji: '🧑‍🌾', name: 'Dedinčan',  cost: 7,  cat: 'postavicky' },
  { id: 'c_wizard', emoji: '🧙', name: 'Čarodej',    cost: 12, cat: 'postavicky' },
  { id: 'c_robot',  emoji: '🤖', name: 'Robot',      cost: 12, cat: 'postavicky' },
  { id: 'c_alien',  emoji: '👾', name: 'Príšerka',   cost: 10, cat: 'postavicky' },
  { id: 'c_steve',  emoji: '🧑', name: 'Staviteľ',   cost: 9,  cat: 'postavicky' },
  { id: 'c_hero',   emoji: '🦸', name: 'Hrdina',     cost: 14, cat: 'postavicky' },
  { id: 'c_ghost',  emoji: '👻', name: 'Duch',       cost: 8,  cat: 'postavicky' },
  { id: 'c_unicorn',emoji: '🦄', name: 'Jednorožec', cost: 16, cat: 'postavicky' },

  // 🎡 Zábava
  { id: 'c_flag',   emoji: '🚩', name: 'Zástava',    cost: 5,  cat: 'zabava' },
  { id: 'c_balloon',emoji: '🎈', name: 'Balón',      cost: 4,  cat: 'zabava' },
  { id: 'c_ball',   emoji: '⚽', name: 'Lopta',      cost: 4,  cat: 'zabava' },
  { id: 'c_car',    emoji: '🚗', name: 'Autíčko',    cost: 7,  cat: 'zabava' },
  { id: 'c_tract',  emoji: '🚜', name: 'Traktor',    cost: 9,  cat: 'zabava' },
  { id: 'c_boat',   emoji: '⛵', name: 'Loďka',      cost: 8,  cat: 'zabava' },
  { id: 'c_rocket', emoji: '🚀', name: 'Raketa',     cost: 12, cat: 'zabava' },
  { id: 'c_carous', emoji: '🎠', name: 'Kolotoč',    cost: 12, cat: 'zabava' },
  { id: 'c_ferris', emoji: '🎡', name: 'Ruské koleso',cost: 15, cat: 'zabava' },
  { id: 'c_slide',  emoji: '🛝', name: 'Šmykľavka',  cost: 8,  cat: 'zabava' },
  { id: 'c_circus', emoji: '🎪', name: 'Cirkus',     cost: 12, cat: 'zabava' },
  { id: 'c_gift',   emoji: '🎁', name: 'Darček',     cost: 6,  cat: 'zabava' },
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

// Ťažšie vety (Level 2) – dlhšie, s otázkami
export const SENTENCES_L2 = [
  { s: 'Malý psík beží po zelenej lúke.', e: '🐕' },
  { s: 'Naša mačka rada spí na okne.', e: '🐱' },
  { s: 'V lese sme našli veľký hríb.', e: '🍄' },
  { s: 'Deti stavajú hrad z piesku.', e: '🏖️' },
  { s: 'Kde je moja červená čiapka?', e: '🧢' },
  { s: 'Ráno svieti slnko a spievajú vtáky.', e: '🌅' },
  { s: 'Babka upiekla sladký koláč.', e: '🥧' },
  { s: 'Chlapec kreslí veľké žlté auto.', e: '🚗' },
  { s: 'Na jeseň padá lístie zo stromov.', e: '🍂' },
  { s: 'Poď sa hrať von na dvor!', e: '🥎' },
  { s: 'Motýľ sadol na krásny kvet.', e: '🦋' },
  { s: 'V noci svieti mesiac a hviezdy.', e: '🌙' },
];

// ===== Obchodík – peniaze (eurá) =====
export const SHOP_ITEMS = [
  { e: '🍎', name: 'jablko' }, { e: '🍌', name: 'banán' }, { e: '🥛', name: 'mlieko' },
  { e: '🧸', name: 'macík' }, { e: '📖', name: 'kniha' }, { e: '⚽', name: 'lopta' },
  { e: '🍫', name: 'čokoláda' }, { e: '🖍️', name: 'farbičky' }, { e: '🚗', name: 'autíčko' },
  { e: '🍦', name: 'zmrzlina' }, { e: '🎈', name: 'balón' }, { e: '🧃', name: 'džúsik' },
  { e: '🍭', name: 'lízanka' }, { e: '🪁', name: 'šarkan' }, { e: '🧩', name: 'puzzle' },
];

// ===== Tvary =====
export const SHAPES = [
  { id: 'kruh', name: 'kruh', color: '#3fa7d6' },
  { id: 'stvorec', name: 'štvorec', color: '#58b24c' },
  { id: 'trojuholnik', name: 'trojuholník', color: '#f09030' },
  { id: 'obdlznik', name: 'obdĺžnik', color: '#7c5cd6' },
  { id: 'oval', name: 'ovál', color: '#e0455a' },
  { id: 'hviezda', name: 'hviezda', color: '#f5c542' },
  { id: 'srdce', name: 'srdce', color: '#f48fb1' },
  { id: 'kosostvorec', name: 'kosoštvorec', color: '#2b9fb5' },
];

// Predmety okolo nás a ich tvar
export const SHAPE_REAL = [
  { e: '⚽', name: 'lopta', shape: 'kruh' },
  { e: '🍕', name: 'pizza', shape: 'trojuholnik' },
  { e: '📺', name: 'televízor', shape: 'obdlznik' },
  { e: '🎁', name: 'darček', shape: 'stvorec' },
  { e: '🥚', name: 'vajíčko', shape: 'oval' },
  { e: '⭐', name: 'hviezdička', shape: 'hviezda' },
  { e: '❤️', name: 'srdiečko', shape: 'srdce' },
  { e: '🪁', name: 'šarkan', shape: 'kosostvorec' },
  { e: '🕐', name: 'hodiny', shape: 'kruh' },
  { e: '📱', name: 'mobil', shape: 'obdlznik' },
  { e: '🧀', name: 'syr', shape: 'trojuholnik' },
  { e: '🎲', name: 'kocka', shape: 'stvorec' },
  { e: '🍉', name: 'melón', shape: 'oval' },
  { e: '🌕', name: 'mesiac', shape: 'kruh' },
];

// ===== Slabiky (vytlieskaj slovo) =====
export const SYLLABLES = [
  { w: 'pes', e: '🐶', s: ['PES'] },
  { w: 'dom', e: '🏠', s: ['DOM'] },
  { w: 'slon', e: '🐘', s: ['SLON'] },
  { w: 'syr', e: '🧀', s: ['SYR'] },
  { w: 'lev', e: '🦁', s: ['LEV'] },
  { w: 'mama', e: '👩', s: ['MA', 'MA'] },
  { w: 'ryba', e: '🐟', s: ['RY', 'BA'] },
  { w: 'sova', e: '🦉', s: ['SO', 'VA'] },
  { w: 'auto', e: '🚗', s: ['AU', 'TO'] },
  { w: 'žaba', e: '🐸', s: ['ŽA', 'BA'] },
  { w: 'lopta', e: '⚽', s: ['LOP', 'TA'] },
  { w: 'kniha', e: '📖', s: ['KNI', 'HA'] },
  { w: 'motýľ', e: '🦋', s: ['MO', 'TÝĽ'] },
  { w: 'ceruzka', e: '✏️', s: ['CE', 'RUZ', 'KA'] },
  { w: 'zmrzlina', e: '🍦', s: ['ZMRZ', 'LI', 'NA'] },
  { w: 'paprika', e: '🫑', s: ['PA', 'PRI', 'KA'] },
  { w: 'lietadlo', e: '✈️', s: ['LIE', 'TAD', 'LO'] },
  { w: 'hodiny', e: '🕐', s: ['HO', 'DI', 'NY'] },
  { w: 'topánky', e: '👟', s: ['TO', 'PÁN', 'KY'] },
  { w: 'čokoláda', e: '🍫', s: ['ČO', 'KO', 'LÁ', 'DA'] },
  { w: 'korytnačka', e: '🐢', s: ['KO', 'RYT', 'NAČ', 'KA'] },
  { w: 'veverička', e: '🐿️', s: ['VE', 'VE', 'RIČ', 'KA'] },
  { w: 'televízor', e: '📺', s: ['TE', 'LE', 'VÍ', 'ZOR'] },
];

// ===== Y alebo I (po tvrdých a mäkkých spoluhláskach) =====
// Každé slovo má presne jedno y/i, po jednoznačne tvrdej/mäkkej spoluhláske.
export const YDY_WORDS = [
  { w: 'dyňa', e: '🍈', ans: 'y' },
  { w: 'hory', e: '⛰️', ans: 'y' },
  { w: 'nohy', e: '🦵', ans: 'y' },
  { w: 'muchy', e: '🪰', ans: 'y' },
  { w: 'schody', e: '🪜', ans: 'y' },
  { w: 'topánky', e: '👟', ans: 'y' },
  { w: 'chyba', e: '❌', ans: 'y' },
  { w: 'vlaky', e: '🚂', ans: 'y' },
  { w: 'buchty', e: '🥟', ans: 'y' },
  { w: 'kohúty', e: '🐓', ans: 'y' },
  { w: 'čiapka', e: '🧢', ans: 'i' },
  { w: 'šiška', e: '🌰', ans: 'i' },
  { w: 'žirafa', e: '🦒', ans: 'i' },
  { w: 'čiara', e: '📏', ans: 'i' },
  { w: 'ticho', e: '🤫', ans: 'i' },
  { w: 'deti', e: '🧒', ans: 'i' },
  { w: 'nič', e: '🚫', ans: 'i' },
  { w: 'šije', e: '🧵', ans: 'i' },
];

// ===== Kampaň – misie (postupne sa odomykajú) =====
// need = koľko správnych odpovedí (na prvý pokus) v danej zručnosti
// treba nazbierať OD spustenia misie. route = kam vedie tlačidlo Hrať.
export const MISSIONS = [
  { id: 'm01', emoji: '🍎', name: 'Prvé počítanie', desc: 'Spočítaj 5× správne, koľko je predmetov („Koľko ich je?")', skill: 'matika:count', need: 5, reward: 5, route: 'matika' },
  { id: 'm02', emoji: '➕', name: 'Malý počtár', desc: 'Vyrieš 5 príkladov na sčítanie do 10', skill: 'matika:add10', need: 5, reward: 5, route: 'matika' },
  { id: 'm03', emoji: '👂', name: 'Ušká na Š a Č', desc: 'Rozlíš 5 slov v hre Ušká (Š alebo Č)', skill: 'logopedia:sc', need: 5, reward: 6, route: 'logopedia' },
  { id: 'm04', emoji: '🖼️', name: 'Slovný detektív', desc: 'Priraď 5 slov k obrázkom („Obrázok a slovo")', skill: 'citanie:match', need: 5, reward: 6, route: 'citanie' },
  { id: 'm05', emoji: '🔔', name: 'Bystré ušká', desc: 'Spočítaj správne 4 skupiny zvukov', skill: 'zvuky', need: 4, reward: 6, route: 'zvuky' },
  { id: 'm06', emoji: '➖', name: 'Odčítavač', desc: 'Vyrieš 5 príkladov na odčítanie do 10', skill: 'matika:sub10', need: 5, reward: 7, route: 'matika' },
  { id: 'm07', emoji: '🕐', name: 'Hodinár učeň', desc: 'Prečítaj 4 celé hodiny na ciferníku', skill: 'hodiny:whole', need: 4, reward: 7, route: 'hodiny' },
  { id: 'm08', emoji: '🔤', name: 'Lovkyňa písmen', desc: 'Nájdi 5× správne prvé písmenko', skill: 'citanie:first', need: 5, reward: 7, route: 'citanie' },
  { id: 'm09', emoji: '🔊', name: 'Ušká na S a Š', desc: 'Rozlíš 5 slov (S alebo Š)', skill: 'logopedia:ss', need: 5, reward: 8, route: 'logopedia' },
  { id: 'm10', emoji: '🧩', name: 'Skladateľka slov', desc: 'Poskladaj 4 slová z písmen', skill: 'citanie:build', need: 4, reward: 8, route: 'citanie' },
  { id: 'm11', emoji: '🧩', name: 'Doplň číslo', desc: 'Vyrieš 5 príkladov „Doplň číslo" (5 + ▢ = 8)', skill: 'matika:missing', need: 5, reward: 8, route: 'matika' },
  { id: 'm12', emoji: '🕧', name: 'Hodinárka', desc: 'Prečítaj 4 časy s pol hodinou', skill: 'hodiny:half', need: 4, reward: 9, route: 'hodiny' },
  { id: 'm13', emoji: '🅰️', name: 'Dvojhlásky', desc: 'Doplň 5× správnu dvojhlásku (ia, ie, iu, ô)', skill: 'citanie:diphthong', need: 5, reward: 9, route: 'citanie' },
  { id: 'm14', emoji: '⚖️', name: 'Porovnávačka', desc: 'Porovnaj 5× čísla (menej / rovnako / viac)', skill: 'matika:compare', need: 5, reward: 9, route: 'matika' },
  { id: 'm15', emoji: '🔠', name: 'Hláskovačka', desc: 'Zopakuj 4 hláskované slová', skill: 'citanie:spell', need: 4, reward: 10, route: 'citanie' },
  { id: 'm16', emoji: '🔊', name: 'Ušká na C a Č', desc: 'Rozlíš 5 slov (C alebo Č)', skill: 'logopedia:cc', need: 5, reward: 10, route: 'logopedia' },
  { id: 'm17', emoji: '🧠', name: 'Počty z hlavy', desc: 'Vyrieš 5 pamäťových príkladov do 20', skill: 'matika:mem20', need: 5, reward: 11, route: 'matika' },
  { id: 'm18', emoji: '📜', name: 'Čitateľka viet', desc: 'Prečítaj 4 vety nahlas', skill: 'citanie:sentence', need: 4, reward: 11, route: 'citanie' },
  { id: 'm19', emoji: '🚀', name: 'Veľké počty', desc: 'Vyrieš 5 príkladov plus a mínus do 20', skill: 'matika:mix20', need: 5, reward: 12, route: 'matika' },
  { id: 'm20', emoji: '🔊', name: 'Ušká na Z a Ž', desc: 'Rozlíš 5 slov (Z alebo Ž)', skill: 'logopedia:zz', need: 5, reward: 12, route: 'logopedia' },
  { id: 'm21', emoji: '⏱️', name: 'Majsterka hodín', desc: 'Prečítaj 4 časy so štvrť a trištvrte', skill: 'hodiny:quarter', need: 4, reward: 13, route: 'hodiny' },
  { id: 'm22', emoji: '🔗', name: 'Kombinátorka', desc: 'Vyrieš 5 kombinovaných príkladov (3 + 4 − 2)', skill: 'matika:chain', need: 5, reward: 14, route: 'matika' },
  { id: 'm23', emoji: '🚀', name: 'Superpočtárka', desc: 'Vyrieš ďalších 8 príkladov do 20', skill: 'matika:mix20', need: 8, reward: 15, route: 'matika' },
  { id: 'm24', emoji: '👑', name: 'Veľké finále', desc: 'Vyrieš 8 pamäťových príkladov do 20', skill: 'matika:mem20', need: 8, reward: 20, route: 'matika' },
  { id: 'm25', emoji: '💶', name: 'Prvé nákupy', desc: 'Spočítaj 4× správne peniaze v Obchodíku', skill: 'peniaze:count', need: 4, reward: 12, route: 'peniaze' },
  { id: 'm26', emoji: '🔷', name: 'Znalkyňa tvarov', desc: 'Pomenuj 5 tvarov správne', skill: 'tvary:name', need: 5, reward: 12, route: 'tvary' },
  { id: 'm27', emoji: '👏', name: 'Tlieskačka', desc: 'Vytlieskaj 5 slov na slabiky', skill: 'citanie:syllable', need: 5, reward: 13, route: 'citanie' },
  { id: 'm28', emoji: '🛒', name: 'Nákupčíčka', desc: 'Zaplať presne 4 nákupy v Obchodíku', skill: 'peniaze:pay', need: 4, reward: 14, route: 'peniaze' },
  { id: 'm29', emoji: '🔺', name: 'Počítačka tvarov', desc: 'Spočítaj 4× tvary na obrázku', skill: 'tvary:count', need: 4, reward: 14, route: 'tvary' },
  { id: 'm30', emoji: '⚖️', name: 'Párne či nepárne?', desc: 'Rozhodni 5× správne, či je číslo párne', skill: 'matika:parity', need: 5, reward: 15, route: 'matika' },
  { id: 'm31', emoji: '✏️', name: 'Y alebo I', desc: 'Doplň 5× správne y/i do slova', skill: 'citanie:ydy', need: 5, reward: 16, route: 'citanie' },
  { id: 'm32', emoji: '👑', name: 'Superfinále', desc: 'Vyber si 5× správne, čo si môžeš kúpiť', skill: 'peniaze:afford', need: 5, reward: 25, route: 'peniaze' },
  // — 3. kapitola: hlavolamy a veľká matika —
  { id: 'm33', emoji: '🧩', name: 'Chýbajúce čísla', desc: 'Doplň 6× číslo (aj 15 − ▢ = 10)', skill: 'matika:missing', need: 6, reward: 12, route: 'matika' },
  { id: 'm34', emoji: '➕➖', name: 'Znamienkarka', desc: 'Doplň 6× správne znamienko (8 ▢ 3 = 5)', skill: 'matika:sign', need: 6, reward: 12, route: 'matika' },
  { id: 'm35', emoji: '🐍', name: 'Krotiteľka hadov', desc: 'Vypočítaj 8 krokov počítacieho hada', skill: 'hlavolamy:had', need: 8, reward: 14, route: 'hlavolamy' },
  { id: 'm36', emoji: '🔺', name: 'Staviteľka pyramíd', desc: 'Postav 4 súčtové pyramídy', skill: 'hlavolamy:pyramida', need: 4, reward: 14, route: 'hlavolamy' },
  { id: 'm37', emoji: '🔢', name: 'Číselné rady', desc: 'Doplň 5× chýbajúce číslo v rade', skill: 'hlavolamy:rad', need: 5, reward: 13, route: 'hlavolamy' },
  { id: 'm38', emoji: '🌳', name: 'Rozkladačka', desc: 'Rozlož 5 čísel na dve časti', skill: 'hlavolamy:rozklad', need: 5, reward: 13, route: 'hlavolamy' },
  { id: 'm39', emoji: '📖', name: 'Slovné úlohy', desc: 'Vyrieš 5 slovných úloh', skill: 'hlavolamy:slovne', need: 5, reward: 15, route: 'hlavolamy' },
  { id: 'm40', emoji: '🔟', name: 'Desiatková', desc: 'Vypočítaj 5 príkladov s desiatkami (30 + 40)', skill: 'velka:desiatky', need: 5, reward: 15, route: 'velka' },
  { id: 'm41', emoji: '💯', name: 'Stovkárka', desc: 'Vypočítaj 6 príkladov do 100', skill: 'velka:do100', need: 6, reward: 16, route: 'velka' },
  { id: 'm42', emoji: '✖️', name: 'Násobilka', desc: 'Vypočítaj 6 príkladov násobilky', skill: 'velka:nasobilka', need: 6, reward: 18, route: 'velka' },
  { id: 'm43', emoji: '🏆', name: 'Veľmajsterka', desc: 'Vypočítaj ďalších 10 krokov hada', skill: 'hlavolamy:had', need: 10, reward: 30, route: 'hlavolamy' },
];

// ===== Slovné úlohy (overené výpočty) =====
export const WORD_PROBLEMS = [
  { text: 'Zuzka má 5 jabĺk. Mama jej dá ešte 3. Koľko jabĺk má Zuzka?', answer: 8, emoji: '🍎', hint: 'Sčítaj: päť plus tri.' },
  { text: 'Miško mal 10 cukríkov. 4 zjedol. Koľko cukríkov mu ostalo?', answer: 6, emoji: '🍬', hint: 'Odčítaj: desať mínus štyri.' },
  { text: 'Na strome sedelo 7 vtáčikov. 2 odleteli. Koľko vtáčikov ostalo?', answer: 5, emoji: '🐦', hint: 'Odčítaj: sedem mínus dva.' },
  { text: 'V garáži sú 4 červené autá a 5 modrých. Koľko áut je spolu?', answer: 9, emoji: '🚗', hint: 'Sčítaj: štyri plus päť.' },
  { text: 'Ema má 6 nálepiek. Laura má o 3 viac. Koľko nálepiek má Laura?', answer: 9, emoji: '⭐', hint: 'O tri viac znamená: šesť plus tri.' },
  { text: 'Kubo má 12 guličiek. Tomáš má o 4 menej. Koľko guličiek má Tomáš?', answer: 8, emoji: '🔵', hint: 'O štyri menej znamená: dvanásť mínus štyri.' },
  { text: 'Na ihrisku sa hralo 8 detí. Prišli ešte 4. Koľko detí je na ihrisku?', answer: 12, emoji: '🛝', hint: 'Sčítaj: osem plus štyri.' },
  { text: 'V košíku bolo 15 vajíčok. 5 sa rozbilo. Koľko celých vajíčok ostalo?', answer: 10, emoji: '🥚', hint: 'Odčítaj: pätnásť mínus päť.' },
  { text: 'Babka upiekla 9 koláčikov a dedko 6. Koľko koláčikov upiekli spolu?', answer: 15, emoji: '🥧', hint: 'Sčítaj: deväť plus šesť.' },
  { text: 'V akváriu pláva 11 rybičiek. Prikúpili sme 6. Koľko rybičiek je v akváriu?', answer: 17, emoji: '🐟', hint: 'Sčítaj: jedenásť plus šesť.' },
  { text: 'Simonka mala 20 eur. Kúpila si knihu za 8 eur. Koľko eur jej ostalo?', answer: 12, emoji: '💶', hint: 'Odčítaj: dvadsať mínus osem.' },
  { text: 'Na lúke je 7 včiel a 7 motýľov. Koľko zvieratiek je na lúke spolu?', answer: 14, emoji: '🐝', hint: 'Sčítaj: sedem plus sedem.' },
  { text: 'V triede je 18 detí. 9 sú chlapci. Koľko je dievčat?', answer: 9, emoji: '🏫', hint: 'Odčítaj: osemnásť mínus deväť.' },
  { text: 'Filip prečítal ráno 6 strán a večer 8 strán. Koľko strán prečítal za celý deň?', answer: 14, emoji: '📖', hint: 'Sčítaj: šesť plus osem.' },
  { text: 'Na parkovisku bolo 30 áut. 10 odišlo. Koľko áut ostalo?', answer: 20, emoji: '🅿️', hint: 'Odčítaj: tridsať mínus desať.' },
  { text: 'Pani učiteľka má 40 výkresov. 20 rozdá deťom. Koľko výkresov jej ostane?', answer: 20, emoji: '🎨', hint: 'Odčítaj: štyridsať mínus dvadsať.' },
  { text: 'Každý zo 4 kamarátov má 2 balóny. Koľko balónov majú spolu?', answer: 8, emoji: '🎈', hint: 'Počítaj: štyri krát dva.' },
  { text: 'V 3 košíkoch je po 5 hrušiek. Koľko hrušiek je spolu?', answer: 15, emoji: '🍐', hint: 'Počítaj: tri krát päť.' },
  { text: 'V košíku je spolu 10 jabĺk. 7 je červených, ostatné sú zelené. Koľko jabĺk je zelených?', answer: 3, emoji: '🍏', hint: 'Odčítaj: desať mínus sedem.' },
  { text: 'Každý zajko má 2 uši. Na lúke sú 3 zajkovia. Koľko uší majú spolu?', answer: 6, emoji: '🐰', hint: 'Počítaj: tri krát dva.' },
  { text: 'Na strome sedelo 14 vtáčikov. Na plote o 6 menej. Koľko vtáčikov sedelo na plote?', answer: 8, emoji: '🐦', hint: 'O šesť menej: štrnásť mínus šesť.' },
  { text: 'Katka má 12 guličiek a Peter má 10. O koľko viac guličiek má Katka?', answer: 2, emoji: '🔵', hint: 'Odčítaj: dvanásť mínus desať.' },
  { text: 'Zuzka má 24 nálepiek. Katka má o 8 viac. Koľko nálepiek má Katka?', answer: 32, emoji: '🌸', hint: 'O osem viac: dvadsaťštyri plus osem.' },
  { text: 'V škole je 32 prvákov a 26 druhákov. Koľko detí je v škole spolu?', answer: 58, emoji: '🏫', hint: 'Sčítaj: tridsaťdva plus dvadsaťšesť.' },
  { text: 'Pani učiteľka mala 60 jabĺk. Deťom rozdala 25. Koľko jabĺk jej zostalo?', answer: 35, emoji: '👩‍🏫', hint: 'Odčítaj: šesťdesiat mínus dvadsaťpäť.' },
  { text: 'Kolobežka stojí 78 eur. Laura má našetrených 50 eur. Koľko eur jej ešte chýba?', answer: 28, emoji: '🛴', hint: 'Odčítaj: sedemdesiatosem mínus päťdesiat.' },
  { text: 'Na farme je 40 oviec a 25 kôz. O koľko viac oviec ako kôz je na farme?', answer: 15, emoji: '🐑', hint: 'Odčítaj: štyridsať mínus dvadsaťpäť.' },
  { text: 'Jedno autíčko stojí 4 eurá. Koľko eur zaplatí Kubo za 5 autíčok?', answer: 20, emoji: '🚙', hint: 'Počítaj: päť krát štyri.' },
];

// Pochvaly
export const PRAISES = [
  'Výborne!', 'Super!', 'Si šikovná!', 'Paráda!', 'Skvelé!',
  'Bravó!', 'Ide ti to!', 'Juchú!', 'Perfektné!',
];
export const ENCOURAGE = [
  'Skús to ešte raz!', 'Nevadí, nabudúce to vyjde!', 'Takmer!', 'Skoro!',
];
