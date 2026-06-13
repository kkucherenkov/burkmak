import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppFilterBar, { type AppFilterSegment } from './AppFilterBar.vue';

const global = { stubs: { UIcon: true } } as const;
const labels = {
  unread: 'Unread',
  read: 'Read',
  archived: 'Archived',
  favorite: 'Favorite',
  allTags: 'All tags',
  search: 'Search library',
} as const;
const base = {
  segment: 'unread' as AppFilterSegment,
  q: '',
  tag: null,
  tagOptions: [{ id: 'rust', label: 'rust' }],
  labels,
};

describe('AppFilterBar', () => {
  it('renders the four segments', () => {
    const w = mount(AppFilterBar, { global, props: base });
    expect(w.findAll('.app-filter-bar__segment')).toHaveLength(4);
  });
  it('marks the active segment selected', () => {
    const w = mount(AppFilterBar, { global, props: { ...base, segment: 'read' } });
    const chips = w.findAll('.app-filter-bar__segment');
    expect(chips[1]?.attributes('aria-pressed')).toBe('true');
  });
  it('emits update:segment when a segment is clicked', async () => {
    const w = mount(AppFilterBar, { global, props: base });
    await w.findAll('.app-filter-bar__segment')[3]?.trigger('click');
    expect(w.emitted('update:segment')?.[0]).toEqual(['favorite']);
  });
  it('emits update:q on search input', async () => {
    const w = mount(AppFilterBar, { global, props: base });
    await w.find('input[type="search"]').setValue('rust');
    expect(w.emitted('update:q')?.at(-1)).toEqual(['rust']);
  });
  it('emits update:tag on select change', async () => {
    const w = mount(AppFilterBar, { global, props: base });
    await w.find('select').setValue('rust');
    expect(w.emitted('update:tag')?.[0]).toEqual(['rust']);
  });
});
