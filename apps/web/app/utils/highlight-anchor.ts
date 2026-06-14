/**
 * A text-quote anchor for a highlight. `quote` is the selected text; `prefix`
 * and `suffix` are short windows of the surrounding characters used to
 * disambiguate which occurrence of `quote` was selected when re-anchoring
 * (text-fragment style anchoring — the same shape the backend's
 * CreateHighlightRequest expects).
 */
export interface HighlightAnchor {
  quote: string;
  prefix: string;
  suffix: string;
}

/**
 * Slice a text-quote anchor out of `text` given the selection's character
 * offsets. Pure and string-based so it is unit-testable without a real DOM
 * Selection; the page resolves a browser Selection to `start`/`end` offsets and
 * calls this. `ctx` bounds how many context chars to capture on each side
 * (`slice` naturally clamps at the string bounds).
 */
export function anchorFromSelection(
  text: string,
  start: number,
  end: number,
  ctx = 32,
): HighlightAnchor {
  const quote = text.slice(start, end);
  const prefix = text.slice(Math.max(0, start - ctx), start);
  const suffix = text.slice(end, end + ctx);
  return { quote, prefix, suffix };
}
