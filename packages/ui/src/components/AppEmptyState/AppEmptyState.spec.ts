import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppEmptyState from './AppEmptyState.vue';

const global = { stubs: { UIcon: true } } as const;

describe('AppEmptyState', () => {
  it('renders the title', () => {
    const w = mount(AppEmptyState, { global, props: { title: 'Nothing here yet' } });
    expect(w.find('.app-empty-state__title').text()).toBe('Nothing here yet');
  });
  it('renders the description when provided', () => {
    const w = mount(AppEmptyState, {
      global,
      props: { title: 't', description: 'Paste a link to begin.' },
    });
    expect(w.find('.app-empty-state__desc').text()).toBe('Paste a link to begin.');
  });
  it('omits the description node when absent', () => {
    const w = mount(AppEmptyState, { global, props: { title: 't' } });
    expect(w.find('.app-empty-state__desc').exists()).toBe(false);
  });
  it('renders the default slot as the action', () => {
    const w = mount(AppEmptyState, {
      global,
      props: { title: 't' },
      slots: { default: '<button class="cta">Paste a link</button>' },
    });
    expect(w.find('.app-empty-state__action .cta').exists()).toBe(true);
  });
});
