import { describe, it, expect, vi } from 'vitest';

import { ItemNotFoundError } from '../../../items/domain/items.errors';
import { CreateHighlightCommand } from './create-highlight.command';
import { CreateHighlightHandler } from './create-highlight.handler';

const makeRepo = (result: unknown) => ({
  create: vi.fn().mockResolvedValue(result),
});

const makeFailingRepo = (error: unknown) => ({
  create: vi.fn().mockRejectedValue(error),
});

describe('CreateHighlightHandler', () => {
  it('returns the created highlight on success', async () => {
    const detail = {
      id: 'h1',
      itemId: 'i1',
      quote: 'hello',
      prefix: '',
      suffix: '',
      note: null,
      color: 'yellow',
      createdAt: '2026-06-14T00:00:00.000Z',
    };
    const repo = makeRepo(detail);
    const handler = new CreateHighlightHandler(repo as never);
    const result = await handler.execute(
      new CreateHighlightCommand('u1', 'i1', 'hello', '', '', undefined, undefined),
    );
    expect(result).toEqual(detail);
    expect(repo.create).toHaveBeenCalledWith('u1', 'i1', {
      quote: 'hello',
      prefix: '',
      suffix: '',
      note: undefined,
      color: undefined,
    });
  });

  it('throws ItemNotFoundError when item is not owned', async () => {
    const repo = makeFailingRepo(new ItemNotFoundError('i1'));
    const handler = new CreateHighlightHandler(repo as never);
    await expect(
      handler.execute(new CreateHighlightCommand('u1', 'i1', 'q', '', '', undefined, undefined)),
    ).rejects.toBeInstanceOf(ItemNotFoundError);
  });
});
