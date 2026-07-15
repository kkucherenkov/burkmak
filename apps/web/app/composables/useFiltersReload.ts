import type { Ref } from 'vue';
import { watch } from 'vue';

import type { Filters } from './useItems';

/**
 * Deep-watches a snapshot of `filters` and invokes `reload` whenever any
 * nested field changes (segment/q/tag/...). A shallow watch on a single
 * field (e.g. only `q`) silently misses other filter mutations — this is
 * exactly what let a bookmark tag-click set an unwatched, unclearable
 * filter. Shared by every page that owns a `useItems` filters ref so the
 * two can't drift apart again.
 */
export function useFiltersReload(filters: Ref<Filters>, reload: () => void): void {
  watch(
    () => ({ ...filters.value }),
    () => {
      reload();
    },
    { deep: true },
  );
}
