/**
 * One-off content patch: give each intent page its own Unicode territory.
 *
 * Before this ran, the eight intent pages (text-symbols, special-characters,
 * keyboard-symbols, icon-copy-paste, cute-symbols, weird-symbols,
 * symbols-for-bio, symbols-for-usernames) shared 40-60% of their symbols with
 * the thematic pages and carried roughly half the body copy. Google reported
 * them as "Discovered, currently not indexed", which is what near-duplicate
 * thin pages look like from the outside.
 *
 * Each page below is anchored to a distinct Unicode block or a distinct
 * content format, so no two pages are answering the same query with the same
 * characters.
 *
 * Run with: node scripts/patch-intent-pages.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

const s = (str) => str.trim().split(/\s+/);

/* ------------------------------------------------------------------
   PART 1: the four "technical" intent pages
   ------------------------------------------------------------------ */

const PATCHES = {
  /* Letterlike, checkmarks, bullets and technical marks.
     Deliberately avoids the pictographs that now live on icon-copy-paste. */
  'text-symbols': {
    unicodeBlock: 'Dingbats, Miscellaneous Technical, General Punctuation',
    directAnswer:
      'Click any mark below to copy it. These are the general-purpose text symbols that carry meaning in writing: checkmarks, crosses, bullets, dot leaders, and reference marks.',
    symbols: s(`
      ✓ ✔ ✕ ✖ ✗ ✘ ☑ ☒ ☓ ⊘ ⊗ ⊕ ⊖ ⊙
      • ‣ ⁃ ◘ ◦ ‧ ∙ ⦁ ⁌ ⁍
      ※ ⁂ ⁕ ⁘ ⁙ ⁚ ⁛ ⁜ ⁝ ⁞
      ℀ ℁ ℅ ℆ № ℡ ℠ ℮ ℓ ℔
      ⌁ ⌇ ⌸ ⌹ ⌺ ⌻ ⌼ ⍰ ⍯ ⑊ ⌦ ⏥ ⏢
    `),
    intro:
      'A finished task wants a checkmark. A list inside a bio wants a bullet. A break between two thoughts wants something quieter than a horizontal rule. None of those live on a keyboard, and all of them live here. Every mark on this page is a real Unicode character rather than a picture, which means it survives a copy and paste into an editor, a spreadsheet cell, a chat window, or a form field that strips everything else. They also stay monochrome and take the size, weight, and colour of whatever text surrounds them, so a symbol sitting inside a sentence looks like it belongs there.',
    howToUse:
      'Checkmarks and crosses do their best work as status indicators where no checkbox exists: ✓ done, ✗ dropped, ☑ confirmed, in notes, commit messages, and spreadsheet columns. Bullets and dot leaders rebuild list structure in places that discard formatting, which covers most social bios and form fields. For dividing text, ※ and the asterism ⁂ separate blocks more gently than a rule and were designed for exactly that. The letterlike group solves a different problem, giving you abbreviations that cannot be typed directly: № before a figure, ℅ in a postal address, ℠ after a brand, ℓ after a volume. One habit worth keeping is restraint. These marks carry meaning, and a line holding four of them stops communicating and starts decorating.',
    useCases: [
      {
        title: 'Plain-text task lists',
        description:
          'Mark progress in notes, commit messages, and chat updates where checkbox formatting does not exist. ✓ shipped, ✗ blocked, ☑ reviewed reads instantly without a legend.',
      },
      {
        title: 'Spreadsheet status columns',
        description:
          'A single ✓ or ✗ in a cell scans far faster than the words yes and no, sorts correctly, and stays legible when the column is narrow.',
      },
      {
        title: 'Bullets where formatting is stripped',
        description:
          'Social bios, form fields, and email signatures usually discard list markup. Paste • or ‣ at the start of each line and the structure survives.',
      },
      {
        title: 'Section breaks in long text',
        description:
          'The asterism ⁂ and reference mark ※ divide a document without a horizontal rule, which is useful in plain-text posts and code comments.',
      },
      {
        title: 'Abbreviations you cannot type',
        description:
          'Use № before a figure, ℅ in a postal address, ℠ after a brand name, and ℓ after a volume. Each is one character rather than a workaround.',
      },
    ],
    faq: [
      {
        question: 'What is the difference between ✓ and ✔?',
        answer:
          'They are separate Unicode characters. ✓ (U+2713, Check Mark) is the lighter one and matches the weight of ordinary text. ✔ (U+2714, Heavy Check Mark) is bolder and stands out in a list. Some platforms render ✔ as a green emoji rather than a text glyph, so use ✓ when you need the mark to stay the colour of the surrounding text.',
      },
      {
        question: 'Will these symbols break my spreadsheet or CSV file?',
        answer:
          'Not if the file is saved as UTF-8, which is the default in Google Sheets, modern Excel, and every text editor released in the last decade. Problems only appear with legacy encodings such as Windows-1252. If a mark turns into a question mark after export, change the export encoding to UTF-8 rather than replacing the character.',
      },
      {
        question: 'Can screen readers announce these marks?',
        answer:
          'Yes, and this is the main advantage over images. Assistive software reads ✓ as "check mark" and № as "numero". A checkmark supplied as a picture is announced only if someone wrote alternative text for it. Keep meaning in the character itself and accessibility follows.',
      },
    ],
  },

  /* Legal marks, diacritics, fractions and index digits.
     No quotation marks or dashes: those stay on punctuation-symbols. */
  'special-characters': {
    unicodeBlock: 'Latin-1 Supplement, Latin Extended-A, Number Forms, Superscripts and Subscripts',
    directAnswer:
      'Click any character to copy it. These are the special characters that writing and publishing need: legal marks, accented letters, fractions, degrees, and raised or lowered digits.',
    groups: [
      {
        name: 'Legal and reference',
        symbols: s('© ® ™ ℠ ℗ § ¶ † ‡ № ‰ ‱ ′ ″ ‴'),
      },
      {
        name: 'Accented letters',
        symbols: s(`
          á à â ä ã å ā é è ê ë ē í ì î ï ī
          ó ò ô ö õ ø ú ù û ü ū ñ ç š ž ł đ æ œ ß þ ð
        `),
      },
      {
        name: 'Fractions, degrees and units',
        symbols: s('½ ⅓ ⅔ ¼ ¾ ⅕ ⅙ ⅛ ⅜ ⅝ ⅞ ° ℃ ℉ µ Ω Å'),
      },
      {
        name: 'Superscript and subscript',
        symbols: s('⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁿ ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉'),
      },
    ],
    intro:
      'What is the difference between resume and résumé, between Muller and Müller, between 30° and 30º? In each pair the characters look almost identical and mean different things, and the wrong one changes how a line is read, sorted, and indexed. That is the whole problem this page exists to solve. These are not decorative characters. A copyright mark in a footer, an accent in somebody\'s name, a fraction in a recipe, a degree sign in a temperature: each carries a job that no substitute does properly. The reference table below gives the name and code point of every mark, so you can confirm rather than guess.',
    howToUse:
      'Placement matters more here than with decorative symbols. Legal marks sit immediately after the term they protect with no space, so Brand™ and never Brand ™. Accented letters belong wherever the name or loanword actually carries them, and dropping the accent quietly changes the word rather than simplifying it. Single-character fractions like ½ align in a table column where two digits and a slash will not. The trap worth knowing is the degree sign: ° is the correct one, º is the masculine ordinal used in Spanish and Portuguese, and ˚ is a combining ring. All three render nearly the same and behave differently the moment anything tries to search or sort them. Superscript and subscript digits handle exponents and footnote markers wherever rich formatting is unavailable, which includes most plain-text fields.',
    useCases: [
      {
        title: 'Legal footers and trademarks',
        description:
          'Place © before the year and holder, and ™ or ® directly after a mark. Getting the character right matters because these appear in contracts and terms pages that people actually read.',
      },
      {
        title: 'Names spelled correctly',
        description:
          'Accented letters keep names such as Zoë, Renée, and Łukasz intact in databases, email fields, and credits. Stripping the accent quietly changes the name.',
      },
      {
        title: 'Recipes and measurements',
        description:
          'Single-character fractions and the degree sign keep quantities compact: ½ cup, 180 ℃, ¾ teaspoon. In a narrow column this is the difference between one line and two.',
      },
      {
        title: 'Scientific and technical writing',
        description:
          'Superscript digits carry exponents and footnote markers, µ handles micro units, and Ω and Å appear constantly in physics and engineering notes.',
      },
      {
        title: 'Editorial and print typography',
        description:
          'The section sign §, pilcrow ¶, dagger † and double dagger ‡ mark clauses and footnotes in legal documents, academic papers, and long-form articles.',
      },
    ],
    faq: [
      {
        question: 'Why does the degree sign look wrong in my document?',
        answer:
          'There are three lookalikes and only one is correct. ° (U+00B0, Degree Sign) is the right character for temperature and angles. º (U+00BA) is the masculine ordinal indicator used in Spanish and Portuguese. ˚ (U+02DA) is a combining ring diacritic. They render similarly at small sizes but behave differently in search, sorting, and text-to-speech.',
      },
      {
        question: 'Do accented letters break URLs or email addresses?',
        answer:
          'Email addresses and domains can use them through internationalisation standards, but support is inconsistent and many providers still reject them. For display text, always use the correct accented letter. For technical identifiers such as usernames, file names, and slugs, use the unaccented form to avoid trouble.',
      },
      {
        question: 'Should I type ™ or the letters TM?',
        answer:
          'Use the single character ™ (U+2122). It is one code point rather than two letters, which means it will not be broken across a line, will not be mistaken for part of the preceding word by a search index, and is announced correctly as "trade mark" by screen readers.',
      },
    ],
    referenceTitle: 'Special character reference',
    referenceRows: [
      { symbol: '©', name: 'Copyright Sign', code: 'U+00A9', use: 'Ownership of a published work' },
      { symbol: '®', name: 'Registered Sign', code: 'U+00AE', use: 'Registered trademark' },
      { symbol: '™', name: 'Trade Mark Sign', code: 'U+2122', use: 'Unregistered trademark' },
      { symbol: '℠', name: 'Service Mark', code: 'U+2120', use: 'Mark covering a service' },
      { symbol: '§', name: 'Section Sign', code: 'U+00A7', use: 'Numbered clause in legal text' },
      { symbol: '¶', name: 'Pilcrow Sign', code: 'U+00B6', use: 'Paragraph mark in print' },
      { symbol: '†', name: 'Dagger', code: 'U+2020', use: 'First footnote in a series' },
      { symbol: '‡', name: 'Double Dagger', code: 'U+2021', use: 'Second footnote in a series' },
      { symbol: '№', name: 'Numero Sign', code: 'U+2116', use: 'Precedes a number' },
      { symbol: '‰', name: 'Per Mille Sign', code: 'U+2030', use: 'Parts per thousand' },
      { symbol: '°', name: 'Degree Sign', code: 'U+00B0', use: 'Temperature and angles' },
      { symbol: '′', name: 'Prime', code: 'U+2032', use: 'Feet, minutes, arcminutes' },
      { symbol: '″', name: 'Double Prime', code: 'U+2033', use: 'Inches, seconds, arcseconds' },
      { symbol: 'µ', name: 'Micro Sign', code: 'U+00B5', use: 'Micro prefix in units' },
      { symbol: '½', name: 'Vulgar Fraction One Half', code: 'U+00BD', use: 'Compact fraction' },
      { symbol: 'ß', name: 'Latin Small Letter Sharp S', code: 'U+00DF', use: 'German eszett' },
    ],
  },

  /* Modifier, navigation, media and power keys. Plain directional arrows stay
     on arrow-symbols so the two pages do not answer the same query. */
  'keyboard-symbols': {
    unicodeBlock: 'Miscellaneous Technical (U+2318–U+23FA)',
    directAnswer:
      'Click any key symbol to copy it. These are the characters that represent physical keys: modifiers, editing keys, navigation keys, and media controls.',
    groups: [
      {
        name: 'Modifier keys',
        symbols: s('⌘ ⌥ ⌃ ⇧ ⇪ ⎇ ❖ ⌤ ⏎ ↵ ⎆ ␣ ⌅'),
      },
      {
        name: 'Editing and navigation',
        symbols: s('⌫ ⌦ ⎋ ⇥ ⇤ ⇞ ⇟ ⇱ ⇲ ⌂ ⎀ ⌧ ⇭ ⌸'),
      },
      {
        name: 'Media and power',
        symbols: s('⏻ ⏼ ⏽ ⏾ ⏯ ⏸ ⏹ ⏺ ⏭ ⏮ ⏩ ⏪ ⏫ ⏬ ⏏'),
      },
    ],
    intro:
      '"Press Command Shift four" takes twenty-six characters. "⌘⇧4" takes three and is understood faster by anyone who has touched a Mac. That gap is why this block exists at all: Unicode added these glyphs so that manuals, help articles, and interface labels could describe a shortcut without resorting to a screenshot. They behave like text, which is the point. They scale with the font, sit inside a table cell, survive translation, and can be searched, none of which is true of an image of a keyboard.',
    howToUse:
      'Write modifiers in the order they are pressed and leave no spaces between them: ⌘⇧P, ⌥⌫, ⌃⇥. On Apple platforms that matches what the system prints in its own menus, so a reader can compare your documentation against the software directly. Cross-platform writing needs more care. ⌘ and ⌥ mean nothing on Windows or Linux, so spell out Ctrl and Alt there, or use ❖ for the Windows key and accept that it is a convention rather than a standard. Beyond hardware, the media set doubles as state notation: ⏺ for recording, ⏸ for paused, ⏹ for stopped, ⏏ for a clean exit. In a log file or a dashboard built from plain text, one of these replaces a coloured badge you cannot render anyway.',
    useCases: [
      {
        title: 'Software documentation',
        description:
          'Describe shortcuts inline without screenshots. A table of ⌘K, ⌘⇧P, and ⌥⌫ stays readable, searchable, and translatable in a way an image never is.',
      },
      {
        title: 'Interface labels and tooltips',
        description:
          'Show the shortcut next to a menu item or button. The symbols match what the operating system displays, so users recognise them without a legend.',
      },
      {
        title: 'READMEs and technical notes',
        description:
          'Markdown has no shortcut formatting. Pasting the key glyphs keeps instructions compact in a file that has to render everywhere from GitHub to a terminal.',
      },
      {
        title: 'Support replies and tutorials',
        description:
          'Telling someone to press ⌘⌥I is shorter and less ambiguous than naming three keys in prose, especially when the reply is going into a chat window.',
      },
      {
        title: 'Status markers in logs and dashboards',
        description:
          'The media set doubles as state: ⏺ recording, ⏸ paused, ⏹ stopped, ⏏ ejected. One character replaces a coloured badge in plain-text output.',
      },
    ],
    faq: [
      {
        question: 'Why does ⌘ show as a box on Windows?',
        answer:
          'The Place of Interest Sign ⌘ (U+2318) needs a font that includes the Miscellaneous Technical block. Apple platforms ship one by default because the symbol is part of the interface. On Windows and Android coverage depends on the installed fonts, and older systems show a fallback box. If your audience is mixed, name the key in text as well the first time you use it.',
      },
      {
        question: 'What is the correct symbol for the Windows key?',
        answer:
          'There is no official one. Unicode has no Windows logo character because logos are trademarks and are excluded on principle. Documentation usually falls back on ❖ (U+2756, Black Diamond Minus White X) or simply writes Win. The same applies to the Linux and Chrome OS launcher keys.',
      },
      {
        question: 'Should I use ⏎ or ↵ for the Enter key?',
        answer:
          'Both are widely understood. ⏎ (U+23CE, Return Symbol) is the one printed on Apple keyboards and is the safer choice in interface documentation. ↵ (U+21B5, Downwards Arrow With Corner Leftwards) is more common in typography and in diagrams showing where a line breaks. Pick one and use it consistently throughout a document.',
      },
    ],
    referenceTitle: 'Key symbol reference',
    referenceRows: [
      { symbol: '⌘', name: 'Place of Interest Sign', code: 'U+2318', use: 'Command key on Apple keyboards' },
      { symbol: '⌥', name: 'Option Key', code: 'U+2325', use: 'Option or Alt on Apple keyboards' },
      { symbol: '⌃', name: 'Up Arrowhead', code: 'U+2303', use: 'Control key' },
      { symbol: '⇧', name: 'Upwards White Arrow', code: 'U+21E7', use: 'Shift key' },
      { symbol: '⇪', name: 'Upwards White Arrow From Bar', code: 'U+21EA', use: 'Caps Lock' },
      { symbol: '⌫', name: 'Erase to the Left', code: 'U+232B', use: 'Backspace' },
      { symbol: '⌦', name: 'Erase to the Right', code: 'U+2326', use: 'Forward delete' },
      { symbol: '⎋', name: 'Broken Circle With Northwest Arrow', code: 'U+238B', use: 'Escape' },
      { symbol: '⇥', name: 'Rightwards Arrow to Bar', code: 'U+21E5', use: 'Tab forward' },
      { symbol: '⏎', name: 'Return Symbol', code: 'U+23CE', use: 'Return or Enter' },
      { symbol: '␣', name: 'Open Box', code: 'U+2423', use: 'Space bar' },
      { symbol: '⏻', name: 'Power Symbol', code: 'U+23FB', use: 'Power on and off' },
      { symbol: '⏏', name: 'Eject Symbol', code: 'U+23CF', use: 'Eject media' },
    ],
  },

  /* Pictographic icons for objects and tools. Distinct from text-symbols,
     which now holds abstract marks rather than pictures. */
  'icon-copy-paste': {
    unicodeBlock: 'Dingbats and Miscellaneous Symbols (U+2600–U+27BF)',
    directAnswer:
      'Click any icon to copy it. These are small pictographic characters that stand in for objects and actions: mail, phone, tools, timers, warnings, and travel.',
    symbols: s(`
      ✉ ✆ ☎ ✂ ✁ ✃ ✄ ✇ ✈ ⌨ ⎙ ⌖
      ⌛ ⌚ ⏳ ⏰ ⏱ ⏲
      ⚒ ⚓ ⚔ ⚕ ⚖ ⚗ ⚙ ⚑ ⚐ ⛏ ⛑ ⛓
      ⛔ ⚠ ☢ ☣ ♻ ⚛ ⚜ ⚡ ☠ ⌬ ⏻
    `),
    intro:
      'Most places you want a small picture will not let you upload one. Social bios, form fields, spreadsheet cells, terminal output, commit messages, chat windows: all of them accept text and nothing else. The characters gathered here are pictures that qualify as text. A ✉ opening a contact line, a ⚠ in front of a caution, a ⌛ beside something still running, each is one code point with no image file, no request to load, and no alternative text to forget. On most platforms they render in whatever colour the surrounding text uses, so a line reads as considered rather than stickered.',
    howToUse:
      'The useful rule is one icon per line, at the start. Contact details scan fastest when each is led by its own mark, so ✉ for email, ☎ for phone, ✈ for location, and a reader finds the right row without reading any of them. Severity deserves the same discipline: keep ⚠ for a caution and ⛔ for something genuinely not allowed, because using them interchangeably drains both. Timers work as status, with ⌛ for waiting and ⏰ for a deadline that has teeth. The tools group labels a subject in a single character, which earns its place in directories and tag lists where columns are narrow. Where this goes wrong is density. A paragraph carrying five icons has stopped signposting and started shouting.',
    useCases: [
      {
        title: 'Contact lines in bios and signatures',
        description:
          'Lead each detail with its icon: ✉ for email, ☎ for phone, ✈ for location. The eye finds the right line without reading any of them.',
      },
      {
        title: 'Warnings in plain-text output',
        description:
          'Terminal logs, commit messages, and README files have no colour or badges. ⚠ and ⛔ at the start of a line carry the severity by themselves.',
      },
      {
        title: 'Status in project trackers',
        description:
          'Prefix a task with ⌛ for in progress or ⏰ for due today. It sorts as text and stays visible when the column is too narrow for words.',
      },
      {
        title: 'Category tags and directories',
        description:
          'The tools group labels a topic in one character: ⚕ health, ⚖ legal, ⚙ engineering, ⚓ marine. Useful in listings where space is tight.',
      },
      {
        title: 'Safety and handling notes',
        description:
          '☢, ☣, and ♻ are internationally recognised and communicate across languages, which is why they appear on packaging and datasheets.',
      },
    ],
    faq: [
      {
        question: 'Why do some icons appear in colour and others do not?',
        answer:
          'Characters that predate emoji, such as ✉ and ⚠, were designed as text and normally render monochrome. Some platforms upgrade a few of them to colour emoji anyway, which is why ⚠ often appears yellow on a phone but black on a desktop. Appending the variation selector U+FE0E requests the text form and U+FE0F requests the emoji form, though not every platform honours the request.',
      },
      {
        question: 'Are these better than emoji for interface work?',
        answer:
          'Usually yes. They inherit the text colour, so they follow a dark theme automatically, and they keep their weight next to surrounding letters instead of sitting as a coloured sticker. Emoji are better when you want the picture itself to draw attention.',
      },
      {
        question: 'Do icon characters hurt accessibility?',
        answer:
          'Only when they carry meaning that appears nowhere else. A screen reader announces ⚠ as "warning sign", which is helpful, but a line consisting of five decorative icons becomes five announcements of nothing useful. Keep icons alongside words rather than instead of them, and never encode critical information in an icon alone.',
      },
    ],
  },
};

/* ------------------------------------------------------------------
   Apply
   ------------------------------------------------------------------ */

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
let touched = 0;

for (const category of catalog.categories) {
  const patch = PATCHES[category.slug];
  if (!patch) continue;
  Object.assign(category, patch);
  // A page defined by groups derives its flat list from them, so the two can
  // never disagree.
  if (patch.groups) {
    category.symbols = patch.groups.flatMap((group) => group.symbols);
  }
  touched += 1;
  console.log(
    `  patched ${category.slug.padEnd(22)} ${String(category.symbols.length).padStart(3)} symbols`
  );
}

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log(`\n${touched} categories updated.`);
