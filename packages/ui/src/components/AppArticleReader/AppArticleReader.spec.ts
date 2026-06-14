import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppArticleReader, { type AppHighlightData } from './AppArticleReader.vue';

const global = { stubs: { UIcon: true } } as const;

describe('AppArticleReader', () => {
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
});
