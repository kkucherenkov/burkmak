import { nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import { useFiltersReload } from '../../app/composables/useFiltersReload';
import type { Filters } from '../../app/composables/useItems';

const baseFilters = (): Filters => ({ segment: 'unread', q: '', tag: null });

describe('useFiltersReload', () => {
  it('reloads when q changes', async () => {
    const filters = ref(baseFilters());
    const reload = vi.fn();
    useFiltersReload(filters, reload);

    filters.value = { ...filters.value, q: 'rust' };
    await nextTick();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  // Regression for the bookmarks tag-click bug: a shallow watch on `q` alone
  // silently missed tag changes, leaving an invisible, unclearable filter.
  it('reloads when tag changes even though q is untouched', async () => {
    const filters = ref(baseFilters());
    const reload = vi.fn();
    useFiltersReload(filters, reload);

    filters.value.tag = 'rust';
    await nextTick();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('reloads when segment changes', async () => {
    const filters = ref(baseFilters());
    const reload = vi.fn();
    useFiltersReload(filters, reload);

    filters.value = { ...filters.value, segment: 'favorite' };
    await nextTick();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload without a filter change', async () => {
    const filters = ref(baseFilters());
    const reload = vi.fn();
    useFiltersReload(filters, reload);

    await nextTick();

    expect(reload).not.toHaveBeenCalled();
  });

  it('clearing an active tag filter (back to null) triggers a reload too', async () => {
    const filters = ref<Filters>({ segment: 'unread', q: '', tag: 'rust' });
    const reload = vi.fn();
    useFiltersReload(filters, reload);

    filters.value.tag = null;
    await nextTick();

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
