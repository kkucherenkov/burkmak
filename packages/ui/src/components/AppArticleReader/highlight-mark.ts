/**
 * DOM range-wrap utility for highlight marks.
 *
 * Limitation: only wraps matches that fall within a single text node.
 * Multi-node spans (a quote that crosses an element boundary, e.g. <p> to <p>)
 * are silently skipped — the S2 cut keeps this simple. Document the limitation
 * in AppArticleReader.vue's WHY comment.
 */

export interface HighlightSpec {
  id: string;
  quote: string;
  prefix: string;
  suffix: string;
  color: string;
}

/**
 * Walk all text nodes inside `container`, find the first occurrence of
 * `spec.quote` (disambiguated by `spec.prefix` immediately before and
 * `spec.suffix` immediately after), and wrap the matched range in a
 * `<mark class="app-highlight app-highlight--<color>" data-hl="<id>">`.
 *
 * Returns true if a mark was inserted, false if not found.
 */
export function anchorHighlight(container: HTMLElement, spec: HighlightSpec): boolean {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? '';
    const idx = text.indexOf(spec.quote);
    if (idx === -1) continue;

    // Disambiguate: verify that the characters immediately before/after
    // the quote match prefix-tail and suffix-head (first 10 chars each).
    const prefixTail = spec.prefix.slice(-10);
    const suffixHead = spec.suffix.slice(0, 10);
    const before = text.slice(Math.max(0, idx - prefixTail.length), idx);
    const after = text.slice(idx + spec.quote.length, idx + spec.quote.length + suffixHead.length);

    if (prefixTail && !before.endsWith(prefixTail.slice(-(before.length || 1)))) continue;
    if (suffixHead && !after.startsWith(suffixHead.slice(0, after.length || 1))) continue;

    // Wrap the matched range.
    const range = document.createRange();
    range.setStart(node, idx);
    range.setEnd(node, idx + spec.quote.length);

    const mark = document.createElement('mark');
    mark.className = `app-highlight app-highlight--${spec.color}`;
    mark.dataset['hl'] = spec.id;
    range.surroundContents(mark);
    return true;
  }
  return false;
}

/**
 * Remove all `<mark data-hl>` marks from the container, restoring the
 * original text nodes (by replacing each mark with its text content).
 */
export function clearHighlights(container: HTMLElement): void {
  const marks = container.querySelectorAll<HTMLElement>('mark[data-hl]');
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    mark.remove();
    parent.normalize();
  }
}
