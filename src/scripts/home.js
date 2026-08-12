// Home page interactivity: symbol library, popular symbols, fancy text,
// aesthetic dividers, and the AI tool panel.
// Clipboard, theme, and the favourites store live in src/layouts/Base.astro.

const copy = (text) => window.copyText(text);

/* ============================================================
   Data
   ============================================================ */

const CATEGORIES = {
  Hearts: '♥ ♡ ❤ ❥ ❦ ❧ ღ 💕 💖 💗 💘 💝 💞 💟 💔 ❣ 🤍 🖤 💙 💚 💛 🧡 💜 🤎'.split(' '),
  Stars: '★ ☆ ✦ ✧ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ✰ ⋆ ✶ ✷ ✸ ✹ ✺ ❇ ❈ ❉ ❊ ❋ ✨ ⭐ 🌟 💫 🌠 ⚝ ⍟'.split(' '),
  Arrows: '← → ↑ ↓ ↔ ↕ ↖ ↗ ↘ ↙ ⇐ ⇒ ⇑ ⇓ ⇔ ⇕ ↞ ↠ ↟ ↡ ➜ ➝ ➞ ➟ ➠ ➢ ➣ ➤ ➥ ➦ ➧ ➨'.split(' '),
  Aesthetic: '✦ ✧ ⋆ ☾ ☽ ✩ ⊹ ࿔ 𓆸 𓂃 ꒰ ꒱ ⌒ ⌗ ❀ ✿ ❁ ⚜ ✟ ☘ ♛ ♕ ⊰ ⊱ ❥ ✾ ❃ ❊'.split(' '),
  Math: '∞ ≠ ≈ ≤ ≥ ± × ÷ √ ∑ ∏ ∫ ∂ ∆ ∇ π Σ Ω ∀ ∃ ∈ ∉ ⊂ ⊃ ∪ ∩ ⊕ ⊗ µ θ λ φ ψ α β γ δ'.split(' '),
  Currency: '$ € £ ¥ ₹ ₽ ₩ ₿ ¢ ₪ ₺ ₴ ₦ ₱ ₲ ₵ ₸ ₼ ƒ ¤'.split(' '),
  Music: '♩ ♪ ♫ ♬ ♭ ♮ ♯ 𝄞 𝄢 🎵 🎶 🎼 🎤 🎧 🎷 🎸 🎹 🎺 🎻 🪕 🥁'.split(' '),
  Flowers: '❀ ✿ ❁ ❃ ❋ ❊ ✾ ✽ ✼ ❇ ✺ ✹ ✸ ❉ ❈ ☘ ✤ ✥ 🌸 🌺 🌻 🌷 🌹 🌼 💐 🪷 🌱'.split(' '),
  Lines: '─ ━ │ ┃ ╌ ╍ ╎ ╏ ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ╭ ╮ ╯ ╰'.split(' '),
  Shapes: '◆ ◇ ◈ ◉ ○ ● ◐ ◑ ◒ ◓ ■ □ ▢ ▣ ▤ ▥ ▦ ▧ ▨ ▩ ▪ ▫ ▬ ▲ ▼ ◀ ▶ ◢ ◣ ◤ ◥'.split(' '),
  Weather: '☀ ☁ ☂ ☃ ☄ ☇ ☈ ☉ ☼ ☽ ☾ ❄ ❅ ❆ ☔ ⛈ 🌤 🌥 🌦 🌧 🌨 🌩 🌪 🌫 🌬 🌈 ⚡'.split(' '),
  Zodiac: '♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ ⛎ ☉ ☽ ☿ ♀ ♁ ♂ ♃ ♄ ♅ ♆ ♇'.split(' '),
  Punctuation: '« » ‹ › „ … – ¡ ¿ § ¶ † ‡ • ‰ ‱ ′ ″ ‴ ※ ⁂ ⁕ ❝ ❞'.split(' '),
  Symbols: '☯ ☮ ✝ ☦ ☪ ☸ ☢ ☣ ⚛ ♻ ⚜ ⚓ ⚔ ⚖ ⚙ ⚡ ☘ ✌ ✍ ☎ ✉ ✏ ✒ ✂ ⌛ ⌚ ☠'.split(' '),
};

const POPULAR_SYMBOLS =
  '✦ ♡ ★ → ☾ ✿ ∞ ☁ ♪ ✧ ☺ ♛ ♥ ⋆ ✓ ❀'.split(' ');

