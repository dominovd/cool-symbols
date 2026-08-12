/**
 * Final pass: remove the last template artefact.
 *
 * Six pages opened their how-to section with "Click any symbol to copy",
 * which is exactly the repeated scaffolding that makes a set of pages read as
 * generated. Each opening below leads with something specific to its own
 * subject instead. The instruction itself is redundant anyway: every symbol on
 * the site is a button and the toolbar above it already says so.
 *
 * Also adds the CJK corner brackets to punctuation-symbols, which the copy
 * referenced but the symbol list did not contain.
 *
 * Run with: node scripts/patch-howto-openings.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

/** Replaces only the opening clause, keeping the rest of each paragraph. */
const OPENINGS = {
  'math-symbols': {
    from: /^Click any character to copy\. /,
    to: 'Notation is a set of conventions, and following them is what makes an expression readable to someone else. ',
  },
  'currency-symbols': {
    from: /^Click any symbol to copy\. /,
    to: 'Where the sign goes depends on the language, not on the currency. ',
  },
  'music-symbols': {
    from: /^Click any symbol to copy\. /,
    to: 'Support varies more in this set than almost anywhere else, so start with the safe glyphs. ',
  },
  'line-symbols': {
    from: /^Click any character to copy\. /,
    to: 'One rule governs everything here: box drawing only works in a monospace context, where every character occupies the same width. ',
  },
  'weather-symbols': {
    from: /^Click any symbol to copy\. /,
    to: 'The text forms and the emoji forms suit opposite jobs, and choosing between them is most of the decision. ',
  },
  'zodiac-symbols': {
    from: /^Click any symbol to copy\. /,
    to: 'A sun sign next to a name gives instant context in a profile, which is why this is the most common use by a wide margin. ',
  },
};

/* The how-to for punctuation names the CJK corner brackets, so the page should
   actually carry them. */
const EXTRA_SYMBOLS = {
  'punctuation-symbols': ['「', '」', '『', '』', '〈', '〉', '《', '》'],
};

/* One stray reference on the weather page pointed at a star that lives on
   another page. */
const TEXT_FIXES = {
  'weather-symbols': [
    [
      'Combine snowflake ❄ with stars ✦ for winter wonderland decorations in cards and posts.',
      'Pair the snowflake ❄ with the crescent ☾ for a cold night, or with ❅ and ❆ for a drift of several.',
    ],
  ],
};

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

for (const category of catalog.categories) {
  const opening = OPENINGS[category.slug];
  if (opening) {
    const before = category.howToUse;
    category.howToUse = category.howToUse.replace(opening.from, opening.to);
    if (before !== category.howToUse) console.log(`  reworded opening  ${category.slug}`);
  }

  const extra = EXTRA_SYMBOLS[category.slug];
  if (extra) {
    const existing = new Set(category.symbols);
    const added = extra.filter((symbol) => !existing.has(symbol));
    category.symbols = [...category.symbols, ...added];
    if (added.length) console.log(`  added ${added.length} symbols to ${category.slug}`);
  }

  const fixes = TEXT_FIXES[category.slug];
  if (fixes) {
    for (const [from, to] of fixes) {
      for (const useCase of category.useCases ?? []) {
        if (useCase.description.includes(from)) {
          useCase.description = useCase.description.replace(from, to);
          console.log(`  fixed stale reference in ${category.slug}`);
        }
      }
    }
  }
}

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log('\nDone.');
