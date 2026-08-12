/**
 * Combinations for the categories where the arrangement does real work rather
 * than decoration: frames, media players, progress bars, checklists.
 *
 * These are the most defensible pages we have. A frame drawn from box-drawing
 * characters or a progress bar made of block elements is something a person
 * assembled, and it solves a problem nothing else on a plain-text surface
 * solves. A search engine has no reason to treat that as a duplicate of
 * anything.
 *
 * Run with: node scripts/add-combos-functional.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

const PATCHES = {
  'line-symbols': {
    comboTitle: 'Borders, frames and dividers',
    comboIntro:
      'Complete frames and rules built from box-drawing characters. These need a monospace context to line up exactly, but most read fine anywhere.',
    comboGroups: [
      {
        name: 'Corner frames',
        items: [
          '┌─────────┐',
          '└─────────┘',
          '╭─────────╮',
          '╰─────────╯',
          '╔═════════╗',
          '╚═════════╝',
          '┏━━━━━━━━━┓',
          '┗━━━━━━━━━┛',
        ],
      },
      {
        name: 'Full boxes',
        items: [
          '╭──────────╮\n│          │\n╰──────────╯',
          '┌──────────┐\n│          │\n└──────────┘',
          '╔══════════╗\n║          ║\n╚══════════╝',
          '╭┈┈┈┈┈┈┈┈┈┈╮\n┊          ┊\n╰┈┈┈┈┈┈┈┈┈┈╯',
        ],
      },
      {
        name: 'Rules and separators',
        items: [
          '──────────',
          '━━━━━━━━━━',
          '══════════',
          '╌╌╌╌╌╌╌╌╌╌',
          '┈┈┈┈┈┈┈┈┈┈',
          '▬▬▬▬▬▬▬▬▬▬',
          '─ ─ ─ ─ ─ ─',
          '━━━━━━ ⋆ ━━━━━━',
        ],
      },
      {
        name: 'Blocks and shading',
        items: [
          '░▒▓█▓▒░',
          '█▓▒░ ░▒▓█',
          '▀▀▀▀▀▀▀▀',
          '▄▄▄▄▄▄▄▄',
          '▌▌▌▌▌▌▌▌',
          '■□■□■□■□',
        ],
      },
    ],
  },

  'music-symbols': {
    comboTitle: 'Player bars, volume meters and music lines',
    comboIntro:
      'Music player interfaces drawn in plain text. Useful in a bio, a status line, or anywhere a screenshot would be overkill.',
    comboGroups: [
      {
        name: 'Player controls',
        items: [
          '↺ ◁ ❙❙ ▷ ↻',
          '⏮ ⏸ ⏭',
          '◁◁ ❚❚ ▷▷',
          '↺ ⏮ ⏯ ⏭ ↻',
          '▶ ❚❚ ■',
          '⏪ ⏯ ⏩',
        ],
      },
      {
        name: 'Progress bars',
        items: [
          '0:57 ──────⚪────── 3:24',
          '1:12 ▬▬▬▬▬▬🔘▬▬▬▬ 4:05',
          '0:00 ──○───────── 2:48',
          '2:31 ▬▬▬▬▬▬▬▬▬🔘▬ 3:10',
          '│▬▬▬▬▬▬▬▬▬▬▬│',
        ],
      },
      {
        name: 'Volume meters',
        items: [
          'volume ▮▮▮▮▮▯▯▯',
          'volume ▮▮▮▮▮▮▮▮',
          'volume ▮▮▯▯▯▯▯▯',
          '🔊 ▬▬▬▬▬▬○──',
          '♪ ▁▂▃▄▅▆▇█',
          '▁▂▃▅▂▇▃▅▂▇',
        ],
      },
      {
        name: 'Now playing',
        items: [
          '♪ now playing ♪',
          '♫ on repeat ♫',
          '♬ ⋆ song title ⋆ ♬',
          '𝄞 ─────── 𝄞',
          '♩ ♪ ♫ ♬',
          '♡ ⋆ playlist ⋆ ♡',
        ],
      },
    ],
  },

  'text-symbols': {
    comboTitle: 'Checklists, progress bars and status lines',
    comboIntro:
      'Arrangements that carry state in plain text, for notes, commit messages, and any field that strips formatting.',
    comboGroups: [
      {
        name: 'Checklists',
        items: [
          '✓ done',
          '✗ dropped',
          '☑ confirmed',
          '☐ to do',
          '✓ ✓ ✓ ✗ ☐',
          '☑ ☑ ☐ ☐ ☐',
        ],
      },
      {
        name: 'Progress bars',
        items: [
          '[■□□□□□□□□□] 10%',
          '[■■■□□□□□□□] 30%',
          '[■■■■■□□□□□] 50%',
          '[■■■■■■■□□□] 70%',
          '[■■■■■■■■■□] 90%',
          '[■■■■■■■■■■] 100%',
        ],
      },
      {
        name: 'Bulleted lists',
        items: [
          '• first\n• second\n• third',
          '‣ first\n‣ second\n‣ third',
          '◦ first\n◦ second\n◦ third',
          '⁃ first\n⁃ second\n⁃ third',
        ],
      },
      {
        name: 'Reference marks',
        items: [
          '※ note',
          '⁂',
          '† footnote',
          '⁕ ⁕ ⁕',
          '⁘ ⁘ ⁘',
          '№ 1',
        ],
      },
    ],
  },

  'shape-symbols': {
    comboTitle: 'Shape patterns and status markers',
    comboIntro: 'Geometric runs and indicator sets assembled from the shapes above.',
    comboGroups: [
      {
        name: 'Status indicators',
        items: [
          '● done ○ pending',
          '◉ active ○ idle',
          '● ● ● ○ ○',
          '◐ in progress',
          '■ blocked □ open',
          '▲ up ▼ down',
        ],
      },
      {
        name: 'Patterns',
        items: [
          '◆◇◆◇◆◇',
          '●○●○●○',
          '■□■□■□',
          '▲▼▲▼▲▼',
          '◈ ◈ ◈ ◈',
          '◐◑◒◓',
        ],
      },
      {
        name: 'Dividers',
        items: [
          '─── ◆ ───',
          '•───◈───•',
          '◇ ◇ ◇',
          '▬▬▬ ● ▬▬▬',
          '◤◢◤◢◤◢',
          '⬡ ⬡ ⬡',
        ],
      },
      {
        name: 'Player and controls',
        items: [
          '◀ ❙❙ ▶',
          '▶ play',
          '■ stop',
          '▼ menu',
          '▸ expand',
          '▾ collapse',
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
