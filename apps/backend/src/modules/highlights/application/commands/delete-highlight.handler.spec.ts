import { describe, it, expect, vi } from 'vitest';

import { HighlightNotFoundError } from '../../domain/highlights.errors';
import { DeleteHighlightCommand } from './delete-highlight.command';
import { DeleteHighlightHandler } from './delete-highlight.handler';

describe('DeleteHighlightHandler', () => {
  it('resolves void on success', async () => {
    const repo = { remove: vi.fn().mockResolvedValue(undefined) };
    const handler = new DeleteHighlightHandler(repo as never);
    await expect(handler.execute(new DeleteHighlightCommand('u1', 'h1'))).resolves.toBeUndefined();
    expect(repo.remove).toHaveBeenCalledWith('u1', 'h1');
  });

  it('throws HighlightNotFoundError when highlight is not owned', async () => {
    const repo = { remove: vi.fn().mockRejectedValue(new HighlightNotFoundError('h1')) };
    const handler = new DeleteHighlightHandler(repo as never);
    await expect(handler.execute(new DeleteHighlightCommand('u1', 'h1'))).rejects.toBeInstanceOf(
      HighlightNotFoundError,
    );
  });
});
