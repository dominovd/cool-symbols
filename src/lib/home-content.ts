/**
 * Copy that appears on the home page only.
 *
 * Kept out of the catalogue because these are editorial blocks, not symbol
 * data. The FAQ is used twice: once as visible markup and once as FAQPage
 * structured data, so the two can never drift apart.
 */

export const INTENT_PAGES = [
  {
    slug: 'text-symbols',
    icon: '◍',
    heading: 'Copy and Paste Text Symbols',
    blurb: 'General-purpose Unicode symbols for messages, bios, captions, comments, and documents.',
  },
  {
    slug: 'special-characters',
    icon: '§',
    heading: 'Special Characters Copy Paste',
    blurb:
      'Section marks, quotes, dashes, math signs, currency signs, bullets, and hard-to-type marks.',
  },
  {
    slug: 'keyboard-symbols',
    icon: '⌘',
    heading: 'Keyboard Symbols Copy Paste',
    blurb:
      'Shortcut signs, arrows, command symbols, return keys, media keys, and technical characters.',
  },
  {
    slug: 'icon-copy-paste',
    icon: '◈',
    heading: 'Icon Copy Paste',
    blurb: 'Small text icons for labels, callouts, lists, profile lines, and navigation hints.',
  },
  {
    slug: 'cute-symbols',
    icon: '♡',
    heading: 'Cute Symbols Copy Paste',
    blurb: 'Pretty hearts, sparkles, flowers, moons, brackets, and kawaii text decorations.',
  },
  {
    slug: 'symbols-for-bio',
    icon: '❋',
    heading: 'Symbols for Instagram Bio',
    blurb: 'Bio-ready dividers, arrows, hearts, stars, and aesthetic accents for social profiles.',
  },
  {
    slug: 'symbols-for-usernames',
    icon: '✦',
    heading: 'Username Symbols',
    blurb: 'Symbols that work well around names, nicknames, gamer tags, and display names.',
  },
  {
    slug: 'weird-symbols',
    icon: '⁂',
    heading: 'Weird Symbols',
    blurb: 'Unusual Unicode signs, spirals, marks, and eye-catching characters.',
  },
] as const;

/**
 * The "How it works" grid. Bodies contain inline links, so they are rendered
 * with set:html and must stay trusted, author-written strings.
 */
export const HOW_IT_WORKS = [
  {
    icon: '◍',
    tint: 'var(--tint-purple)',
    title: 'Cool symbols are plain Unicode text',
    body: 'Every item in this library is a real <strong>Unicode text symbol</strong>, not an image. Copy a heart, star, arrow, special character, keyboard sign, cute icon, or aesthetic emoji and paste it into almost any modern app.',
  },
  {
    icon: '⧉',
    tint: 'var(--tint-blue)',
    title: 'Built for copy-paste intent',
    body: 'Choose a category, click a symbol, and paste it wherever you need it. This page is built around the core <strong>copy and paste symbols</strong> workflow: no downloads, no image files, no account, just Unicode characters ready for <strong>Instagram bios, TikTok captions, Discord statuses, usernames, comments, documents, and messages</strong>.',
  },
  {
    icon: '⌨',
    tint: 'var(--tint-orange)',
    title: 'Text symbols, special characters, and keyboard symbols',
    body: 'Use <a class="prose-link" href="/text-symbols">text symbols</a> for decoration, <a class="prose-link" href="/special-characters">special characters</a> for writing and formatting, and <a class="prose-link" href="/keyboard-symbols">keyboard symbols</a> when the character you need is hard to type. The same library also covers <a class="prose-link" href="/icon-copy-paste">icon copy paste</a> searches, <a class="prose-link" href="/cute-symbols">cute symbols</a>, <a class="prose-link" href="/symbols-for-bio">symbols for bios</a>, and <a class="prose-link" href="/symbols-for-usernames">username symbols</a>.',
  },
  {
    icon: '✎',
    tint: 'var(--tint-pink)',
    title: 'Fancy text and AI tools are supporting utilities',
    body: 'The core of Cool Symbols is the symbol copy-paste library. The fancy text generator, aesthetic dividers, and AI symbol tools are included as extra utilities when you want styled words, usernames, bios, or generated symbol art.',
  },
  {
    icon: 'ⓘ',
    tint: 'var(--tint-green)',
    title: 'Compatibility notes',
    body: 'Most popular symbols render everywhere. Very new, rare, or decorative Unicode characters can appear as boxes on older devices or apps with limited fonts. If compatibility matters, use common characters like ♥, ★, →, ✦, ♡, and ✓.',
  },
] as const;

export const HOME_FAQ = [
  {
    question: 'What are cool symbols?',
    answer:
      'Cool symbols are Unicode text characters such as hearts, stars, arrows, special signs, keyboard symbols, aesthetic icons, and emoji-style decorations that you can copy and paste into bios, captions, usernames, messages, and documents.',
  },
  {
    question: 'How do I copy and paste symbols?',
    answer:
      'Click any symbol on the page to copy it to your clipboard, then paste it into Instagram, TikTok, Discord, messages, usernames, bios, documents, or any app that accepts Unicode text.',
  },
  {
    question: 'Can I use these symbols on Instagram, TikTok, Discord, and other platforms?',
    answer:
      'Yes. Everything on Cool Symbols is plain Unicode text, so it works in any app that accepts Unicode, which is essentially every modern social platform, messenger, and notes app. Just click any symbol or generated text to copy it, then paste wherever you need.',
  },
  {
    question: 'Are these symbols text or images?',
    answer:
      'They are plain Unicode text characters, not image files. That means they can be selected, copied, pasted, searched, resized with text, and styled by the app or website where you use them.',
  },
  {
    question: 'Why do some symbols show as boxes or question marks on my device?',
    answer:
      "Boxes and question marks appear when your device's fonts don't include a particular Unicode character. Newer phones and computers cover most symbols. Older devices may miss the more exotic ones. The symbol will render correctly on any device that has the right fonts installed.",
  },
  {
    question: 'Can I use cool symbols in usernames and bios?',
    answer:
      'Most platforms allow Unicode symbols in display names, bios, captions, statuses, and comments. Some platforms restrict actual account handles, so test the username field before saving.',
  },
  {
    question: 'Are the fancy text and AI tools free too?',
    answer:
      'Yes. The symbol library, fancy text generator, and aesthetic dividers are free and unlimited. AI tools are free with a small daily generation limit.',
  },
] as const;
