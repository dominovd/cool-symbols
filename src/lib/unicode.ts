/**
 * Formats every code point in a symbol as `U+XXXX`, space separated.
 *
 * Multi-code-point symbols (emoji with variation selectors or ZWJ sequences,
 * e.g. ❤️‍🔥) expand to several entries, which is what we want for the search
 * index and the accessible label.
 */
export function unicodeCodePoints(symbol: string): string {
  return [...symbol]
    .map((char) => `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
}
