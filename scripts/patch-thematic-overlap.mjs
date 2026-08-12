/**
 * Third pass: resolve the remaining overlaps between thematic pages.
 *
 *   aesthetic  vs icon-copy-paste  the object pictographs (✉ ☎ ⚙ ⚓) were
 *                                  sitting on aesthetic and belong to icons
 *   star       vs flower           the dingbat asterisks (✸ ✹ ❇ ❈) read as
 *                                  sparkles, so they stay with stars
 *   punctuation vs special-chars   the legal and prime marks (§ ¶ † ′ °)
 *                                  moved to special-characters in pass one
 *   flower     vs aesthetic        the florettes (❀ ✿ ❁) belong to flowers
 *
 * aesthetic-symbols is left holding what the query actually means today:
 * celestial marks, combining sparkles, and the tiny decorative glyphs used in
 * profile design.
 *
 * Run with: node scripts/patch-thematic-overlap.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

const s = (str) => str.trim().split(/\s+/);

const PATCHES = {
  'aesthetic-symbols': {
    unicodeBlock: 'Combining marks, Egyptian Hieroglyphs and celestial symbols',
    symbols: s(`
      ⋆ ˚ ⊹ ࣪ ִ ֶ ָ ๋ ࣭ ⭑ ˖ ⋅ ᐟ ᵎ ⟡ ꙳ ✮ ⍟ ⌗
      ☾ ☽ ☼ ⍜ ⏾ ⋄ ⟢ ⟣ ✧ ✦
      𓆸 𓂃 𓏲 𓍢 𓆉 𓋼 𖦹 𐙚 ᡣ𐭩 ᨒ
      ༄ ༘ ࿐ ࿔ ᜊ ⸝ ⸜ ﹒ ﹔ ⌇ ⌜ ⌝
      ⋆˚ ୧ ୨ ⑅ ᰔ ᥫ᭡ ᯓ ⩇ ⑈ ⋰ ⋱
    `),
  },

  'flower-symbols': {
    unicodeBlock: 'Dingbats florettes (U+2740–U+2749) and botanical emoji',
    symbols: s(`
      ❀ ✿ ❁ ❃ ✾ ✽ ❦ ❧ ⚘ ✻ ✱ ✲
      🌸 🌺 🌻 🌷 🌹 🌼 💐 🪻 🪷 🌾 🌱 🌿 🍀 🍃 🌵 🌴 🌳 🌲 🪴 🎋 🎍 🪸 🪺 🌰 🍂 🍁
    `),
  },

  'star-symbols': {
    unicodeBlock: 'Miscellaneous Symbols, Dingbats stars and asterisks (U+2605, U+2726–U+274B)',
    symbols: s(`
      ★ ☆ ⭐ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ✰ ⭑ ⭒
      ✶ ✷ ✸ ✹ ✺ ❇ ❈ ❉ ❊ ❋ ✤ ✥ ✼ ✳ ✴ ❂ ✵
      ⚝ ⍟ ✨ 🌟 💫 🌠 🌌 ⭐️ ✱ ✲ ⁂
    `),
  },

  'punctuation-symbols': {
    unicodeBlock: 'General Punctuation quotation marks, dashes and brackets',
    symbols: s(`
      « » ‹ › „ “ ” ‟ ‘ ’ ‚ ‛ ❝ ❞ ❛ ❜ 〝 〞 〟
      — – ‒ ― ‐ ‑ … ‥ ⋯
      ¡ ¿ ‼ ⁇ ⁈ ⁉ ‽ ⸮ ⸘
      ‖ ⁀ ⁔ ⸗ ⸚ ⹀ ⁓ ⌐ ¬
      ⌜ ⌝ ⌞ ⌟ ⁅ ⁆ ⟦ ⟧ ⟨ ⟩ ⦅ ⦆
    `),
  },

  /* Bio keeps only the structural connectors; the sparkle marks now live on
     aesthetic-symbols so the two pages stop competing. */
  'symbols-for-bio': {
    symbols: s('⌗ ⋮ ┆ │ ╎ ┊ ⌒ ︶ ꒷ ꒦ ⏝ ⤿ ⤾ ↳ ↴ ⇢ ➜ ➤ ⟿ ⇝ ⌁'),
  },
};

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

for (const category of catalog.categories) {
  const patch = PATCHES[category.slug];
  if (!patch) continue;
  Object.assign(category, patch);
  console.log(`  patched ${category.slug.padEnd(22)} ${category.symbols.length} symbols`);
}

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log('\nDone.');
