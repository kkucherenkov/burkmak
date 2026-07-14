import type { Ref } from 'vue';

import type { AppFilterSegment } from '@app/ui';

import type { components } from '@app/specs';
import type { ItemsQuery } from './useApi';
import { removeItemById, upsertItem } from '~/utils/items-store';

type Item = components['schemas']['Item'];
type ReadState = components['schemas']['ReadState'];
type Kind = components['schemas']['Kind'];

export interface Filters {
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
  save(url: string, kind?: Kind): Promise<void>;
  toggleFavorite(item: Item): Promise<void>;
  setReadState(item: Item, readState: Item['readState']): Promise<void>;
  addTag(item: Item, tag: string): Promise<void>;
  removeTag(item: Item, slug: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export function buildItemsQuery(f: Filters, kind: Kind): ItemsQuery {
  const base: ItemsQuery = { kind, q: f.q || undefined, tag: f.tag ?? undefined, limit: 20 };
  // Bookmarks are never segmented by read-state — they're all a flat list.
  if (kind === 'bookmark') return base;
  return f.segment === 'favorite'
    ? { ...base, favorite: true }
    : { ...base, readState: f.segment as ReadState };
}

export function useItems(kind: Kind = 'article'): UseItemsReturn {
  const api = useApi();
  // State is namespaced by kind so the library (articles) and /bookmarks keep
  // independent lists despite sharing this composable.
  const items = useState<Item[]>(`items:list:${kind}`, () => []);
  const nextCursor = useState<string | null>(`items:cursor:${kind}`, () => null);
  const loading = useState<boolean>(`items:loading:${kind}`, () => false);
  const filters = useState<Filters>(`items:filters:${kind}`, () => ({
    segment: 'unread',
    q: '',
    tag: null,
  }));

  async function load(): Promise<void> {
    loading.value = true;
    try {
      const page = await api.getItems(buildItemsQuery(filters.value, kind));
      items.value = [...page.items];
      nextCursor.value = page.nextCursor;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!nextCursor.value) return;
    const page = await api.getItems({
      ...buildItemsQuery(filters.value, kind),
      cursor: nextCursor.value,
    });
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

  async function save(url: string, saveKind: Kind = 'article'): Promise<void> {
    const saved = await api.saveItem({ url, kind: saveKind });
    // Only surface it in this scope's list when the kind matches — saving a
    // bookmark from the library must not inject it into the article list.
    if (saved.kind === kind) items.value = upsertItem(items.value, saved);
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
