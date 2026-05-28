#!/usr/bin/env node
/**
 * build.js — programmatic SEO page generator.
 *
 * Reads catalog/categories.json + templates/category.html and produces
 * one HTML file per category at the repo root (e.g., heart-symbols.html).
 *
 * Run with: node build.js
 * Re-run whenever the catalog changes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CATALOG_PATH = path.join(ROOT, 'catalog', 'categories.json');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'category.html');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSymbolsGrid(symbols) {
  return symbols
    .map(s => `      <div class="sym">${escapeHtml(s)}</div>`)
    .join('\n');
}

function renderUseCases(useCases) {
  return useCases
    .map(uc => `      <div class="use-case">
        <h4>${escapeHtml(uc.title)}</h4>
        <p>${escapeHtml(uc.description)}</p>
      </div>`)
    .join('\n');
}

function renderFaq(faq) {
  return faq
    .map(item => `      <details class="faq-item">
        <summary>${escapeHtml(item.question)}</summary>
        <div class="faq-answer">${escapeHtml(item.answer)}</div>
      </details>`)
    .join('\n');
}

function renderRelated(related) {
  return related
    .map(r => `      <a class="related-card" href="/${r.slug}">
        <div class="emoji">${escapeHtml(r.emoji)}</div>
        <div class="name">${escapeHtml(r.name)}</div>
      </a>`)
    .join('\n');
}

function buildItemListJsonLd(cat) {
  // ItemList limited to first 30 symbols to keep schema readable
  const items = cat.symbols.slice(0, 30).map((sym, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: sym,
  }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.h1,
    description: cat.description,
    url: `https://cool-symbols.net/${cat.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: cat.displayName,
      numberOfItems: cat.symbols.length,
      itemListElement: items,
    },
  }, null, 2);
}

function buildFaqJsonLd(faq) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }, null, 2);
}

function render(template, cat) {
  const lower = cat.displayName.toLowerCase();
  return template
    .replace(/\{\{TITLE\}\}/g, escapeHtml(cat.title))
    .replace(/\{\{DESCRIPTION\}\}/g, escapeHtml(cat.description))
    .replace(/\{\{SLUG\}\}/g, cat.slug)
    .replace(/\{\{H1\}\}/g, escapeHtml(cat.h1))
    .replace(/\{\{DISPLAY_NAME\}\}/g, escapeHtml(cat.displayName))
    .replace(/\{\{DISPLAY_NAME_LOWER\}\}/g, escapeHtml(lower))
    .replace(/\{\{INTRO\}\}/g, escapeHtml(cat.intro))
    .replace(/\{\{SYMBOL_COUNT\}\}/g, String(cat.symbols.length))
    .replace(/\{\{UNICODE_BLOCK\}\}/g, escapeHtml(cat.unicodeBlock || 'Unicode characters'))
    .replace(/\{\{SYMBOLS_GRID_HTML\}\}/g, renderSymbolsGrid(cat.symbols))
    .replace(/\{\{HOW_TO_USE\}\}/g, escapeHtml(cat.howToUse))
    .replace(/\{\{USE_CASES_HTML\}\}/g, renderUseCases(cat.useCases))
    .replace(/\{\{FAQ_HTML\}\}/g, renderFaq(cat.faq))
    .replace(/\{\{RELATED_HTML\}\}/g, renderRelated(cat.related))
    .replace(/\{\{ITEMLIST_JSON_LD\}\}/g, buildItemListJsonLd(cat))
    .replace(/\{\{FAQ_JSON_LD\}\}/g, buildFaqJsonLd(cat.faq));
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  console.log(`Building ${catalog.categories.length} category pages…`);

  const built = [];
  for (const cat of catalog.categories) {
    const html = render(template, cat);
    const outPath = path.join(ROOT, `${cat.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    built.push({ slug: cat.slug, symbols: cat.symbols.length, bytes: html.length });
    console.log(`  ✓ ${cat.slug}.html  (${cat.symbols.length} symbols, ${Math.round(html.length / 1024)}KB)`);
  }

  console.log(`\nDone. Generated ${built.length} files.`);
  return built;
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Build failed:', err.message);
    process.exit(1);
  }
}

module.exports = { render, main };
