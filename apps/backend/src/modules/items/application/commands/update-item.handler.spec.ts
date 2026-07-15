import { describe, it, expect, vi } from 'vitest';
import { UpdateItemHandler } from './update-item.handler';
import { UpdateItemCommand } from './update-item.command';
import { ItemNotFoundError } from '../../domain/items.errors';
import type { ExtractStatus, ItemDetail, ItemKind } from '../../domain/items.ports';

function makeItem(overrides: Partial<ItemDetail> = {}): ItemDetail {
  return {
    id: 'itm_1',
    url: 'https://x.com/a',
    kind: 'bookmark',
    canonicalUrl: null,
    title: null,
    siteName: null,
    excerpt: null,
    leadImageUrl: null,
    faviconUrl: null,
    status: 'ready',
    extractStatus: 'none',
    readState: 'unread',
    favorite: false,
    savedAt: '2026-07-01T00:00:00.000Z',
    readAt: null,
    tags: [],
    shelves: [],
    ...overrides,
  };
}

function makeRepo(before: ItemDetail | null) {
  return {
    findById: vi.fn().mockResolvedValue(before),
    update: vi.fn().mockResolvedValue(true),
    setExtractStatus: vi.fn().mockResolvedValue(undefined),
  };
}

describe('UpdateItemHandler', () => {
  it('throws when the item is not owned', async () => {
    const repo = makeRepo(null);
    repo.update.mockResolvedValue(false);
    const handler = new UpdateItemHandler(
      repo as never,
      { publish: vi.fn() } as never,
      { enqueue: vi.fn() } as never,
    );
    await expect(
      handler.execute(new UpdateItemCommand('u1', 'x', { favorite: true })),
    ).rejects.toBeInstanceOf(ItemNotFoundError);
  });

  it('emits item.updated on success', async () => {
    const repo = makeRepo(makeItem({ kind: 'article' }));
    const events = { publish: vi.fn() };
    const handler = new UpdateItemHandler(
      repo as never,
      events as never,
      {
        enqueue: vi.fn(),
      } as never,
    );
    await handler.execute(new UpdateItemCommand('u1', 'itm_1', { readState: 'read' }));
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });

  it('forwards a kind change to the repo and emits item.updated', async () => {
    const repo = makeRepo(makeItem());
    const events = { publish: vi.fn() };
    const handler = new UpdateItemHandler(
      repo as never,
      events as never,
      {
        enqueue: vi.fn(),
      } as never,
    );
    await handler.execute(new UpdateItemCommand('u1', 'itm_1', { kind: 'article' }));
    expect(repo.update).toHaveBeenCalledWith('u1', 'itm_1', { kind: 'article' });
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });

  // ── Promotion → auto-extract ────────────────────────────────────────────────
  // A bookmark skipped the fetch_metadata auto-extract chain (kind gate), so it
  // sits at extractStatus 'none'. Promoting it to an article must enqueue the
  // extraction — nothing else ever will (the backfill bootstrap is marker-guarded).

  it('enqueues extraction when a bookmark with extractStatus none is promoted', async () => {
    const repo = makeRepo(makeItem({ kind: 'bookmark', extractStatus: 'none' }));
    const jobs = { enqueue: vi.fn().mockResolvedValue(undefined) };
    const handler = new UpdateItemHandler(
      repo as never,
      { publish: vi.fn() } as never,
      jobs as never,
    );

    await handler.execute(new UpdateItemCommand('u1', 'itm_1', { kind: 'article' }));

    expect(repo.setExtractStatus).toHaveBeenCalledWith('itm_1', 'extracting');
    expect(jobs.enqueue).toHaveBeenCalledWith('extract_article', {
      userId: 'u1',
      itemId: 'itm_1',
    });
  });

  it.each<ExtractStatus>(['extracting', 'ready', 'failed'])(
    'does not re-enqueue a promoted bookmark whose extractStatus is %s',
    async (extractStatus) => {
      const repo = makeRepo(makeItem({ kind: 'bookmark', extractStatus }));
      const jobs = { enqueue: vi.fn() };
      const handler = new UpdateItemHandler(
        repo as never,
        { publish: vi.fn() } as never,
        jobs as never,
      );

      await handler.execute(new UpdateItemCommand('u1', 'itm_1', { kind: 'article' }));

      expect(jobs.enqueue).not.toHaveBeenCalled();
      expect(repo.setExtractStatus).not.toHaveBeenCalled();
    },
  );

  it('does not enqueue when the item was already an article (no-op kind patch)', async () => {
    const repo = makeRepo(makeItem({ kind: 'article', extractStatus: 'none' }));
    const jobs = { enqueue: vi.fn() };
    const handler = new UpdateItemHandler(
      repo as never,
      { publish: vi.fn() } as never,
      jobs as never,
    );

    await handler.execute(new UpdateItemCommand('u1', 'itm_1', { kind: 'article' }));

    expect(jobs.enqueue).not.toHaveBeenCalled();
  });

  it.each<ItemKind | undefined>(['bookmark', undefined])(
    'does not enqueue when the patch does not promote to article (kind=%s)',
    async (kind) => {
      const repo = makeRepo(makeItem({ kind: 'article', extractStatus: 'none' }));
      const jobs = { enqueue: vi.fn() };
      const handler = new UpdateItemHandler(
        repo as never,
        { publish: vi.fn() } as never,
        jobs as never,
      );

      await handler.execute(
        new UpdateItemCommand('u1', 'itm_1', kind === undefined ? { favorite: true } : { kind }),
      );

      expect(jobs.enqueue).not.toHaveBeenCalled();
    },
  );

  it('reverts extractStatus to none and still succeeds when the enqueue fails', async () => {
    const repo = makeRepo(makeItem({ kind: 'bookmark', extractStatus: 'none' }));
    const jobs = { enqueue: vi.fn().mockRejectedValue(new Error('db down')) };
    const events = { publish: vi.fn() };
    const handler = new UpdateItemHandler(repo as never, events as never, jobs as never);

    // The kind change already committed — a chain failure must not fail the PATCH
    // nor leave a perpetual 'extracting' spinner.
    await expect(
      handler.execute(new UpdateItemCommand('u1', 'itm_1', { kind: 'article' })),
    ).resolves.toBeUndefined();

    expect(repo.setExtractStatus).toHaveBeenLastCalledWith('itm_1', 'none');
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });

  it('swallows a failing revert (best-effort) without failing the PATCH', async () => {
    const repo = makeRepo(makeItem({ kind: 'bookmark', extractStatus: 'none' }));
    repo.setExtractStatus
      .mockResolvedValueOnce(undefined) // 'extracting'
      .mockRejectedValueOnce(new Error('revert failed')); // 'none'
    const jobs = { enqueue: vi.fn().mockRejectedValue(new Error('db down')) };
    const handler = new UpdateItemHandler(
      repo as never,
      { publish: vi.fn() } as never,
      jobs as never,
    );

    await expect(
      handler.execute(new UpdateItemCommand('u1', 'itm_1', { kind: 'article' })),
    ).resolves.toBeUndefined();
  });
});
