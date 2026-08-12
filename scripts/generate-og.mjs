/**
 * Builds the social preview images.
 *
 * Runs at build time rather than per request. The catalogue is static, so an
 * image never changes between two visitors, and generating 52 PNGs once during
 * the build is cheaper and faster than running a serverless function on every
 * crawler hit. Output goes to public/og, which Astro copies into the deploy.
 *
 * Two formats per page:
 *   og   1200x630   Twitter, Facebook, Telegram, Discord, Slack link previews
 *   pin  1000x1500  Pinterest, which rejects landscape images in the feed
 *
 * Every symbol is checked against the font before it is drawn, so a glyph the
 * font cannot render is skipped rather than appearing as an empty rectangle.
 *
 * Run with: node scripts/generate-og.mjs   (wired to npm prebuild)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fontkit from 'fontkit';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FONT_DIR = path.join(ROOT, 'src/assets/fonts');
const OUT_DIR = path.join(ROOT, 'public/og');

const regularPath = path.join(FONT_DIR, 'DejaVuSans.ttf');
const boldPath = path.join(FONT_DIR, 'DejaVuSans-Bold.ttf');

const regular = fs.readFileSync(regularPath);
const bold = fs.readFileSync(boldPath);

/* Coverage check. DejaVu is wide but not complete: runes and the newer
   pictographic blocks are missing, and colour emoji are not in any static font
   satori can use. Anything it cannot draw is filtered out up front. */
const coverage = fontkit.openSync(regularPath);

/**
 * Combining marks (˚ ⊹ ࣪ ࿔) have no standalone form. They are designed to sit
 * on top of a preceding letter, so a tile containing nothing but a combining
 * mark renders empty even though the font reports the code point as present.
 * Same for separators and format characters. All of them are excluded from the
 * card, though they stay on the site itself where they have a base to attach
 * to.
 */
const STANDS_ALONE = /^[^\p{M}\p{Z}\p{C}]+$/u;

const canRender = (symbol) =>
  STANDS_ALONE.test(symbol) &&
  [...symbol].every((char) => coverage.hasGlyphForCodePoint(char.codePointAt(0)));

/**
 * Strips anything the font cannot draw out of a run of prose.
 *
 * Descriptions quote example symbols inline, and a description for the heart
 * page happily contains 💕 💖 💗. Those are colour emoji, absent from every
 * static font, and satori would draw three empty rectangles across the middle
 * of the card. Removing them costs nothing: the same symbols already appear in
 * the tile row below, drawn from the filtered list.
 */
function sanitize(text) {
  return [...text]
    .filter((char) => char === ' ' || coverage.hasGlyphForCodePoint(char.codePointAt(0)))
    .join('')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .replace(/[-–—]\s*$/, '')
    .trim();
}

const FONTS = [
  { name: 'DejaVu', data: regular, weight: 400, style: 'normal' },
  { name: 'DejaVu', data: bold, weight: 700, style: 'normal' },
];

/* Per-category accent, mirroring the tints used on the site itself. */
const TINTS = {
  'heart-symbols': ['#fff1f5', '#ff5ca8'],
  'star-symbols': ['#fff8e8', '#e0a020'],
  'arrow-symbols': ['#eef3fd', '#3b6fd4'],
  'math-symbols': ['#ecf8f1', '#1f9d5c'],
  'currency-symbols': ['#fff3e9', '#d4791f'],
  'music-symbols': ['#eef1fd', '#4b5fd4'],
  'flower-symbols': ['#fff0f7', '#d64f96'],
  'line-symbols': ['#f2f3f7', '#5a5f78'],
  'shape-symbols': ['#fff8e6', '#c9971a'],
  'weather-symbols': ['#eaf4fd', '#2b83c4'],
  'zodiac-symbols': ['#f3eefd', '#6c4cf5'],
  'punctuation-symbols': ['#fdeff5', '#c2439a'],
  'aesthetic-symbols': ['#f2edfe', '#6c4cf5'],
  'text-symbols': ['#f1f2f7', '#4d5370'],
  'special-characters': ['#ebf7f0', '#1e9159'],
  'keyboard-symbols': ['#eef2fc', '#3d63c9'],
  'icon-copy-paste': ['#f3eefd', '#7043e8'],
  'cute-symbols': ['#fff0f6', '#e2529b'],
  'symbols-for-bio': ['#fff4ea', '#cf7d24'],
  'symbols-for-usernames': ['#edf2fd', '#3563cc'],
  'weird-symbols': ['#eef7ef', '#3f8f52'],
};

const BRAND = '#6c4cf5';

/* ------------------------------------------------------------------
   Card layouts, expressed as the plain object tree satori consumes.
   ------------------------------------------------------------------ */

