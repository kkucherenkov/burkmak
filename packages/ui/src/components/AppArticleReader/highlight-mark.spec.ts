/**
 * Unit tests for anchorHighlight / clearHighlights.
 *
 * NOTE: the multi-node-span case (a quote crossing an element boundary) is NOT
 * tested here — it is a documented limitation of the S2 cut (single text-node
 * wrapping only). See the WHY comment in AppArticleReader.vue.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { anchorHighlight, clearHighlights, type HighlightSpec } from './highlight-mark';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeContainer(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
}

function spec(overrides: Partial<HighlightSpec> & { quote: string }): HighlightSpec {
  return {
    id: 'test-id',
    color: 'yellow',
    prefix: '',
    suffix: '',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('anchorHighlight', () => {
  it('returns false and does nothing when quote is not present', () => {
    const el = makeContainer('<p>Hello world</p>');
    const result = anchorHighlight(el, spec({ quote: 'missing phrase' }));
    expect(result).toBe(false);
    expect(el.querySelector('mark')).toBeNull();
  });

  it('wraps a single unambiguous match in a <mark>', () => {
    const el = makeContainer('<p>Alpha beta gamma.</p>');
    const result = anchorHighlight(
      el,
      spec({ quote: 'beta gamma', prefix: 'Alpha ', suffix: '.' }),
    );
    expect(result).toBe(true);
    const mark = el.querySelector<HTMLElement>('mark[data-hl="test-id"]');
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe('beta gamma');
    expect(mark?.className).toContain('app-highlight--yellow');
  });

  it('matches with empty prefix and suffix (no disambiguation needed)', () => {
    const el = makeContainer('<p>Foo bar baz.</p>');
    const result = anchorHighlight(el, spec({ quote: 'Foo bar baz', prefix: '', suffix: '' }));
    expect(result).toBe(true);
    expect(el.querySelector('mark')).not.toBeNull();
  });

  /**
   * TWO-IN-ONE-NODE: The same short quote appears twice in the same text node.
   * The first occurrence has different surrounding text, the second matches
   * prefix/suffix exactly.  Before Fix 1 this test FAILS — the old code anchors
   * the first occurrence, then because that occurrence's before/after don't
   * match the spec it continues to the NEXT text node and never re-searches
   * later positions in the SAME node.
   *
   * After Fix 1 the inner `indexOf` loop advances past the rejected first hit
   * and finds the second occurrence, which passes disambiguation.
   */
  it('anchors the SECOND occurrence in one text node when disambiguated by prefix/suffix', () => {
    // "quick" appears twice; only the second is preceded by "The " and followed by " brown"
    const el = makeContainer('<p>A quick fox. The quick brown fox jumps.</p>');
    const result = anchorHighlight(el, spec({ quote: 'quick', prefix: 'The ', suffix: ' brown' }));
    expect(result).toBe(true);
    const mark = el.querySelector<HTMLElement>('mark[data-hl="test-id"]');
    expect(mark).not.toBeNull();
    // Verify it wrapped the SECOND occurrence: the next text should contain " brown fox"
    expect(mark?.nextSibling?.textContent).toMatch(/^ brown/);
  });

  it('returns false when the only occurrence fails disambiguation', () => {
    const el = makeContainer('<p>Hello world end.</p>');
    const result = anchorHighlight(
      el,
      spec({ quote: 'world', prefix: 'WRONG_PREFIX ', suffix: ' end' }),
    );
    expect(result).toBe(false);
  });
});

describe('clearHighlights', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = makeContainer(
      '<p>Alpha <mark class="app-highlight" data-hl="h1">beta</mark> gamma.</p>',
    );
  });

  afterEach(() => {
    container.innerHTML = '';
  });

  it('removes the mark element and restores the text node', () => {
    clearHighlights(container);
    expect(container.querySelector('mark')).toBeNull();
    expect(container.textContent).toBe('Alpha beta gamma.');
  });

  it('is idempotent — calling twice leaves the same result', () => {
    clearHighlights(container);
    clearHighlights(container);
    expect(container.textContent).toBe('Alpha beta gamma.');
  });
});
