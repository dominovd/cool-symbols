/**
 * Second half of the intent-page separation.
 *
 * cute-symbols and weird-symbols are separated by Unicode territory: kaomoji
 * parts and soft brackets on one, runic and alchemical blocks on the other.
 *
 * symbols-for-bio and symbols-for-usernames are separated by format instead.
 * Both queries want finished lines rather than individual glyphs, so those two
 * pages lead with combinations and name patterns and keep only a small set of
 * the connector characters used to build them.
 *
 * Run with: node scripts/patch-intent-pages-2.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CATALOG = path.join(ROOT, 'src/data/categories.json');

const s = (str) => str.trim().split(/\s+/);

const PATCHES = {
  /* Kaomoji components and soft brackets. No hearts, flowers or celestial
     marks: those belong to their own pages. */
  'cute-symbols': {
    unicodeBlock: 'Kana, Bopomofo, Canadian Syllabics and bracket forms used in kaomoji',
    directAnswer:
      'Click any face or bracket to copy it. This page collects the parts kaomoji are built from, plus complete faces you can paste as they are.',
    groups: [
      {
        name: 'Complete faces',
        symbols: s(`
          (˶ᵔ ᵕ ᵔ˶) (๑>◡<๑) ʕ•ᴥ•ʔ (｡♥‿♥｡) (◕ᴗ◕✿) (づ｡◕‿‿◕｡)づ
          ٩(◕‿◕)۶ (｡•́‿•̀｡) (˘ω˘) (⁀ᗢ⁀) (ᵔᴥᵔ) ʕ ᵔᴥᵔ ʔ
          ₍ᐢ.  ̫.ᐢ₎ ᓚᘏᗢ /ᐠ - ˕ -マ ฅ^•ﻌ•^ฅ
        `),
      },
      {
        name: 'Eyes and mouths',
        symbols: s('ᵔ ᴗ ◡ ‿ ﹏ ω ᴥ ˕ ᗜ ヮ ᵕ ³ ε ˘ ⌣ ㅅ ᯅ'),
      },
      {
        name: 'Soft brackets and paws',
        symbols: s('꒰ ꒱ ໒ ১ ᐢ ᐡ ୨ ୧ ⑅ ࿔ ʚ ɞ ᨒ ᥲ ᰔ ෆ'),
      },
    ],
    intro:
      'Nobody types ʕ•ᴥ•ʔ from memory. Kaomoji are assembled, not written, and the parts come from scripts that were never meant for faces: a Bopomofo letter becomes a mouth, a Canadian Syllabics character becomes an ear, a Japanese bracket becomes a pair of paws. That is the actual answer to why these look different from Western emoticons. They read horizontally with no head-tilt required, they carry far more expression, and they are plain text, so they land intact in a username field that rejects images. The page is split into finished faces you can take as they are and the individual parts, for when you want to build something nobody else has.',
    howToUse:
      'Take a complete face first and see how it sits in the app you are targeting, because rendering varies more here than anywhere else on this site. Once a face works, the parts become useful: swap the eyes to change the mood while keeping the frame, so (˶ᵔ ᵕ ᵔ˶) turns sleepy with ˘ and surprised with ᯅ. Paws and soft brackets go around a word rather than a face, which is where ꒰ hello ꒱ and ໒ name ১ come from. Two practical cautions. Combining marks stack onto the character before them, so deleting a face often takes several presses of backspace. And a face made of eight code points still counts as eight characters against a bio limit, which is why the shorter ones survive on platforms with tight caps.',
    useCases: [
      {
        title: 'Discord and Telegram display names',
        description:
          'Both allow long Unicode names, which makes them the friendliest home for a full face. ᓚᘏᗢ next to a nickname reads as personality rather than clutter.',
      },
      {
        title: 'Signing off a message',
        description:
          'A face at the end of a line does what a tone indicator does, only faster. (｡•́‿•̀｡) softens a correction, (˘ω˘) closes a goodnight.',
      },
      {
        title: 'Reaction replies',
        description:
          'Where a platform has no reaction button, a pasted face answers without demanding an answer back. ٩(◕‿◕)۶ carries enthusiasm no emoji quite matches.',
      },
      {
        title: 'Art and shop branding',
        description:
          'Small creators use a consistent face as a signature across listings, stickers, and packing notes. It behaves like a logo that costs nothing to reproduce.',
      },
      {
        title: 'Bracket framing around a word',
        description:
          'The paw and bracket forms wrap text rather than making a face: ꒰ open ꒱ or ໒ back soon ১ in a status line.',
      },
    ],
    faq: [
      {
        question: 'Why do kaomoji use Japanese and Cherokee characters?',
        answer:
          'Because the shapes happened to fit. ᴥ comes from the phonetic extensions block and became a snout. ᐢ is Canadian Aboriginal Syllabics and became an ear. ʕ and ʔ are glottal stops from the IPA extensions. None were designed for this. Kaomoji culture grew out of Japanese message boards in the 1980s, where a double-byte character set made wide expressive faces practical long before emoji existed.',
      },
      {
        question: 'Why does deleting a face take so many backspaces?',
        answer:
          'Several parts are combining marks, which attach to the character before them rather than occupying their own position. The cursor treats each as a separate step even though they look like one glyph. Selecting the whole face and deleting the selection is faster and avoids leaving an orphaned mark behind.',
      },
      {
        question: 'Will a face fit in an Instagram or TikTok bio?',
        answer:
          'Usually yes, but count the characters rather than the glyphs. Instagram allows 150 characters and TikTok 80, and a face like (づ｡◕‿‿◕｡)づ spends around a dozen of them. On TikTok that is a meaningful share of the budget, so shorter forms such as ᓚᘏᗢ or ʕ•ᴥ•ʔ leave more room for words.',
      },
    ],
  },

  /* Runic, alchemical and rare marks. No planets: those live on zodiac. */
  'weird-symbols': {
    unicodeBlock: 'Runic, Alchemical Symbols, Ancient Symbols and rare Miscellaneous blocks',
    directAnswer:
      'Click any character to copy it. These are the genuinely obscure corners of Unicode: runes, alchemical notation, ancient religious marks, and symbols most fonts barely cover.',
    groups: [
      {
        name: 'Runes',
        symbols: s('ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ ᛝ'),
      },
      {
        name: 'Alchemical notation',
        symbols: s('🜁 🜂 🜃 🜄 🜅 🜆 🜇 🜈 🜉 🜊 🜋 🜍 🜎 🜏 🜔 🜚 🜛 🝆 🝊 🝕'),
      },
      {
        name: 'Ancient and religious marks',
        symbols: s('☥ ☦ ☧ ☨ ☩ ☫ ☬ ☭ ⚸ ⚶ ⚷ ⚚ ⛦ ⛧ ⸸ ☖ ☗'),
      },
    ],
    intro:
      'Unicode contains roughly 150,000 characters and almost nobody has seen more than a few thousand of them. The rest is a warehouse of writing systems that fell out of use, notation from sciences that no longer exist, and marks so specialised that only a handful of fonts bother to include them. That is where everything on this page comes from. The runes are Elder Futhark, carved across northern Europe before the Latin alphabet arrived. The alchemical set is a working notation from a discipline that ran for centuries and produced modern chemistry on its way out. Fair warning up front: coverage is genuinely poor, and several of these will show as empty boxes on a phone.',
    howToUse:
      'Test before you commit, and test on a phone rather than a desktop. The alchemical block sits outside the Basic Multilingual Plane and is the least supported set on this site, so a symbol that looks perfect in your browser can be an empty rectangle for most of your audience. Given that, these characters earn their place where obscurity is the point. Runes suit worldbuilding, tabletop campaigns, and metal and folk aesthetics, where a reader unable to decode them is part of the effect. Alchemical marks work in occult and witchcraft-adjacent profiles and in illustration captions. The ancient religious group carries real historical weight, and ☥ or ☦ in particular mean something specific to people who recognise them, so use those deliberately rather than for decoration.',
    useCases: [
      {
        title: 'Fantasy and tabletop writing',
        description:
          'Runes label factions, spells, and locations in campaign notes without needing a custom font or an image asset for every name.',
      },
      {
        title: 'Occult and witchcraft profiles',
        description:
          'The alchemical set carries the aesthetic more convincingly than emoji, because these were working notation rather than decoration invented for the look.',
      },
      {
        title: 'Metal, folk and darkwave branding',
        description:
          'Band names, release titles, and merch listings lean on runic forms constantly. They read as harsh and archaic in a way Latin letters cannot manage.',
      },
      {
        title: 'Historical and academic notes',
        description:
          'Writing about Norse inscriptions or early chemistry is easier when the actual characters are available instead of transliterations in brackets.',
      },
      {
        title: 'Passwords and unguessable strings',
        description:
          'Where a field accepts full Unicode, rare characters expand the search space enormously. Check that the system stores them properly before relying on it.',
      },
    ],
    faq: [
      {
        question: 'Why do so many of these appear as empty boxes?',
        answer:
          'A box means the character exists but your font does not contain a drawing for it. Alchemical symbols live above U+10000, outside the Basic Multilingual Plane, and font makers include that range only when there is demand. Desktop systems with large font libraries cover more than phones do. Nothing is broken, and the character is intact when copied even if it displays as a box.',
      },
      {
        question: 'Do the runes mean anything specific?',
        answer:
          'Yes. Elder Futhark is a real alphabet, and each rune has a sound value and a traditional name: ᚠ is fehu, meaning cattle or wealth, ᚱ is raido, meaning ride or journey. They were used for inscriptions across Scandinavia and Germanic Europe from roughly the second century. Modern esoteric meanings attached to them are much later inventions, so treat historical and divinatory readings as separate things.',
      },
      {
        question: 'Is it safe to use these in a username?',
        answer:
          'Less safe than anything else on this site. Many platforms restrict handles to a limited character set and will reject them outright. Systems that do accept them may normalise or strip the characters silently, leaving you locked out of an account you cannot retype. Display names are much safer ground than login identifiers.',
      },
    ],
  },

  /* Bio pages want finished lines, so the value moved into comboGroups and the
     symbol list shrank to the connectors used to build them. */
  'symbols-for-bio': {
    unicodeBlock: 'Combining marks, brackets and connectors used to build bio lines',
    directAnswer:
      'Copy a complete bio line from the collections below, or take a connector from the smaller set and build your own. Everything here is plain text and works in Instagram, TikTok, and Telegram.',
    symbols: s(`
      ‧ ₊ ˚ ⊹ ࣪ ִ ֶ ָ ⋅ ᐟ ᵎ ๋ ࣭ ⭑ ˖ ⌇ ⌗ ⟡ ⋮ ┆ │ ⌒ ︶ ꒷ ꒦ ⏝ ⌞ ⌝ ⤿ ⤾ ↳ ⇢ ➜ ⌜ ⌟
    `),
    comboTitle: 'Ready-made bio lines',
    comboIntro:
      'Each line below is complete. Click one to copy it whole, then replace the words with your own and keep the framing.',
    comboGroups: [
      {
        name: 'Name lines',
        items: [
          '‧₊˚ ⋅ name ⋅ ˚₊‧',
          '⟡ name ⟡',
          '˖ ࣪ ⭑ name ⭑ ࣪ ˖',
          '↳ name ⌇',
          '⌗ name ᵎ',
          '⌜ name ⌟',
        ],
      },
      {
        name: 'Detail lines',
        items: [
          'city ⋅ age ⋅ pronouns',
          '⌇ writer ⌇ reader ⌇ tired',
          'coffee ⋅ film ⋅ long walks',
          '⊹ building things slowly ⊹',
          'she/her ⌇ 22 ⌇ nocturnal',
          '➜ open for work',
        ],
      },
      {
        name: 'Link lines',
        items: [
          '↳ links below',
          '⇢ new post ⌇ tap the link',
          '➜ shop ⌇ ➜ contact',
          '⌇ everything is below ⌇',
          '⟡ portfolio in bio ⟡',
        ],
      },
      {
        name: 'Dividers',
        items: [
          '︶︶︶︶︶',
          '꒷꒦꒷꒦꒷꒦',
          '⋅ ⋅ ⋅ ⟡ ⋅ ⋅ ⋅',
          '⌞ ⌝ ⌞ ⌝ ⌞ ⌝',
          '‧₊˚ ⋅ ⋅ ˚₊‧',
          '⏝⏝⏝⏝⏝',
        ],
      },
      {
        name: 'Status lines',
        items: [
          'currently ⌇ reading',
          '⊹ back in september ⊹',
          '⌇ replies are slow ⌇',
          'on a break ᵎ',
          '⟡ taking commissions ⟡',
        ],
      },
    ],
    intro:
      'A bio is three lines and a character limit, which makes it a design problem rather than a writing one. Instagram gives you 150 characters, TikTok 80, and both of them strip every kind of formatting you might reach for, so bold, indentation, and bullet lists are all unavailable. What survives is Unicode. The lines collected here are built from connectors and combining marks that create visual structure the platform cannot remove, and they are offered complete rather than as loose glyphs because a bio needs finished lines, not a parts bin.',
    howToUse:
      'Start by copying a line whole, pasting it into your bio, and replacing the words while leaving the framing untouched. That order matters, because getting the spacing right by hand is fiddly and the spacing is what makes it look intentional. Line breaks are the one thing worth knowing about: Instagram accepts them if you paste text that already contains them, but its own editor sometimes swallows a return typed directly. Writing the bio in a notes app and pasting the whole thing across avoids the problem entirely. Keep the count in mind as you edit, since every combining mark spends a character even though it adds no visible width, and a decorated line can cost twice what it appears to.',
    useCases: [
      {
        title: 'Instagram profile',
        description:
          'The 150-character limit rewards structure over prose. A framed name line, a detail line, and a link pointer fill it without feeling crowded.',
      },
      {
        title: 'TikTok bio',
        description:
          'Only 80 characters, so pick short dividers and one framed line. The dot and star connectors cost less than bracket pairs.',
      },
      {
        title: 'Telegram and Discord about sections',
        description:
          'Both allow proper line breaks and longer text, which is where the multi-line dividers finally have room to work as designed.',
      },
      {
        title: 'Linktree and link-in-bio pages',
        description:
          'Section headings on these pages are plain text fields. A framed heading separates groups of links without an image.',
      },
      {
        title: 'Shop and portfolio profiles',
        description:
          'Status lines carry information that changes often, such as commissions open or replies slow, in a format that still looks composed.',
      },
    ],
    faq: [
      {
        question: 'Why does my bio look different on someone else\'s phone?',
        answer:
          'Fonts differ by device, and the small combining marks are where that shows most. An iPhone, a Samsung, and a desktop browser each draw ˚ and ⊹ slightly differently, and spacing shifts along with them. Nothing is broken. If a layout depends on exact alignment it will disappoint you somewhere, so favour lines that still read well when the spacing moves a little.',
      },
      {
        question: 'How do I get line breaks into an Instagram bio?',
        answer:
          'Write the whole bio in a notes app with the breaks in place, then copy and paste it into the bio field in one action. Typing return directly into Instagram\'s editor works inconsistently across versions and platforms, and the paste method has stayed reliable throughout.',
      },
      {
        question: 'Do these symbols hurt my reach or get flagged?',
        answer:
          'There is no evidence that decorative Unicode affects distribution. What does cause problems is text that a platform reads as evasion, such as characters substituted inside words to dodge moderation. Framing around normal words is fine. Replacing letters inside words is what gets attention.',
      },
    ],
  },

  /* Username page leads with patterns rather than glyphs. */
  'symbols-for-usernames': {
    unicodeBlock: 'Bracket and wrapper forms used around display names',
    directAnswer:
      'Type your name into the generator below and click any result to copy it. The symbol set underneath holds the bracket and wrapper characters the patterns are built from.',
    symbols: s(`
      ꧁ ꧂ ༺ ༻ 〘 〙 「 」 『 』 【 】 〖 〗 ⦑ ⦒ ⟅ ⟆ ⁅ ⁆ ⟬ ⟭ ⌈ ⌉ ⌊ ⌋
      ▄ ︻ デ ═ ━ 一 彡 ミ 卐 丨 丿 乀 亗
    `),
    namePatterns: [
      '꧁ {name} ꧂',
      '༺ {name} ༻',
      '「 {name} 」',
      '【 {name} 】',
      '彡 {name} 彡',
      '⟬ {name} ⟭',
      '亗 {name} 亗',
      '▄︻デ {name} ═━一',
      '⌈ {name} ⌋',
      '〘 {name} 〙',
      'ミ {name} 彡',
      '『 {name} 』',
      '丨{name}丨',
      '⦑ {name} ⦒',
    ],
    intro:
      'Usernames answer to a different set of rules than bios do, and most of the frustration comes from not knowing which rule applies where. Nearly every platform separates the handle, which is your address and usually restricted to ASCII, from the display name, which is what people actually read and which typically accepts the full Unicode range. Decorating the wrong one either fails outright or, worse, succeeds and leaves you with a login you cannot type. The wrappers gathered here belong on display names, and the generator below applies them to whatever you enter so you can see the result before committing.',
    howToUse:
      'Type a name into the field above and the patterns update as you go, so you can judge width and balance before pasting anything. Length is the first constraint to check: gaming platforms tend to cap display names between twelve and thirty characters, and a wrapper spends four of them before your name starts. Symmetry is the second. Brackets are directional, and ꧁ paired with ꧂ reads as deliberate while the same character used twice reads as a mistake. The Chinese and Japanese characters in the set, ミ 彡 卐 亗, entered gaming culture through Free Fire and PUBG and now function as pure ornament there, detached from their original meanings. Test the finished name in the actual field before saving, because rejection rules vary far more than documentation suggests.',
    useCases: [
      {
        title: 'Free Fire and PUBG names',
        description:
          'Both accept wide Unicode in display names, and the wrapper style is native to those communities. ▄︻デ and 彡 read as fluency rather than decoration there.',
      },
      {
        title: 'Discord display names',
        description:
          'Discord separates username from display name, and the latter takes almost anything up to 32 characters. It is the most forgiving place to experiment.',
      },
      {
        title: 'Roblox and Minecraft',
        description:
          'Rules are tighter here, and Roblox in particular rejects most non-Latin characters at signup. Check the field before planning around a decorated name.',
      },
      {
        title: 'Streaming and clan tags',
        description:
          'A consistent wrapper across Twitch, YouTube, and a clan roster works like a signature, making the same person recognisable at a glance across platforms.',
      },
      {
        title: 'Social display names',
        description:
          'Instagram, TikTok, and Telegram all allow decorated display names while keeping the handle plain, which is exactly the split these wrappers are built for.',
      },
    ],
    faq: [
      {
        question: 'Why was my decorated username rejected?',
        answer:
          'Almost always because you edited the handle rather than the display name. Handles are addresses and are usually limited to letters, numbers, underscores, and periods, since they appear in URLs and mentions. Find the separate display name or nickname field and decorate that one instead.',
      },
      {
        question: 'Can people still find and mention me?',
        answer:
          'Mentions run on the handle, which stays plain, so tagging keeps working normally. Search behaves less predictably: some platforms index the decorated display name as written, meaning nobody can type it, while others normalise it back to plain letters. Keep your recognisable name spelled normally somewhere in the profile so search has something to match.',
      },
      {
        question: 'What do ミ 彡 and 卐 actually mean?',
        answer:
          'ミ and 彡 are Japanese: ミ is the katakana for mi, and 彡 is a character radical representing hair or a pattern of lines. In gaming names they are used purely for the shape, with no reference to the meaning. 卐 is worth treating carefully, because although it is an ancient auspicious symbol across several Asian religions and predates its twentieth-century misuse by millennia, many viewers will read it as the latter regardless of intent.',
      },
    ],
  },
};

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
let touched = 0;

for (const category of catalog.categories) {
  const patch = PATCHES[category.slug];
  if (!patch) continue;
  Object.assign(category, patch);
  if (patch.groups) {
    category.symbols = patch.groups.flatMap((group) => group.symbols);
  }
  touched += 1;
  const combos = category.comboGroups?.reduce((n, g) => n + g.items.length, 0) ?? 0;
  console.log(
    `  patched ${category.slug.padEnd(22)} ${String(category.symbols.length).padStart(3)} symbols` +
      (combos ? `, ${combos} combinations` : '') +
      (category.namePatterns ? `, ${category.namePatterns.length} patterns` : '')
  );
}

fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
console.log(`\n${touched} categories updated.`);
