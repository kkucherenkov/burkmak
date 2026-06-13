import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppItemCard, { type AppItemCardData } from './AppItemCard.vue';

const global = { stubs: { UIcon: true } } as const;

const base: AppItemCardData = {
  id: 'itm_1',
  url: 'https://example.com/a',
  title: 'A great article',
  siteName: 'Example',
  excerpt: 'A short excerpt.',
  faviconUrl: null,
  leadImageUrl: null,
  status: 'ready',
  readState: 'unread',
  favorite: false,
  tags: ['rust', 'web'],
};
const labels = {
  status: 'Ready',
  favorite: 'Favorite',
  archive: 'Archive',
  delete: 'Delete',
} as const;
const mountCard = (item: Partial<AppItemCardData> = {}) =>
  mount(AppItemCard, { global, props: { item: { ...base, ...item }, labels } });

describe('AppItemCard', () => {
  it('renders title and excerpt', () => {
    const w = mountCard();
    expect(w.find('.app-item-card__title').text()).toBe('A great article');
    expect(w.find('.app-item-card__excerpt').text()).toContain('A short excerpt.');
  });
  it('emits open with the id when the title is activated', async () => {
    const w = mountCard();
    await w.find('.app-item-card__title').trigger('click');
    expect(w.emitted('open')?.[0]).toEqual(['itm_1']);
  });
  it('emits toggleFavorite when the star is clicked', async () => {
    const w = mountCard();
    await w.find('[data-testid="fav"]').trigger('click');
    expect(w.emitted('toggleFavorite')?.[0]).toEqual(['itm_1']);
  });
  it('emits delete when the delete button is clicked', async () => {
    const w = mountCard();
    await w.find('[data-testid="del"]').trigger('click');
    expect(w.emitted('delete')?.[0]).toEqual(['itm_1']);
  });
  it('renders one AppTagChip per tag and emits tagClick', async () => {
    const w = mountCard();
    const chips = w.findAll('.app-tag-chip');
    expect(chips).toHaveLength(2);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- length asserted above
    await chips[0]!.trigger('click');
    expect(w.emitted('tagClick')?.[0]).toEqual(['rust']);
  });
  it('shows the status badge when not ready', () => {
    expect(mountCard({ status: 'pending' }).find('.app-status-badge').exists()).toBe(true);
  });
  it('hides the status badge when ready', () => {
    expect(mountCard({ status: 'ready' }).find('.app-status-badge').exists()).toBe(false);
  });
  it('renders skeleton body instead of excerpt while pending', () => {
    const w = mountCard({ status: 'pending' });
    expect(w.find('.app-skeleton').exists()).toBe(true);
    expect(w.find('.app-item-card__excerpt').exists()).toBe(false);
  });
});
