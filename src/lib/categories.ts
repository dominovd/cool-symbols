/**
 * Background tint per category, used by the card grids on the home page and in
 * the sidebar. Keyed by slug so a category without an entry falls back to grey
 * rather than breaking the layout.
 */
export const CATEGORY_TINTS: Record<string, string> = {
  'heart-symbols': 'var(--tint-pink)',
  'star-symbols': 'var(--tint-yellow)',
  'arrow-symbols': 'var(--tint-blue)',
  'math-symbols': 'var(--tint-green)',
  'currency-symbols': 'var(--tint-orange)',
  'music-symbols': 'var(--tint-blue)',
  'flower-symbols': 'var(--tint-pink)',
  'line-symbols': 'var(--tint-gray)',
  'shape-symbols': 'var(--tint-yellow)',
  'weather-symbols': 'var(--tint-blue)',
  'zodiac-symbols': 'var(--tint-purple)',
  'punctuation-symbols': 'var(--tint-pink)',
  'aesthetic-symbols': 'var(--tint-purple)',
  'text-symbols': 'var(--tint-gray)',
  'special-characters': 'var(--tint-green)',
  'keyboard-symbols': 'var(--tint-blue)',
  'icon-copy-paste': 'var(--tint-purple)',
  'cute-symbols': 'var(--tint-pink)',
  'symbols-for-bio': 'var(--tint-orange)',
  'symbols-for-usernames': 'var(--tint-blue)',
  'weird-symbols': 'var(--tint-green)',
};
