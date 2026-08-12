/**
 * Removes the handful of combinations that ended up on two pages.
 *
 * The point of the combination libraries is that each one is unique to its
 * page. Four lines slipped through into a second category during authoring;
 * this replaces them there with distinct alternatives rather than deleting
 * them, so no page loses an item.
 *
 * Run with: node scripts/dedupe-combos.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

/** slug -> { duplicated line: replacement } */
const REPLACEMENTS = {
  'aesthetic-symbols': {
    '⋆⭒˚｡⋆': '⋆ ˖ ࣪ ⭑ ˖ ⋆',
    '‧₊˚ ⋅ name ⋅ ˚₊‧': '⋆ ˚｡ name ｡˚ ⋆',
    '‧₊˚ ⋅ ⋅ ˚₊‧': '˖ ࣪ ⋅ ⋅ ࣪ ˖',
  },
  'cute-symbols': {
    '(｡♥‿♥｡)': '(♡´౪`♡)',
  },
};

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

for (const category of catalog.categories) {
  const map = REPLACEMENTS[category.slug];
  if (!map) continue;
  for (const group of category.comboGroups ?? []) {
    group.items = group.items.map((item) => {
      const replacement = map[item];
      if (!replacement) return item;
      console.log(`  ${category.slug}: "${item}" -> "${replacement}"`);
      return replacement;
    });
  }
}

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log('\nDone.');