const DIVIDERS = [
  { name: 'Sparkle line', text: '⋆｡˚⋆୨ ୧⋆˚｡⋆' },
  { name: 'Cloud trail', text: '‧₊˚ ☁️⋅♡𓂃 ࣪˖ ִֶָ☾.' },
  { name: 'Star path', text: '꒰⑅ᵕ̈༚˚ ⊹꒱' },
  { name: 'Heart row', text: '♡⋆｡˚꩜｡˚⋆♡' },
  { name: 'Bracket bio', text: '⌗ ⌒⌒⌒  ╰┈➤' },
  { name: 'Tilde wave', text: '〜〜〜♡〜〜〜' },
  { name: 'Dot leader', text: '· · ─ · ✦ · ─ · ·' },
  { name: 'Arrow header', text: '╭─ ⋆⋅☆⋅⋆ ─╮' },
  { name: 'Triple star', text: '✦ ✦ ✦' },
  { name: 'Lotus break', text: '𓆸 ⋆｡˚ 𓆸 ˚｡⋆ 𓆸' },
];

const AI_MODES = [
  {
    id: 'ascii',
    label: 'ASCII Art',
    prompt: 'Describe what you want to create',
    fields: [{ name: 'subject', placeholder: 'Example: cat, heart, tree, gaming controller...', type: 'textarea' }],
    examples: ['Cat', 'Heart', 'Tree', 'Game Controller', 'Butterfly', 'Rocket'],
    monospace: true,
  },
  {
    id: 'names',
    label: 'Name Generator',
    prompt: 'Theme, plus an optional base name',
    fields: [
      { name: 'theme', placeholder: 'dark, kawaii, gaming, royal, neon...', type: 'input' },
      { name: 'base', placeholder: 'Optional: base nickname to stylize', type: 'input' },
    ],
    examples: ['Gaming', 'Kawaii', 'Dark', 'Royal', 'Neon'],
    monospace: false,
  },
  {
    id: 'bio',
    label: 'Bio Generator',
    prompt: 'Describe yourself or your account',
    fields: [{ name: 'about', placeholder: 'travel blogger, loves coffee, based in Tokyo...', type: 'textarea' }],
    examples: ['Travel blogger', 'Music producer', 'Book lover', 'Fitness coach'],
    monospace: false,
  },
  {
    id: 'stylize',
    label: 'Symbol Combo',
    prompt: 'Text to decorate with themed symbols',
    fields: [
      { name: 'text', placeholder: 'I love coffee', type: 'input' },
      { name: 'mood', placeholder: 'cute, dark, royal, retro, witchy...', type: 'input' },
    ],
    examples: ['Cute', 'Witchy', 'Retro', 'Royal'],
    monospace: false,
  },
  {
    id: 'logo',
    label: 'Block Logo',
    prompt: 'Short word for the logo',
    fields: [{ name: 'word', placeholder: 'NEON, COOL, PVP...', type: 'input' }],
    examples: ['NEON', 'COOL', 'PVP', 'GG'],
    monospace: true,
  },
  {
    id: 'pixel',
    label: 'Pixel Art',
    prompt: 'Object to render in pixel art',
    fields: [{ name: 'subject', placeholder: 'heart, star, mushroom, sword...', type: 'input' }],
    examples: ['Heart', 'Star', 'Mushroom', 'Sword'],
    monospace: true,
  },
];

/* ============================================================
   Fancy text transforms
   ============================================================ */

const A = 'abcdefghijklmnopqrstuvwxyz';
const A_UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const D = '0123456789';

function mapChars(text, mapLower, mapUpper, mapDigit) {
  return [...text]
    .map((ch) => {
      const li = A.indexOf(ch);
      if (li !== -1 && mapLower) return mapLower[li] || ch;
      const ui = A_UP.indexOf(ch);
      if (ui !== -1 && mapUpper) return mapUpper[ui] || ch;
      const di = D.indexOf(ch);
      if (di !== -1 && mapDigit) return mapDigit[di] || ch;
      return ch;
    })
    .join('');
}

