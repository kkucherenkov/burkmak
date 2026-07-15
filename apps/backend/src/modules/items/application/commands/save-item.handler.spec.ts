import { describe, it, expect, vi } from 'vitest';
import { SaveItemHandler } from './save-item.handler';
import { SaveItemCommand } from './save-item.command';

describe('SaveItemHandler', () => {
  it('creates a pending item, enqueues fetch_metadata, emits item.created', async () => {
    const repo = { create: vi.fn().mockResolvedValue('itm_1'), addTag: vi.fn() };
    const jobs = { enqueue: vi.fn().mockResolvedValue({ id: 'job_1' }) };
    const events = { publish: vi.fn() };
    const handler = new SaveItemHandler(repo as never, jobs as never, events as never);

    const res = await handler.execute(new SaveItemCommand('u1', 'https://x.com'));

    expect(res).toEqual({ id: 'itm_1' });
    expect(repo.create).toHaveBeenCalledWith({
      userId: 'u1',
      url: 'https://x.com',
      kind: 'article',
    });
    expect(repo.addTag).not.toHaveBeenCalled();
    expect(jobs.enqueue).toHaveBeenCalledWith('fetch_metadata', { userId: 'u1', itemId: 'itm_1' });
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.created', { id: 'itm_1' });
  });

  it('attaches each initial tag, then enqueues and emits', async () => {
    const repo = {
      create: vi.fn().mockResolvedValue('itm_2'),
      addTag: vi.fn().mockResolvedValue(true),
    };
    const jobs = { enqueue: vi.fn().mockResolvedValue({ id: 'job_2' }) };
    const events = { publish: vi.fn() };
    const handler = new SaveItemHandler(repo as never, jobs as never, events as never);

    const res = await handler.execute(new SaveItemCommand('u1', 'https://x.com', ['tech', 'news']));

    expect(res).toEqual({ id: 'itm_2' });
    expect(repo.addTag).toHaveBeenCalledTimes(2);
    expect(repo.addTag).toHaveBeenNthCalledWith(1, 'u1', 'itm_2', 'tech');
    expect(repo.addTag).toHaveBeenNthCalledWith(2, 'u1', 'itm_2', 'news');
    expect(jobs.enqueue).toHaveBeenCalledWith('fetch_metadata', { userId: 'u1', itemId: 'itm_2' });
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.created', { id: 'itm_2' });
  });

  it('creates a bookmark when kind=bookmark, still fetching metadata', async () => {
    const repo = { create: vi.fn().mockResolvedValue('itm_3'), addTag: vi.fn() };
    const jobs = { enqueue: vi.fn().mockResolvedValue({ id: 'job_3' }) };
    const events = { publish: vi.fn() };
    const handler = new SaveItemHandler(repo as never, jobs as never, events as never);

    const res = await handler.execute(
      new SaveItemCommand('u1', 'https://tool.dev', [], 'bookmark'),
    );

    expect(res).toEqual({ id: 'itm_3' });
    expect(repo.create).toHaveBeenCalledWith({
      userId: 'u1',
      url: 'https://tool.dev',
      kind: 'bookmark',
    });
    // metadata still runs (title/favicon); the auto-extract chain skips it by kind.
    expect(jobs.enqueue).toHaveBeenCalledWith('fetch_metadata', { userId: 'u1', itemId: 'itm_3' });
  });
});
