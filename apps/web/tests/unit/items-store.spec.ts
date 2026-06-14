import { describe, expect, it } from 'vitest';

import type { components } from '@app/specs';
import { upsertItem, removeItemById, routeEvent } from '../../app/utils/items-store';

type Item = components['schemas']['Item'];
const item = (id: string, over: Partial<Item> = {}): Item =>
  ({
    id,
    url: `https://x/${id}`,
    canonicalUrl: null,
    title: id,
    siteName: null,
    excerpt: null,
    leadImageUrl: null,
    faviconUrl: null,
    status: 'pending',
    readState: 'unread',
    favorite: false,
    savedAt: '2026-06-13T00:00:00Z',
    readAt: null,
    tags: [],
    ...over,
  }) as Item;

describe('upsertItem', () => {
  it('prepends a new item', () => {
    expect(upsertItem([item('a')], item('b')).map((i) => i.id)).toEqual(['b', 'a']);
  });
  it('replaces an existing item in place (pending → ready)', () => {
    const list = [item('a', { status: 'pending' }), item('b')];
    const next = upsertItem(list, item('a', { status: 'ready', title: 'Filled' }));
    expect(next.map((i) => i.id)).toEqual(['a', 'b']);
    expect(next[0]!.status).toBe('ready');
    expect(next[0]!.title).toBe('Filled');
  });
});

describe('removeItemById', () => {
  it('drops the matching item', () => {
    expect(removeItemById([item('a'), item('b')], 'a').map((i) => i.id)).toEqual(['b']);
  });
});

describe('routeEvent', () => {
  it('item.created → refetch', () => {
    expect(routeEvent({ type: 'item.created', data: { id: 'a' } })).toEqual({
      kind: 'refetch',
      id: 'a',
    });
  });
  it('item.updated → refetch', () => {
    expect(routeEvent({ type: 'item.updated', data: { id: 'a' } })).toEqual({
      kind: 'refetch',
      id: 'a',
    });
  });
  it('item.deleted → remove', () => {
    expect(routeEvent({ type: 'item.deleted', data: { id: 'a' } })).toEqual({
      kind: 'remove',
      id: 'a',
    });
  });
  it('job.updated → ignore', () => {
    expect(routeEvent({ type: 'job.updated', data: { id: 'j' } })).toEqual({ kind: 'ignore' });
  });
});
