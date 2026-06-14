import { describe, it, expect, vi } from 'vitest';

import { ItemNotFoundError } from '../../../items/domain/items.errors';
import { ListHighlightsQuery } from './list-highlights.query';
import { ListHighlightsHandler } from './list-highlights.handler';

describe('ListHighlightsHandler', () => {
  it('returns highlights for owned item', async () => {
    const items = [
      {
        id: 'h1',
        itemId: 'i1',
        quote: 'q',
        prefix: '',
        suffix: '',
        note: null,
        color: 'yellow',
        createdAt: '2026-06-14T00:00:00.000Z',
      },
    ];
    const repo = { listForItem: vi.fn().mockResolvedValue(items) };
    const handler = new ListHighlightsHandler(repo as never);
    const result = await handler.execute(new ListHighlightsQuery('u1', 'i1'));
    expect(result).toEqual({ highlights: items });
    expect(repo.listForItem).toHaveBeenCalledWith('u1', 'i1');
  });

  it('throws ItemNotFoundError for non-owned item', async () => {
    const repo = { listForItem: vi.fn().mockRejectedValue(new ItemNotFoundError('i1')) };
    const handler = new ListHighlightsHandler(repo as never);
    await expect(handler.execute(new ListHighlightsQuery('u1', 'i1'))).rejects.toBeInstanceOf(
      ItemNotFoundError,
    );
  });
});
