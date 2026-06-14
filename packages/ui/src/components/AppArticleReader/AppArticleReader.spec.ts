import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AppArticleReader, { type AppHighlightData } from './AppArticleReader.vue';

const global = { stubs: { UIcon: true } } as const;

describe('AppArticleReader', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders contentHtml inside the body element', () => {
    const w = mount(AppArticleReader, {
      global,
      props: { contentHtml: '<p>Hello world</p>', highlights: [] },
    });
    expect(w.find('.app-article-reader__body').html()).toContain('<p>');
  });

  it('applies highlight marks for each highlight whose quote is found', async () => {
    const html = '<p>Alpha beta gamma delta.</p>';
    const highlights: AppHighlightData[] = [
      { id: 'h1', quote: 'beta gamma', prefix: 'Alpha ', suffix: ' delta', color: 'yellow' },
    ];
    const w = mount(AppArticleReader, { global, props: { contentHtml: html, highlights } });
    // Wait for the highlight anchoring (nextTick)
    await w.vm.$nextTick();
    expect(w.findAll('.app-highlight--yellow')).toHaveLength(1);
  });

  it('clicking a highlight mark emits highlightClick with the id', async () => {
    const html = '<p>Alpha beta gamma delta.</p>';
    const highlights: AppHighlightData[] = [
      { id: 'h1', quote: 'beta gamma', prefix: 'Alpha ', suffix: ' delta', color: 'yellow' },
    ];
    const w = mount(AppArticleReader, { global, props: { contentHtml: html, highlights } });
    await w.vm.$nextTick();
    await w.find('.app-highlight--yellow').trigger('click');
    expect(w.emitted('highlightClick')?.[0]).toEqual(['h1']);
  });

  it('renders nothing extra when highlights list is empty', () => {
    const w = mount(AppArticleReader, {
      global,
      props: { contentHtml: '<p>Text.</p>', highlights: [] },
    });
    expect(w.findAll('.app-highlight')).toHaveLength(0);
  });

  /**
   * select emit — happy-dom does not support a live browser Selection API, so
   * we stub globalThis.getSelection() to return a fake Selection whose
   * startContainer points at the first text node inside the rendered body.
   * This exercises the onMouseUp → resolveSelectionStart → emit('select') path.
   */
  it('emits select with quote/prefix/suffix when a text selection is released', async () => {
    const html = '<p>Alpha beta gamma delta.</p>';
    const w = mount(AppArticleReader, {
      global,
      props: { contentHtml: html, highlights: [] },
    });
    await w.vm.$nextTick();

    // Grab the actual text node rendered inside the body div.
    const bodyEl = w.find('.app-article-reader__body').element as HTMLElement;
    const pEl = bodyEl.querySelector('p')!;
    const textNode = pEl.firstChild!; // "Alpha beta gamma delta."

    // The selected text is "beta gamma" starting at offset 6 in the text node.
    const quote = 'beta gamma';
    const startOffset = 'Alpha '.length; // 6

    const fakeRange = {
      commonAncestorContainer: textNode,
      startContainer: textNode,
      startOffset,
    };
    const fakeSelection = {
      isCollapsed: false,
      toString: () => quote,
      getRangeAt: (_i: number) => fakeRange,
    };

    vi.spyOn(globalThis, 'getSelection').mockReturnValue(fakeSelection as unknown as Selection);

    await w.find('.app-article-reader__body').trigger('mouseup');

    const emitted = w.emitted('select');
    expect(emitted).toHaveLength(1);
    const payload = emitted?.[0]?.[0] as { quote: string; prefix: string; suffix: string };
    expect(payload.quote).toBe(quote);
    // "Alpha " precedes the selection
    expect(payload.prefix).toBe('Alpha ');
    // " delta." follows right after "beta gamma" in "Alpha beta gamma delta."
    expect(payload.suffix).toBe(' delta.');
  });
});
