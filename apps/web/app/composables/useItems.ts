import type { Ref } from 'vue';

import type { AppFilterSegment } from '@app/ui';

import type { components } from '@app/specs';
import type { ItemsQuery } from './useApi';
import { removeItemById, upsertItem } from '~/utils/items-store';

type Item = components['schemas']['Item'];
type ReadState = components['schemas']['ReadState'];

interface Filters {
  segment: AppFilterSegment;
  q: string;
  tag: string | null;
}

export interface UseItemsReturn {
  items: Ref<Item[]>;
  nextCursor: Ref<string | null>;
  loading: Ref<boolean>;
  filters: Ref<Filters>;
  load(): Promise<void>;
  loadMore(): Promise<void>;
  refetchOne(id: string): Promise<void>;
  removeLocal(id: string): void;
  save(url: string): Promise<void>;
  toggleFavorite(item: Item): Promise<void>;
  setReadState(item: Item, readState: Item['readState']): Promise<void>;
  addTag(item: Item, tag: string): Promise<void>;
  removeTag(item: Item, slug: string): Promise<void>;
  remove(id: string): Promise<void>;
}

function toQuery(f: Filters): ItemsQuery {
  const base: ItemsQuery = { q: f.q || undefined, tag: f.tag ?? undefined, limit: 20 };
  return f.segment === 'favorite'
    ? { ...base, favorite: true }
    : { ...base, readState: f.segment as ReadState };
}

export function useItems(): UseItemsReturn {
  const api = useApi();
  const items = useState<Item[]>('items:list', () => []);
  const nextCursor = useState<string | null>('items:cursor', () => null);
  const loading = useState<boolean>('items:loading', () => false);
  const filters = useState<Filters>('items:filters', () => ({
    segment: 'unread',
    q: '',
    tag: null,
  }));

  async function load(): Promise<void> {
    loading.value = true;
    try {
      const page = await api.getItems(toQuery(filters.value));
      items.value = [...page.items];
      nextCursor.value = page.nextCursor;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!nextCursor.value) return;
    const page = await api.getItems({ ...toQuery(filters.value), cursor: nextCursor.value });
    items.value = [...items.value, ...page.items];
    nextCursor.value = page.nextCursor;
  }

  async function refetchOne(id: string): Promise<void> {
    try {
      items.value = upsertItem(items.value, await api.getItem(id));
    } catch {
      // item may have been deleted between event and fetch — ignore
    }
  }

  function removeLocal(id: string): void {
    items.value = removeItemById(items.value, id);
  }

  async function save(url: string): Promise<void> {
    items.value = upsertItem(items.value, await api.saveItem({ url }));
  }

  async function toggleFavorite(item: Item): Promise<void> {
    items.value = upsertItem(items.value, { ...item, favorite: !item.favorite });
    await api.updateItem(item.id, { favorite: !item.favorite });
  }

  async function setReadState(item: Item, readState: Item['readState']): Promise<void> {
    items.value = upsertItem(items.value, { ...item, readState });
    await api.updateItem(item.id, { readState });
  }

  async function addTag(item: Item, tag: string): Promise<void> {
    // optimistic append, then reconcile with the server's canonical item (slug normalization etc.)
    items.value = upsertItem(items.value, { ...item, tags: [...item.tags, tag] });
    items.value = upsertItem(items.value, await api.addItemTag(item.id, tag));
  }

  async function removeTag(item: Item, slug: string): Promise<void> {
    items.value = upsertItem(items.value, { ...item, tags: item.tags.filter((t) => t !== slug) });
    await api.removeItemTag(item.id, slug);
  }

  async function remove(id: string): Promise<void> {
    removeLocal(id);
    await api.deleteItem(id);
  }

  return {
    items,
    nextCursor,
    loading,
    filters,
    load,
    loadMore,
    refetchOne,
    removeLocal,
    save,
    toggleFavorite,
    setReadState,
    addTag,
    removeTag,
    remove,
  };
}
