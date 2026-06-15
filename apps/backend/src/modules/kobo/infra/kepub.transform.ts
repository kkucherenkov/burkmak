/**
 * KEPUB span injection.
 *
 * Wraps text content inside block elements (p, li, h1..h6, blockquote, td, th)
 * with <span class="koboSpan" id="kobo.<para>.<seg>">…</span> tags.
 * Kobo Nickel uses these spans for reading progress, time-remaining, and stats.
 *
 * Conservative approach:
 * - Only processes direct text within known block elements.
 * - If koboSpan spans are already present, returns input unchanged (no double-wrap).
 * - Does not modify attribute text or tag names.
 */

/**
 * Inject koboSpan elements into XHTML chapter content.
 * If the content already contains koboSpan, returns it unchanged.
 */
export function toKepubXhtml(xhtml: string): string {
  // Idempotency check: if already has koboSpan, return as-is
  if (xhtml.includes('class="koboSpan"')) {
    return xhtml;
  }

  let paraIndex = 0;

  return xhtml.replaceAll(
    /(<(p|li|h[1-6]|blockquote|td|th)(\s[^>]*)?>)([\s\S]*?)(<\/\2>)/gi,
    (_match, openTag: string, _tagName: string, _attrs: string, inner: string, closeTag: string) => {
      // Wrap the text nodes and inline content inside this block element
      const wrapped = wrapTextNodes(inner, paraIndex);
      paraIndex++;
      return `${openTag}${wrapped}${closeTag}`;
    },
  );
}

/**
 * Wrap text runs inside a block element's inner HTML with koboSpan tags.
 * Text segments are split on sentence boundaries (. ! ?) for finer granularity.
 */
function wrapTextNodes(inner: string, paraIndex: number): string {
  let segIndex = 0;

  // Split on tag boundaries to process text nodes separately
  // Tokens: either a tag (<...>) or a text node
  const tokens = inner.split(/(<[^>]+>)/);

  return tokens
    .map((token) => {
      // Skip empty tokens and tag tokens
      if (!token || token.startsWith('<')) {
        return token;
      }

      // Skip whitespace-only text nodes
      if (!token.trim()) {
        return token;
      }

      // Split text into sentence-level segments for Kobo progress granularity
      const segments = splitIntoSegments(token);
      return segments
        .map((seg) => {
          if (!seg.trim()) return seg;
          const id = `kobo.${paraIndex.toString()}.${segIndex.toString()}`;
          segIndex++;
          return `<span class="koboSpan" id="${id}">${seg}</span>`;
        })
        .join('');
    })
    .join('');
}

/**
 * Split text into sentence-level segments.
 * Keeps delimiter attached to preceding segment.
 */
function splitIntoSegments(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end of string
  const parts = text.split(/(?<=[.!?])\s+/);
  if (parts.length <= 1) return [text];

  // Re-add the spaces that were stripped by the split
  const result: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === undefined) continue;
    if (i < parts.length - 1) {
      result.push(part + ' ');
    } else {
      result.push(part);
    }
  }
  return result;
}
