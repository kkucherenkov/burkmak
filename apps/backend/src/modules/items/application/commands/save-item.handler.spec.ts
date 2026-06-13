import { describe, it, expect, vi } from 'vitest';
import { SaveItemHandler } from './save-item.handler';
import { SaveItemCommand } from './save-item.command';

describe('SaveItemHandler', () => {
  it('creates a pending item, enqueues fetch_metadata, emits item.created', async () => {
    const repo = { create: vi.fn().mockResolvedValue('itm_1') };
    const jobs = { enqueue: vi.fn().mockResolvedValue({ id: 'job_1' }) };
    const events = { publish: vi.fn() };
    const handler = new SaveItemHandler(repo as never, jobs as never, events as never);

    const res = await handler.execute(new SaveItemCommand('u1', 'https://x.com'));

    expect(res).toEqual({ id: 'itm_1' });
    expect(repo.create).toHaveBeenCalledWith({ userId: 'u1', url: 'https://x.com' });
    expect(jobs.enqueue).toHaveBeenCalledWith('fetch_metadata', { userId: 'u1', itemId: 'itm_1' });
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.created', { id: 'itm_1' });
  });
});
