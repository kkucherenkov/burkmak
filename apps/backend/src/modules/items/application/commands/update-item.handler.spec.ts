import { describe, it, expect, vi } from 'vitest';
import { UpdateItemHandler } from './update-item.handler';
import { UpdateItemCommand } from './update-item.command';
import { ItemNotFoundError } from '../../domain/items.errors';

describe('UpdateItemHandler', () => {
  it('throws when the item is not owned', async () => {
    const repo = { update: vi.fn().mockResolvedValue(false) };
    const handler = new UpdateItemHandler(repo as never, { publish: vi.fn() } as never);
    await expect(
      handler.execute(new UpdateItemCommand('u1', 'x', { favorite: true })),
    ).rejects.toBeInstanceOf(ItemNotFoundError);
  });

  it('emits item.updated on success', async () => {
    const repo = { update: vi.fn().mockResolvedValue(true) };
    const events = { publish: vi.fn() };
    const handler = new UpdateItemHandler(repo as never, events as never);
    await handler.execute(new UpdateItemCommand('u1', 'itm_1', { readState: 'read' }));
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });
});
