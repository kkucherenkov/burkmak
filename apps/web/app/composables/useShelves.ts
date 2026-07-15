import type { Ref } from 'vue';

import type { components } from '@app/specs';

type Shelf = components['schemas']['Shelf'];

/**
 * Error contract, by method (deliberately split, not an oversight — pick the
 * documented behaviour per call site):
 *  - `load` / `create` / `rename` / `remove`: swallow failures into `error`
 *    and never reject. `create`/`rename` also distinguish a 409 as
 *    'name-conflict' there. Safe to call bare from a template handler.
 *  - `addItem` / `removeItem`: reject on failure and do NOT touch `error`.
 *    Every call site MUST catch — e.g. wrap in a page-local `runAction` (see
 *    items/[id].vue, shelves/[id].vue) — or an unhandled rejection results.
 */
export interface UseShelvesReturn {
  shelves: Ref<Shelf[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  load(): Promise<void>;
  create(name: string): Promise<Shelf | null>;
  rename(id: string, name: string): Promise<void>;
  remove(id: string): Promise<void>;
  /** @throws on failure — caller must catch (see contract note above). */
  addItem(shelfId: string, itemId: string): Promise<void>;
  /** @throws on failure — caller must catch (see contract note above). */
  removeItem(shelfId: string, itemId: string): Promise<void>;
}

/** Shelves render alphabetically; the server already sorts, this keeps optimistic writes in order. */
export function sortShelves(shelves: Shelf[]): Shelf[] {
  return shelves.toSorted((a, b) => a.name.localeCompare(b.name));
}

export function upsertShelf(shelves: Shelf[], next: Shelf): Shelf[] {
  const idx = shelves.findIndex((s) => s.id === next.id);
  if (idx === -1) return sortShelves([...shelves, next]);
  const copy = [...shelves];
  copy[idx] = next;
  return sortShelves(copy);
}

export function removeShelfById(shelves: Shelf[], id: string): Shelf[] {
  return shelves.filter((s) => s.id !== id);
}

/**
 * A 409 is the only error the shelves API defines for create/rename — it's the
 * expected outcome of a duplicate name, not an unexpected failure. Keyed off the
 * HTTP status (matches the `statusCode` / `response.status` idiom already used in
 * useArticle.ts) rather than the RFC 9457 `code` field: the status is simpler,
 * and every 409 this API returns for these two calls is already a name conflict.
 */
export function isConflict(error: unknown): boolean {
  const httpStatus =
    (error as { response?: { status?: number }; statusCode?: number }).response?.status ??
    (error as { statusCode?: number }).statusCode;
  return httpStatus === 409;
}

export function useShelves(): UseShelvesReturn {
  const api = useApi();
  const shelves = useState<Shelf[]>('shelves:list', () => []);
  const loading = useState<boolean>('shelves:loading', () => false);
  const error = useState<string | null>('shelves:error', () => null);

  async function load(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const { shelves: fetched } = await api.listShelves();
      shelves.value = sortShelves(fetched);
    } catch {
      error.value = 'load-failed';
    } finally {
      loading.value = false;
    }
  }

  async function create(name: string): Promise<Shelf | null> {
    try {
      const created = await api.createShelf(name);
      shelves.value = upsertShelf(shelves.value, created);
      return created;
    } catch (error_) {
      // 409 is the expected, user-facing outcome of a duplicate name — surface it
      // distinctly so the page can say "that name is taken" rather than "failed".
      error.value = isConflict(error_) ? 'name-conflict' : 'create-failed';
      return null;
    }
  }

  async function rename(id: string, name: string): Promise<void> {
    try {
      const renamed = await api.renameShelf(id, name);
      shelves.value = upsertShelf(shelves.value, renamed);
    } catch (error_) {
      error.value = isConflict(error_) ? 'name-conflict' : 'rename-failed';
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await api.deleteShelf(id);
      shelves.value = removeShelfById(shelves.value, id);
    } catch {
      error.value = 'delete-failed';
    }
  }

  async function addItem(shelfId: string, itemId: string): Promise<void> {
    await api.addItemToShelf(shelfId, itemId);
    await load(); // itemCount changed
  }

  async function removeItem(shelfId: string, itemId: string): Promise<void> {
    await api.removeItemFromShelf(shelfId, itemId);
    await load();
  }

  return { shelves, loading, error, load, create, rename, remove, addItem, removeItem };
}