function brandRow(size = 30) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', alignItems: 'center', gap: 10 },
      children: [
        {
          type: 'div',
          props: { style: { fontSize: size + 4, color: BRAND }, children: '✦' },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: size, fontWeight: 700, color: '#14142b', letterSpacing: -0.5 },
            children: 'Cool Symbols',
          },
        },
      ],
    },
  };
}

function symbolRow(symbols, { fontSize, gap, tile, radius }) {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', gap, justifyContent: 'center', flexWrap: 'wrap' },
      children: symbols.map((symbol) => ({
        type: 'div',
        props: {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: tile,
            height: tile,
            borderRadius: radius,
            background: '#ffffff',
            border: '1px solid rgba(20,20,43,0.08)',
            fontSize,
            color: '#14142b',
          },
          children: symbol,
        },
      })),
    },
  };
}

function ogCard({ title, subtitle, symbols, footer, tint }) {
  const [background, accent] = tint;
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px',
        background,
        fontFamily: 'DejaVu',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            children: [
              brandRow(30),
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    padding: '8px 18px',
                    borderRadius: 999,
                    background: '#ffffff',
                    color: accent,
                    fontSize: 20,
                    fontWeight: 700,
                  },
                  children: footer,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 16 },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: title.length > 26 ? 62 : 76,
                    fontWeight: 700,
                    color: '#14142b',
                    letterSpacing: -2,
                    lineHeight: 1.1,
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 28, color: '#4c4c66', lineHeight: 1.35 },
                  children: subtitle,
                },
              },
            ],
          },
        },
        symbolRow(symbols.slice(0, 8), { fontSize: 52, gap: 14, tile: 104, radius: 20 }),
      ],
    },
  };
}

function pinCard({ title, subtitle, symbols, footer, tint }) {
  const [background, accent] = tint;
  const rows = [];
  const chosen = symbols.slice(0, 12);
  for (let i = 0; i < chosen.length; i += 3) rows.push(chosen.slice(i, i + 3));

  return {
    type: 'div',
    props: {
      style: {
        width: 1000,
        height: 1500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '72px 64px',
        background,
        fontFamily: 'DejaVu',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 },
            children: [
              brandRow(34),
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: title.length > 22 ? 76 : 92,
                    fontWeight: 700,
                    color: '#14142b',
                    letterSpacing: -2,
                    textAlign: 'center',
                    lineHeight: 1.08,
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 32,
                    color: '#4c4c66',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    maxWidth: 760,
                  },
                  children: subtitle,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 18 },
            children: rows.map((row) =>
              symbolRow(row, { fontSize: 84, gap: 18, tile: 180, radius: 28 })
            ),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              padding: '16px 34px',
              borderRadius: 999,
              background: accent,
              color: '#ffffff',
              fontSize: 30,
              fontWeight: 700,
            },
            children: footer,
          },
        },
      ],
    },
  };
}

/* ------------------------------------------------------------------
   Render
   ------------------------------------------------------------------ */

async function render(tree, width, outFile) {
  const svg = await satori(tree, { width, height: tree.props.style.height, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
  fs.writeFileSync(outFile, png);
  return png.length;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/categories.json'), 'utf8'));

  const pages = catalog.categories.map((category) => ({
    slug: category.slug,
    title: sanitize(category.displayName),
    // The first clause of the description, minus any inline example symbols
    // the font cannot draw.
    subtitle: sanitize(category.description.split(/[.!]/)[0]).slice(0, 104),
    footer: `${category.symbols.length} symbols`,
    symbols: category.symbols.filter(canRender),
    tint: TINTS[category.slug] ?? ['#f2f3f7', BRAND],
  }));

  pages.push({
    slug: 'home',
    title: 'Cool Symbols',
    subtitle: 'Copy and paste text symbols, special characters, and Unicode signs',
    footer: `${catalog.categories.length} collections`,
    symbols: ['✦', '♥', '★', '→', '☾', '❀', '∞', '♪'].filter(canRender),
    tint: ['#f2edfe', BRAND],
  });

  let total = 0;
  for (const page of pages) {
    if (page.symbols.length < 3) {
      console.warn(`  ! ${page.slug}: only ${page.symbols.length} renderable symbols`);
    }
    const ogBytes = await render(ogCard(page), 1200, path.join(OUT_DIR, `${page.slug}.png`));
    const pinBytes = await render(pinCard(page), 1000, path.join(OUT_DIR, `${page.slug}-pin.png`));
    total += ogBytes + pinBytes;
    console.log(
      `  ${page.slug.padEnd(24)} og ${String(Math.round(ogBytes / 1024)).padStart(3)}KB   ` +
        `pin ${String(Math.round(pinBytes / 1024)).padStart(3)}KB   ` +
        `${page.symbols.length} of ${page.symbols.length} symbols renderable`
    );
  }

  console.log(`\n${pages.length * 2} images, ${Math.round(total / 1024)}KB total.`);
}

main().catch((error) => {
  console.error('OG generation failed:', error);
  process.exit(1);
});
