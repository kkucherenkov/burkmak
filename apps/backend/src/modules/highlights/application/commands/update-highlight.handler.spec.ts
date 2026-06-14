import { describe, it, expect, vi } from 'vitest';

import { HighlightNotFoundError } from '../../domain/highlights.errors';
import { UpdateHighlightCommand } from './update-highlight.command';
import { UpdateHighlightHandler } from './update-highlight.handler';

describe('UpdateHighlightHandler', () => {
  it('returns updated highlight on success', async () => {
    const detail = {
      id: 'h1',
      itemId: 'i1',
      quote: 'q',
      prefix: '',
      suffix: '',
      note: 'my note',
      color: 'green',
      createdAt: '2026-06-14T00:00:00.000Z',
    };
    const repo = { update: vi.fn().mockResolvedValue(detail) };
    const handler = new UpdateHighlightHandler(repo as never);
    const result = await handler.execute(
      new UpdateHighlightCommand('u1', 'h1', 'my note', 'green'),
    );
    expect(result).toEqual(detail);
    expect(repo.update).toHaveBeenCalledWith('u1', 'h1', { note: 'my note', color: 'green' });
  });

  it('throws HighlightNotFoundError when highlight is not owned', async () => {
    const repo = { update: vi.fn().mockRejectedValue(new HighlightNotFoundError('h1')) };
    const handler = new UpdateHighlightHandler(repo as never);
    await expect(
      handler.execute(new UpdateHighlightCommand('u1', 'h1', undefined, 'pink')),
    ).rejects.toBeInstanceOf(HighlightNotFoundError);
  });

  it('passes null note through to repo for clearing a note', async () => {
    const detail = {
      id: 'h1',
      itemId: 'i1',
      quote: 'q',
      prefix: '',
      suffix: '',
      note: null,
      color: 'yellow',
      createdAt: '2026-06-14T00:00:00.000Z',
    };
    const repo = { update: vi.fn().mockResolvedValue(detail) };
    const handler = new UpdateHighlightHandler(repo as never);
    await handler.execute(new UpdateHighlightCommand('u1', 'h1', null, undefined));
    expect(repo.update).toHaveBeenCalledWith('u1', 'h1', { note: null });
  });
});