const STYLES = [
  { name: 'Bubble', fn: (t) => mapChars(t,
      [...'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ'],
      [...'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ'],
      [...'⓪①②③④⑤⑥⑦⑧⑨']) },
  { name: 'Small caps', fn: (t) => mapChars(t,
      [...'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'],
      [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']) },
  { name: 'Script', fn: (t) => mapChars(t,
      [...'𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'],
      [...'𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵']) },
  { name: 'Bold', fn: (t) => mapChars(t,
      [...'𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳'],
      [...'𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙'],
      [...'𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗']) },
  { name: 'Double struck', fn: (t) => mapChars(t,
      [...'𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫'],
      [...'𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ'],
      [...'𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡']) },
  { name: 'Black box', fn: (t) => mapChars(t,
      [...'🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉'],
      [...'🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉']) },
  { name: 'Fraktur', fn: (t) => mapChars(t,
      [...'𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷'],
      [...'𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ']) },
  { name: 'Italic', fn: (t) => mapChars(t,
      [...'𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧'],
      [...'𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍']) },
  { name: 'Monospace', fn: (t) => mapChars(t,
      [...'𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣'],
      [...'𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉'],
      [...'𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿']) },
  { name: 'Fullwidth', fn: (t) => mapChars(t,
      [...'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ'],
      [...'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ'],
      [...'０１２３４５６７８９']).replace(/ /g, '　') },
  { name: 'Strikethrough', fn: (t) => [...t].map((c) => c + '̶').join('') },
  { name: 'Aesthetic', fn: (t) => '⋆˚࿔ ' + t + ' 𝜗𝜚˚⋆' },
];

/* ============================================================
   Symbol cards
   ============================================================ */

function codePoints(symbol) {
  return [...symbol]
    .map((c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'))
    .join(' ');
}

function buildSymbolCard(symbol, group) {
  const card = document.createElement('div');
  card.className = 'symbol-card';
  card.dataset.symbol = symbol;
  card.dataset.group = group || '';
  card.dataset.search = symbol + ' ' + codePoints(symbol);

  // The click is handled by the delegated listener in Base.astro, so this
  // only needs the data attribute.
  const fav = document.createElement('button');
  fav.type = 'button';
  fav.className = 'fav-toggle';
  fav.dataset.fav = symbol;
  fav.textContent = '♡';
  fav.title = 'Save to collection';
  fav.setAttribute('aria-label', 'Save ' + symbol + ' to your collection');

  const glyph = document.createElement('span');
  glyph.className = 'symbol-glyph';
  glyph.textContent = symbol;
  glyph.title = codePoints(symbol);

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'copy-action';
  copyBtn.innerHTML = '<span aria-hidden="true">⧉</span> Copy';
  copyBtn.addEventListener('click', async () => {
    const ok = await copy(symbol);
    if (!ok) return;
    card.classList.add('is-copied');
    copyBtn.classList.add('copied');
    clearTimeout(card._t);
    card._t = setTimeout(() => {
      card.classList.remove('is-copied');
      copyBtn.classList.remove('copied');
    }, 1300);
  });

  card.append(fav, glyph, copyBtn);
  return card;
}

/**
 * Repaints the save icons after this page renders cards of its own.
 *
 * The store repaints on every change, but the symbol grid is rebuilt on every
 * search keystroke and category switch, and those new buttons start blank.
 */
function syncFavoriteIcons() {
  window.favorites?.syncIcons();
}

/* ============================================================
   Main library
   ============================================================ */

const catTabsEl = document.getElementById('catTabs');
const gridEl = document.getElementById('symbolsGrid');
const resultCountEl = document.getElementById('resultCount');
const searchEmptyEl = document.getElementById('searchEmpty');
const searchInput = document.getElementById('symbolSearch');
const copyVisibleBtn = document.getElementById('copyVisible');

const categoryNames = Object.keys(CATEGORIES);
let activeCategory = categoryNames[0];

function renderLibrary() {
  gridEl.innerHTML = '';
  // While searching, look across every category rather than the active one.
  const query = (searchInput?.value || '').trim().toLowerCase();
  const source = query
    ? categoryNames.flatMap((name) => CATEGORIES[name].map((s) => ({ s, name })))
    : CATEGORIES[activeCategory].map((s) => ({ s, name: activeCategory }));

  const seen = new Set();
  let shown = 0;
  source.forEach(({ s, name }) => {
    if (seen.has(s)) return;
    if (query && !(s + ' ' + codePoints(s)).toLowerCase().includes(query)) return;
    seen.add(s);
    gridEl.appendChild(buildSymbolCard(s, name));
    shown += 1;
  });

  resultCountEl.textContent = shown + (shown === 1 ? ' symbol' : ' symbols');
  searchEmptyEl.hidden = shown !== 0;
  syncFavoriteIcons();
}

function renderCategoryPills() {
  catTabsEl.innerHTML = '';
  categoryNames.slice(0, 6).forEach((name) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'chip' + (name === activeCategory ? ' active' : '');
    pill.textContent = name;
    pill.setAttribute('aria-pressed', name === activeCategory ? 'true' : 'false');
    pill.addEventListener('click', () => {
      activeCategory = name;
      if (searchInput) searchInput.value = '';
      renderCategoryPills();
      renderLibrary();
      document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    catTabsEl.appendChild(pill);
  });

  const more = document.createElement('a');
  more.className = 'chip';
  more.href = '#collections';
  more.textContent = 'More categories';
  more.style.textDecoration = 'none';
  catTabsEl.appendChild(more);
}

/* ============================================================
   Popular symbols
   ============================================================ */

function renderPopular() {
  const el = document.getElementById('popularSymbols');
  el.innerHTML = '';
  POPULAR_SYMBOLS.forEach((symbol) => el.appendChild(buildSymbolCard(symbol, 'Popular')));
  syncFavoriteIcons();
}

/* ============================================================
   Fancy text
   ============================================================ */

function buildStyleRow(label, output, isDivider) {
  const row = document.createElement('div');
  row.className = 'style-row' + (isDivider ? ' divider-row' : '');

  const labelEl = document.createElement('div');
  labelEl.className = 'label';
  labelEl.textContent = label;

  const outEl = document.createElement('div');
  outEl.className = 'output';
  outEl.textContent = output;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy-action';
  btn.textContent = 'Copy';
  btn.addEventListener('click', async () => {
    const ok = await copy(output);
    if (!ok) return;
    btn.classList.add('copied');
    btn.textContent = 'Copied';
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = 'Copy';
    }, 1300);
  });

  row.append(labelEl, outEl, btn);
  return row;
}

const stylesEl = document.getElementById('styles');
const genInput = document.getElementById('genInput');

function renderStyles() {
  const text = genInput.value || 'Cool Symbols';
  stylesEl.innerHTML = '';
  STYLES.forEach((style) => stylesEl.appendChild(buildStyleRow(style.name, style.fn(text), false)));
}

/* ============================================================
   Sidebar fancy text preview
   ============================================================ */

const miniInput = document.getElementById('miniFancyInput');
const miniRows = document.getElementById('miniFancyRows');
const MINI_STYLES = ['Bubble', 'Small caps', 'Script'];

function renderMiniFancy() {
  const text = miniInput.value || 'Fancy text';
  miniRows.innerHTML = '';
  MINI_STYLES.forEach((name) => {
    const style = STYLES.find((s) => s.name === name);
    if (!style) return;
    const output = style.fn(text);

    const row = document.createElement('div');
    row.className = 'mini-row';

    const label = document.createElement('span');
    label.className = 'mini-row-label';
    label.textContent = name;

    const body = document.createElement('div');
    body.className = 'mini-row-body';

    const out = document.createElement('div');
    out.className = 'mini-row-out';
    out.textContent = output;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-action';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => copy(output));

    body.append(out, btn);
    row.append(label, body);
    miniRows.appendChild(row);
  });
}

/* ============================================================
   Dividers
   ============================================================ */

function renderDividers() {
  const el = document.getElementById('dividers');
  el.innerHTML = '';
  DIVIDERS.forEach((divider) => {
    const card = document.createElement('div');
    card.className = 'divider-card';

    const preview = document.createElement('div');
    preview.className = 'divider-preview';
    preview.textContent = divider.text;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-action';
    btn.innerHTML = '<span aria-hidden="true">⧉</span> Copy';
    btn.addEventListener('click', async () => {
      const ok = await copy(divider.text);
      if (!ok) return;
      btn.classList.add('copied');
      clearTimeout(btn._t);
      btn._t = setTimeout(() => btn.classList.remove('copied'), 1300);
    });

    card.append(preview, btn);
    el.appendChild(card);
  });
}

/* ============================================================
   AI tools
   ============================================================ */

let activeMode = AI_MODES[0];

const aiTabs = document.getElementById('aiTabs');
const aiInputArea = document.getElementById('aiInputArea');
const aiExamples = document.getElementById('aiExamples');
const aiBtn = document.getElementById('aiGenerate');
const aiResult = document.getElementById('aiResult');
const aiResultContent = document.getElementById('aiResultContent');
const aiCopyBtn = document.getElementById('aiCopyBtn');
const aiRemaining = document.getElementById('aiRemaining');

function renderAiTabs() {
  aiTabs.innerHTML = '';
  AI_MODES.forEach((mode) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'ai-tab' + (mode.id === activeMode.id ? ' active' : '');
    tab.textContent = mode.label;
    tab.setAttribute('aria-pressed', mode.id === activeMode.id ? 'true' : 'false');
    tab.addEventListener('click', () => {
      activeMode = mode;
      renderAiTabs();
      renderAiFields();
      renderAiExamples();
      aiResult.classList.remove('show');
    });
    aiTabs.appendChild(tab);
  });
}

function renderAiFields() {
  aiInputArea.innerHTML = '';
  const prompt = document.createElement('div');
  prompt.className = 'ai-prompt';
  prompt.textContent = activeMode.prompt;
  aiInputArea.appendChild(prompt);

  activeMode.fields.forEach((field) => {
    const el = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
    el.className = 'ai-field';
    el.name = field.name;
    el.placeholder = field.placeholder;
    if (field.type === 'textarea') el.rows = 3;
    else el.type = 'text';
    aiInputArea.appendChild(el);
  });
}

function renderAiExamples() {
  aiExamples.innerHTML = '';
  activeMode.examples.forEach((example) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'ai-example';
    chip.textContent = example;
    chip.addEventListener('click', () => {
      const first = aiInputArea.querySelector('.ai-field');
      if (first) {
        first.value = example;
        first.focus();
      }
    });
    aiExamples.appendChild(chip);
  });
}

function collectInputs() {
  const inputs = {};
  activeMode.fields.forEach((field) => {
    const el = aiInputArea.querySelector('[name="' + field.name + '"]');
    inputs[field.name] = (el?.value || '').trim();
  });
  return inputs;
}

function showResult(text, mono) {
  aiResultContent.innerHTML = '';
  const el = document.createElement(mono ? 'pre' : 'div');
  if (!mono) el.className = 'result-text';
  el.textContent = text;
  aiResultContent.appendChild(el);
  aiCopyBtn.style.display = 'block';
  aiCopyBtn._text = text;
}

function showError(message, reason) {
  aiCopyBtn.style.display = 'none';
  aiResultContent.innerHTML = '';
  const soft = reason === 'ip_limit' || reason === 'budget_exhausted' || reason === 'budget_check_failed';
  const el = document.createElement('div');
  if (soft) {
    el.className = 'ai-notice' + (reason === 'ip_limit' ? '' : ' budget');
  } else {
    el.className = 'ai-error';
  }
  el.textContent = message;
  aiResultContent.appendChild(el);
}

async function generate() {
  const inputs = collectInputs();
  if (!Object.values(inputs).some((v) => v)) {
    aiResult.classList.add('show');
    showError('Type something first.');
    return;
  }

  aiBtn.disabled = true;
  aiResult.classList.add('show');
  aiResultContent.innerHTML = '<div class="ai-loading"><div class="spinner"></div>Generating...</div>';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: activeMode.id, inputs }),
    });
    const data = await response.json();
    if (typeof data.remaining === 'number') aiRemaining.textContent = data.remaining;
    if (!response.ok) {
      showError(data.error || 'Something went wrong.', data.reason);
      return;
    }
    showResult(data.text, activeMode.monospace);
  } catch (error) {
    showError('Network error. Try again.', 'network');
  } finally {
    aiBtn.disabled = false;
  }
}

/* ============================================================
   Wire up
   ============================================================ */

renderCategoryPills();
renderLibrary();
renderPopular();
renderStyles();
renderMiniFancy();
renderDividers();
renderAiTabs();
renderAiFields();
renderAiExamples();
syncFavoriteIcons();

searchInput?.addEventListener('input', renderLibrary);
genInput.addEventListener('input', renderStyles);
miniInput.addEventListener('input', renderMiniFancy);
aiBtn.addEventListener('click', generate);
aiCopyBtn.addEventListener('click', () => copy(aiCopyBtn._text || ''));

copyVisibleBtn?.addEventListener('click', () => {
  const visible = [...gridEl.querySelectorAll('.symbol-card')].map((c) => c.dataset.symbol);
  copy(visible.join(' '));
});

// Cmd/Ctrl+K focuses the hero search, matching the hint in the field.
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput?.focus();
    searchInput?.select();
  }
});
