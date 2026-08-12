/**
 * Combinations for the remaining categories that benefit from them.
 *
 * Deliberately skipped: math, currency, special-characters, keyboard, icon.
 * Nobody searches for a decorative arrangement of currency signs, and inventing
 * one would pad the page without helping anyone. Those pages earn their place
 * through the reference tables and grouped sets instead.
 *
 * Run with: node scripts/add-combos-remaining.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

const PATCHES = {
  'weather-symbols': {
    comboTitle: 'Weather and seasonal lines',
    comboIntro: 'Forecast strips, seasonal headers, and mood lines built from the set above.',
    comboGroups: [
      {
        name: 'Forecast strips',
        items: [
          '☀ ⛅ ☁ ☂ ⛈',
          'mon ☀ tue ☁ wed ☂',
          '☀ 24° ⋅ ☁ 18°',
          '❄ ⋅ ☃ ⋅ ❄',
          '🌤 🌥 🌦 🌧 ⛈',
        ],
      },
      {
        name: 'Seasonal headers',
        items: [
          '❄ ⋆ winter ⋆ ❄',
          '☀ summer ☀',
          '🍂 autumn 🍂',
          '☂ rainy days ☂',
          '🌈 after the storm 🌈',
          '⋆ ☃ december ☃ ⋆',
        ],
      },
      {
        name: 'Moon phases',
        items: [
          '🌑 🌒 🌓 🌔 🌕',
          '🌕 🌖 🌗 🌘 🌑',
          '☾ ⋆ ☽',
          '☾ ｡ ⋆ ｡ ☽',
          '⋆ ☾ ⋆ ☾ ⋆',
        ],
      },
      {
        name: 'Mood lines',
        items: [
          '☁ soft day ☁',
          '⛈ heavy week',
          '☀ feeling good ☀',
          '🌫 unclear ⋅',
          '❅ quiet ❅',
        ],
      },
    ],
  },

  'zodiac-symbols': {
    comboTitle: 'Chart lines and zodiac combinations',
    comboIntro:
      'The compact notation astrology profiles actually use, plus decorative lines built around the signs.',
    comboGroups: [
      {
        name: 'Birth chart lines',
        items: [
          '☉ ♌ ☽ ♓ ↑ ♎',
          '☉ sun ⋅ ☽ moon ⋅ ↑ rising',
          '♈ ⋅ ♉ ⋅ ♊',
          '☉♒ ☽♏ ↑♌',
          '⋆ ☉ ♍ ⋆ ☽ ♒ ⋆',
        ],
      },
      {
        name: 'Elements',
        items: [
          '♈ ♌ ♐ fire',
          '♉ ♍ ♑ earth',
          '♊ ♎ ♒ air',
          '♋ ♏ ♓ water',
          '🜂 🜃 🜁 🜄',
        ],
      },
      {
        name: 'Season openers',
        items: [
          '♌ leo season ♌',
          '⋆ ♓ pisces season ♓ ⋆',
          '♏ scorpio szn ♏',
          '☾ ♋ cancer ♋ ☾',
          '✧ ♐ sagittarius ✧',
        ],
      },
      {
        name: 'Planet notation',
        items: [
          '☿ retrograde',
          '♀ in ♉',
          '♂ ⋅ ♃ ⋅ ♄',
          '☉ ☽ ☿ ♀ ♂',
          '♃ ♄ ♅ ♆ ♇',
        ],
      },
    ],
  },

  'punctuation-symbols': {
    comboTitle: 'Quotation frames and typographic lines',
    comboIntro: 'Ready-made pull quotes, ellipsis runs, and bracket framing.',
    comboGroups: [
      {
        name: 'Pull quotes',
        items: [
          '❝ quote ❞',
          '“ quote ”',
          '« quote »',
          '「 quote 」',
          '『 quote 』',
          '❛ quote ❜',
        ],
      },
      {
        name: 'Attribution',
        items: [
          '— author',
          '― author, 2026',
          '⸺ author',
          '– from the book',
          '— unknown',
        ],
      },
      {
        name: 'Corner framing',
        items: [
          '⌜ text ⌟',
          '⌞ text ⌝',
          '⌜⌝\n⌞⌟',
          '⟦ text ⟧',
          '⦅ text ⦆',
          '〈 text 〉',
        ],
      },
      {
        name: 'Emphasis',
        items: [
          '‽',
          '⁉ really',
          '⁈ wait',
          '¡ yes !',
          '¿ what ?',
          '… ⋯ …',
        ],
      },
    ],
  },

  'cute-symbols': {
    comboTitle: 'Kaomoji sets and cute lines',
    comboIntro:
      'Faces grouped by mood, plus soft framing you can wrap around a word. Each is complete and ready to paste.',
    comboGroups: [
      {
        name: 'Happy',
        items: [
          '(๑>◡<๑)',
          '٩(◕‿◕)۶',
          '(｡♥‿♥｡)',
          '(≧◡≦)',
          '(◕ᴗ◕✿)',
          '＼(^ヮ^)／',
        ],
      },
      {
        name: 'Sleepy and soft',
        items: [
          '(˘ω˘)',
          '( ˘ ³˘)',
          '(｡-_-｡)',
          '(´-ω-`)',
          '₍ᐢ.  ̫.ᐢ₎',
          '(=^･ω･^=)',
        ],
      },
      {
        name: 'Animals',
        items: [
          'ʕ•ᴥ•ʔ',
          'ᓚᘏᗢ',
          '/ᐠ - ˕ -マ',
          'ฅ^•ﻌ•^ฅ',
          '(ᵔᴥᵔ)',
          'ʕ ᵔᴥᵔ ʔ',
        ],
      },
      {
        name: 'Soft framing',
        items: [
          '꒰ text ꒱',
          '໒ text ১',
          '୨ text ୧',
          'ʚ text ɞ',
          '⑅ text ⑅',
          '꒰ ⑅ text ⑅ ꒱',
        ],
      },
    ],
  },

  'weird-symbols': {
    comboTitle: 'Runic and occult combinations',
    comboIntro:
      'Arrangements for worldbuilding, dark aesthetics, and anything that should look older than the Latin alphabet.',
    comboGroups: [
      {
        name: 'Runic lines',
        items: [
          'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ',
          'ᛗ ᛚ ᛝ ᛟ ᛞ',
          '᛭ ᚠᚢᚦᚨᚱᚲ ᛭',
          'ᚹ ⋅ ᚺ ⋅ ᚾ',
          'ᛉ ᛊ ᛏ ᛒ ᛖ',
        ],
      },
      {
        name: 'Alchemical',
        items: [
          '🜁 🜂 🜃 🜄',
          '🜍 ⋅ 🜔 ⋅ 🜚',
          '🜎 🜏 🜐',
          '🝆 🝊 🝕',
          '🜇 ⋆ 🜈',
        ],
      },
      {
        name: 'Occult framing',
        items: [
          '⛧ text ⛧',
          '☽ ⚸ ☾',
          '⸸ text ⸸',
          '⚚ ⋅ ⚷',
          '☥ text ☥',
          '⛦ ⋆ ⛦',
        ],
      },
      {
        name: 'Ancient marks',
        items: [
          '☥ ☦ ☧ ☨ ☩',
          '☫ ⋅ ☬',
          '⚶ ⚷ ⚸',
          '☖ ⋅ ☗',
          '⚚ ⋆ ⚚',
        ],
      },
    ],
  },
};

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

for (const category of catalog.categories) {
  const patch = PATCHES[category.slug];
  if (!patch) continue;
  Object.assign(category, patch);
  const count = patch.comboGroups.reduce((n, g) => n + g.items.length, 0);
  console.log(`  ${category.slug.padEnd(22)} +${count} combinations`);
}

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log('\nDone.');
