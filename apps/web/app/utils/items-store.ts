import type { components } from '@app/specs';

type Item = components['schemas']['Item'];

export type EventAction =
  | { kind: 'refetch'; id: string }
  | { kind: 'remove'; id: string }
  | { kind: 'ignore' };

export function upsertItem(items: Item[], next: Item): Item[] {
  const idx = items.findIndex((i) => i.id === next.id);
  if (idx === -1) return [next, ...items];
  const copy = [...items];
  copy[idx] = next;
  return copy;
}

export function removeItemById(items: Item[], id: string): Item[] {
  return items.filter((i) => i.id !== id);
}

export function routeEvent(evt: { type: string; data: { id?: string } }): EventAction {
  switch (evt.type) {
    case 'item.created':
    case 'item.updated': {
      return evt.data.id ? { kind: 'refetch', id: evt.data.id } : { kind: 'ignore' };
    }
    case 'item.deleted': {
      return evt.data.id ? { kind: 'remove', id: evt.data.id } : { kind: 'ignore' };
    }
    default: {
      return { kind: 'ignore' };
    }
  }
}
