import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppExtractState from './AppExtractState.vue';

const global = { stubs: { UIcon: true } } as const;

const labels = {
  pitch: 'Read it here, clean',
  extract: 'Fetch full article',
  extracting: 'Extracting…',
  failed: "We couldn't fetch this article",
  retry: 'Try again',
};

describe('AppExtractState', () => {
  it('none: shows the Extract button and emits extract on click', async () => {
    const w = mount(AppExtractState, { global, props: { status: 'none', labels } });
    expect(w.find('.app-extract-state').exists()).toBe(true);
    const btn = w.find('[data-testid="extract-btn"]');
    expect(btn.exists()).toBe(true);
    await btn.trigger('click');
    expect(w.emitted('extract')).toHaveLength(1);
  });

  it('extracting: shows the badge and no extract button', () => {
    const w = mount(AppExtractState, { global, props: { status: 'extracting', labels } });
    expect(w.find('.app-status-badge').exists()).toBe(true);
    expect(w.find('[data-testid="extract-btn"]').exists()).toBe(false);
  });

  it('failed: shows retry button and emits extract on click', async () => {
    const w = mount(AppExtractState, { global, props: { status: 'failed', labels } });
    const btn = w.find('[data-testid="retry-btn"]');
    expect(btn.exists()).toBe(true);
    await btn.trigger('click');
    expect(w.emitted('extract')).toHaveLength(1);
  });

  it('ready: renders nothing (no .app-extract-state in DOM)', () => {
    const w = mount(AppExtractState, { global, props: { status: 'ready', labels } });
    expect(w.find('.app-extract-state').exists()).toBe(false);
  });
});
