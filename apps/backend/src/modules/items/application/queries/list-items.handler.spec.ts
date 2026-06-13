import { describe, it, expect, vi } from 'vitest';
import { ListItemsHandler } from './list-items.handler';
import { ListItemsQuery } from './list-items.query';

describe('ListItemsHandler', () => {
  it('passes the filter through and returns the page', async () => {
    const repo = { findMany: vi.fn().mockResolvedValue({ items: [], nextCursor: null }) };
    const handler = new ListItemsHandler(repo as never);
    const filter = { userId: 'u1', limit: 20, readState: 'unread' as const };
    const res = await handler.execute(new ListItemsQuery(filter));
    expect(repo.findMany).toHaveBeenCalledWith(filter);
    expect(res).toEqual({ items: [], nextCursor: null });
  });
});
