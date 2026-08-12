/**
 * Adds ready-made combinations to the decorative categories.
 *
 * Why this matters more than adding more single symbols: ♥ and ★ are the exact
 * same code points on every site that lists them, so a page of individual
 * glyphs carries nothing a search engine has not already indexed a thousand
 * times. An arrangement is different. Nobody else has this particular set of
 * lines, and that is the part of the page that is genuinely ours.
 *
 * Every combination below is written to be pasted whole into a bio, caption,
 * or display name.
 *
 * Run with: node scripts/add-combos-decorative.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

const PATCHES = {
  'star-symbols': {
    comboTitle: 'Star combinations and sparkle lines',
    comboIntro:
      'Complete lines built from stars and sparkles. Click one to copy the whole arrangement.',
    comboGroups: [
      {
        name: 'Sparkle lines',
        items: [
          '⋆｡°✩',
          '｡ﾟ✧⋆｡',
          '⋆⭒˚｡⋆',
          '✧･ﾟ: *✧･ﾟ:*',
          '｡✧*｡ ⋆｡',
          '⋆ ˚｡⋆୨୧˚',
          '˚｡⋆｡˚✩',
          '⁺˚⋆｡°✩₊',
        ],
      },
      {
        name: 'Dividers',
        items: [
          '── ⋆⋅☆⋅⋆ ──',
          '•·͙*̩̩͙˚̩̥̩̥*̩̩̥͙·͙•',
          '⋆ ⋆ ⋆ ⋆ ⋆',
          '─────★─────',
          '✦ ✦ ✦',
          '·˚ ༘ ⋆｡˚ ⋆',
          '★彡 ミ★',
          '⁺‧₊˚ ★ ˚₊‧⁺',
        ],
      },
      {
        name: 'Name framing',
        items: [
          '⋆˚✧ name ✧˚⋆',
          '★ name ★',
          '✦ ˚ name ˚ ✦',
          '｡⋆ name ⋆｡',
          '⭑ name ⭑',
          '˚ ✦ name ✦ ˚',
        ],
      },
      {
        name: 'Ratings',
        items: [
          '★★★★★',
          '★★★★☆',
          '★★★☆☆',
          '★★☆☆☆',
          '★☆☆☆☆',
          '✦✦✦✦✧',
        ],
      },
    ],
  },

  'flower-symbols': {
    comboTitle: 'Flower combinations and floral borders',
    comboIntro:
      'Floral lines assembled from the florettes and emoji above. Copy a whole line and drop it into a bio or caption.',
    comboGroups: [
      {
        name: 'Borders',
        items: [
          '❀────────❀',
          '✿ ✿ ✿ ✿ ✿',
          '─ ❀ ─ ❀ ─ ❀ ─',
          '❁ ❁ ❁',
          '·°❀.ೃ࿔*:･',
          '❀°•.•°❀',
          '✾ ⋆ ✾ ⋆ ✾',
          '❃ ❃ ❃ ❃',
        ],
      },
      {
        name: 'Name framing',
        items: [
          '❀ name ❀',
          '✿ ⋆ name ⋆ ✿',
          '❁ ˚ name ˚ ❁',
          '୨୧ name ୨୧',
          '✾ name ✾',
          '❦ name ❧',
        ],
      },
      {
        name: 'Seasonal lines',
        items: [
          '🌸 ⋆ spring ⋆ 🌸',
          '🌻 summer days 🌻',
          '🍂 ˚ autumn ˚ 🍂',
          '🌷 blooming 🌷',
          '🌿 slow living 🌿',
          '🌱 growing ⋆',
        ],
      },
      {
        name: 'Soft accents',
        items: [
          '❀ ⋆ ❀',
          '✿·°·✿',
          '❁ ⌒ ❁',
          '⋆ ❀ ⋆ ❀ ⋆',
          '˚ ✿ ˚',
          '❀ ｡ ❀',
        ],
      },
    ],
  },

  'aesthetic-symbols': {
    comboTitle: 'Aesthetic combinations for bios and profiles',
    comboIntro:
      'The arrangements this style is actually made of. Copy a line whole, then swap the words for your own and leave the framing alone.',
    comboGroups: [
      {
        name: 'Name framing',
        items: [
          '⋆˚࿔ name 𝜗𝜚˚⋆',
          '‧₊˚ ⋅ name ⋅ ˚₊‧',
          '˚ ༘ ೀ⋆｡˚ name',
          '⊹ ࣪ ˖ name ˖ ࣪ ⊹',
          '๋࣭ ⭑ name ⭑ ๋࣭',
          '⋆｡‧˚ name ˚‧｡⋆',
          '𖦹 ⋆ name ⋆ 𖦹',
          '⟡ ˚ name ˚ ⟡',
        ],
      },
      {
        name: 'Celestial',
        items: [
          '☾ ⋆｡˚ ☽',
          '˚ ✧ ☾ ✧ ˚',
          '⋆ ˚｡⋆୨ ☾ ୧⋆˚｡⋆',
          '☾｡⋆ ࿐ ࿔*:･',
          '˖ ࣪ ⊹ ☽ ⊹ ࣪ ˖',
          '⋆ ☼ ⋆ ☾ ⋆',
        ],
      },
      {
        name: 'Dividers',
        items: [
          '⋆⭒˚｡⋆',
          '‧₊˚ ⋅ ⋅ ˚₊‧',
          '⊹ ࣪ ˖ ⊹ ࣪ ˖',
          '˖ ⋆ ˖ ⋆ ˖',
          '⟡ ⋆ ⟡ ⋆ ⟡',
          '๋࣭ ⭑ ๋࣭ ⭑ ๋࣭',
          '⋰ ⋱ ⋰ ⋱',
          '˚ ⋆ ｡ ⋆ ˚',
        ],
      },
      {
        name: 'Status lines',
        items: [
          '⋆ currently ⋆',
          '˚ ༘ dreaming ⋆｡˚',
          '⊹ soft hours ⊹',
          '⋆˚࿔ back soon ⋆',
          '⟡ offline ⟡',
          '˖ ࣪ resting ࣪ ˖',
        ],
      },
    ],
  },

  'arrow-symbols': {
    comboTitle: 'Arrow combinations and pointer lines',
    comboIntro:
      'Arrows arranged into pointers, dividers, and call-to-action lines that can be pasted whole.',
    comboGroups: [
      {
        name: 'Call to action',
        items: [
          '➜ link below',
          '↳ read more',
          '⇢ tap here',
          '➤ new post',
          '↴ scroll down',
          '⟶ full story',
          '➜ ➜ ➜',
          '↳ ⌗ more',
        ],
      },
      {
        name: 'Dividers',
        items: [
          '→→→→→',
          '⇢ ⇢ ⇢ ⇢',
          '➤ ─────── ➤',
          '↞ ────── ↠',
          '⟵ ⋆ ⟶',
          '➜ ⋅ ➜ ⋅ ➜',
        ],
      },
      {
        name: 'Flow and process',
        items: [
          'start → middle → end',
          'idea ⇢ draft ⇢ ship',
          'input ⟶ output',
          'before ⇄ after',
          'a ⇌ b',
          'plan → do → review',
        ],
      },
      {
        name: 'Compass and direction',
        items: [
          '↖ ↑ ↗',
          '← ⋆ →',
          '↙ ↓ ↘',
          '⇐ ⇑ ⇒ ⇓',
          '↔ ⋅ ↕',
          '⇖ ⇗ ⇘ ⇙',
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
  console.log(`  ${category.slug.padEnd(20)} +${count} combinations`);
}

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log('\nDone.');
