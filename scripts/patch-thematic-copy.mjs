/**
 * Fourth pass: bring the copy on four thematic pages back in line with the
 * symbols they now hold.
 *
 * Moving the dingbat asterisks to stars, the florettes to flowers, and the
 * legal marks to special-characters left these pages describing characters
 * that are no longer on them. Each intro, how-to, and FAQ below is rewritten
 * around the current set, and deliberately varied in structure so the pages do
 * not read as the same paragraph with the nouns swapped.
 *
 * Run with: node scripts/patch-thematic-copy.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

const PATCHES = {
  'star-symbols': {
    intro:
      'Count the points. That is the fastest way to navigate this collection, because Unicode has stars at five, six, eight, twelve, and sixteen points, and each was added for a different reason. ★ and ☆ are the five-pointed pair used for ratings everywhere. The asterisk family, ✳ ✴ ❈ ❉, came from typesetting and marks footnotes and separations. The heavier bursts ✹ ✺ ❊ ❋ started as printers\' ornaments. Then there is the emoji layer, ✨ 🌟 💫, which renders in colour and behaves quite differently in a line of text.',
    howToUse:
      'Ratings are the obvious use and worth doing properly: fill from the left and pad with outlines, so ★★★★☆ rather than a bare number. For text accents, the smaller marks earn their place because they do not shout. ⋆ and ⭒ sit inside a sentence without pulling the eye off the words, while ✨ and 🌟 render as coloured emoji and take over any line they land in. The asterisk group behaves like punctuation rather than decoration: ✳ works as a footnote marker where a superscript number is unavailable, and ❉ separates blocks of text the way a printer would have used a fleuron. One thing to check before committing: colour emoji stars ignore your text colour entirely, so they will stay yellow on a dark background where ★ would have turned white.',
    faq: [
      {
        question: 'Why does ★ change colour but ⭐ never does?',
        answer:
          '★ (U+2605) is a text character and inherits whatever colour and weight the surrounding text has, so it turns white in dark mode along with everything else. ⭐ (U+2B50) is an emoji, drawn by the platform as a fixed image. It stays the same yellow star on every background. Pick the text star when the symbol should belong to the sentence, and the emoji when you want it to stand apart from it.',
      },
      {
        question: 'Which star should I use for a rating widget?',
        answer:
          'Use ★ and ☆ together. They are the same width and were designed as a filled and hollow pair, so a row of them aligns cleanly and reads instantly. Mixing in asterisk forms such as ✦ or ✹ breaks the alignment because those glyphs have different widths and optical weights. For half stars there is no reliable single character, so most interfaces fall back on an image or a clipped element.',
      },
      {
        question: 'Do these work in a Twitch or YouTube channel name?',
        answer:
          'Text stars generally do, and they are common in streaming display names. Emoji stars are accepted on most platforms too but occasionally get stripped from search indexes, which means a channel named with an emoji may be harder to find by typing. Keeping the searchable part of the name in plain letters and using the star as decoration around it avoids that problem.',
      },
    ],
  },

  'flower-symbols': {
    intro:
      'There are two entirely separate things called flower symbols and confusing them causes most of the disappointment. The florettes, ❀ ✿ ❁ ❃ ✾ ✽, come from the Dingbats block and were drawn as printers\' ornaments in the 1970s. They are abstract rosettes, they render in your text colour, and they scale with the font. The emoji, 🌸 🌺 🌻 🌷, are specific real flowers drawn by whoever made your operating system, and a cherry blossom on an iPhone is a noticeably different picture from a cherry blossom on a Samsung. Both are on this page, and which one you want depends entirely on whether the flower should sit inside your text or stand out from it.',
    howToUse:
      'For anything typographic, reach for a florette. ❀ opening and closing a heading gives you a hand-set look at zero cost, and ✿ as a bullet reads far softer than a plain dot in a list of gentle things. They also work as spacers between words in a bio, where the surrounding text colour keeps everything visually joined. Emoji flowers ask for restraint: one per caption is a warm accent, four is a garden centre. Seasonal use is where they genuinely earn their place, since 🌸 says spring and 🍂 says autumn faster than any adjective. Worth knowing about ❦ and ❧, the two leaf ornaments in the set. They are aldus leaves, a printer\'s device for marking a break in a text, and they still read that way to anyone who notices them.',
    faq: [
      {
        question: 'Why does ❀ look like a flower on one site and a blob on another?',
        answer:
          'Because it is drawn by the font, not by Unicode. The standard defines ❀ as a heavy teardrop-spoked pinwheel florette and leaves the drawing to type designers, and they disagree considerably. Helvetica renders it tight and geometric, Georgia loosens it into something closer to a rose. This is normal for the Dingbats block and is the main reason florettes look hand-picked rather than mass-produced.',
      },
      {
        question: 'Which flowers are safest across old phones?',
        answer:
          '❀ ✿ ❁ have been in Unicode since 1993 and are covered by essentially every font shipped since. Among the emoji, 🌸 🌹 🌻 date from the original 2010 emoji set and are equally safe. The riskier ones are recent additions such as 🪻 and 🪷, which arrived in 2021 and 2022 and will show as boxes on a phone that has not been updated in a few years.',
      },
      {
        question: 'Can I combine florettes with emoji flowers?',
        answer:
          'You can, but they rarely sit well together. A florette is monochrome and takes its size from the text, while an emoji is full colour and usually renders slightly larger and lower on the line. Putting them adjacent makes the mismatch obvious. Choosing one register and staying in it produces a much cleaner result than mixing.',
      },
    ],
  },

  'punctuation-symbols': {
    intro:
      'Every quotation mark on this page exists because somewhere a language needed it. English settled on curled doubles, German inverted the opening one and put it on the baseline, French uses guillemets pointing outward with spaces inside, and Japanese built corner brackets that suit vertical writing. The dashes have the same story: a hyphen joins, an en dash spans a range, an em dash interrupts a sentence, and typing one where another belongs is the most common way to make good writing look careless. This page collects the quotation marks, dashes, and bracket forms that carry those distinctions.',
    howToUse:
      'Match the quotation marks to the language, not to your keyboard. English takes “ ” and ‘ ’, German takes „ “, French takes « », and Japanese and Chinese take 「 」. Word processors substitute these automatically, which is why text pasted out of a plain editor suddenly looks wrong. Dashes reward a moment of thought: the en dash – takes ranges such as 2019–2024, and the em dash — interrupts, though many editors now set it with spaces either side. Corner brackets ⌜ ⌟ and their filled counterparts are useful well beyond Japanese typesetting, since they frame a phrase in a bio or a heading without the closed feeling of parentheses. Two marks here are worth knowing: the interrobang ‽ combines a question and an exclamation into one glyph, and the irony mark ⸮ is a reversed question mark proposed several times across four centuries and never quite adopted.',
    faq: [
      {
        question: 'Why do my quotation marks curl the wrong way?',
        answer:
          'Curly quotes are directional characters, and software guesses the direction from what precedes them. An opening quote after a space becomes “ and a closing quote after a letter becomes ”. The guess fails on an elided word such as ’tis or a decade written as ’90s, where the mark follows a space but should close. Pasting the correct character directly is the reliable fix.',
      },
      {
        question: 'When should I use an en dash instead of a hyphen?',
        answer:
          'A hyphen joins words into one idea, as in well-known or twenty-one. An en dash spans a range or a relationship between two separate things: pages 5–10, Monday–Friday, the London–Paris route. If you could replace the mark with the word "to" or "versus" and the sentence still works, an en dash is correct.',
      },
      {
        question: 'What is the interrobang for?',
        answer:
          'It merges a question mark and an exclamation mark into one character for a sentence that asks and exclaims at once, as in "you did what‽". An American advertising executive proposed it in 1962 and it briefly appeared on typewriters before fading. It has been in Unicode since the start and renders almost everywhere, which makes it usable, though most readers will find it unfamiliar enough to notice.',
      },
    ],
  },

  'aesthetic-symbols': {
    intro:
      'The look these characters produce did not come from a design brief. It grew out of Tumblr around 2014, moved to Twitter and Amino, and then TikTok turned it into something close to a visual dialect that a whole generation reads fluently. What it needs are marks that are very small, slightly irregular, and clearly not part of the alphabet. Unicode happens to be full of those, scattered across blocks that were built for entirely different purposes: Thai and Tibetan diacritics, Egyptian hieroglyphs, mathematical spacing marks. Nobody designing them expected this. That is the collection here, gathered from wherever it happens to live.',
    howToUse:
      'Framing is the core move. Put a small mark before and after a word and mirror the order, so ‧₊˚ opens and ˚₊‧ closes, and the name in between reads as deliberately placed. Density is what separates a considered profile from a cluttered one, and the working rule is that decoration should never outweigh the words it surrounds. Combining marks behave differently from the rest and deserve care: ˚ and ࿔ attach to whatever character precedes them rather than standing alone, so they can shift position unexpectedly and take extra presses of backspace to remove. Hieroglyphs such as 𓆸 and 𓂃 are the least supported characters on this page, and there is no substitute for testing them on a phone before saving a bio, because a set of empty rectangles is a worse outcome than plain text would have been.',
    faq: [
      {
        question: 'Why do these look different on my friend\'s phone?',
        answer:
          'Every device draws these marks from its own fonts, and the small decorative ones vary more than ordinary letters do. Spacing shifts as well, so a layout aligned perfectly on an iPhone can sit slightly off on Android or a desktop browser. Nothing is broken. Build lines that survive a little movement rather than ones that depend on exact positions.',
      },
      {
        question: 'Where does the ⋆｡˚ style actually come from?',
        answer:
          'It assembled itself across Tumblr, Amino, and Twitter over roughly a decade, then spread rapidly through TikTok after 2020. There is no origin account and no rulebook. The characters were borrowed from wherever something the right size existed, which is why a single decorated line often mixes Thai, Tibetan, Japanese, and mathematical marks without anyone intending it to.',
      },
      {
        question: 'Is it disrespectful to use hieroglyphs decoratively?',
        answer:
          'Egyptian hieroglyphs are not a living sacred script, and using 𓆸 as an ornament is not comparable to appropriating a religious symbol still in active use. The individual signs did carry meaning, so an academic or heritage context calls for accuracy. For a bio, no reasonable person objects. Marks with current religious weight are a different matter and deserve more thought.',
      },
    ],
  },
};

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

for (const category of catalog.categories) {
  const patch = PATCHES[category.slug];
  if (!patch) continue;
  Object.assign(category, patch);
  console.log(`  rewrote copy for ${category.slug}`);
}

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log('\nDone.');
