import { describe, expect, it, vi } from 'vitest';

import { decodeSyncToken } from './sync-token';
import { KoboSyncService } from './kobo-sync.service';
import type {
  ChangedItem,
  ChangedReadingStateRow,
  OrphanedEntitlement,
  UnsyncedItem,
} from './kobo-sync.repo';

const MOUNT_BASE = 'https://h/api/v1/kobo/burk_pat_abc123';
const EPOCH_TOKEN_HEADER = undefined; // decodes to zero-epoch defaults

function makeUnsyncedItem(index: number, overrides: Partial<UnsyncedItem> = {}): UnsyncedItem {
  return {
    id: `item-${index}`,
    title: `Title ${index}`,
    siteName: 'example.com',
    excerpt: 'excerpt',
    savedAt: new Date('2026-07-01T00:00:00.000Z'),
    updatedAt: new Date(`2026-07-0${(index % 9) + 1}T00:00:00.000Z`),
    articleExtractedAt: null,
    coverImageKey: null,
    ...overrides,
  };
}

function makeEpubCache() {
  return {
    cachePath: vi.fn().mockReturnValue('/data/epub/item/kepub-x.epub'),
    size: vi.fn().mockReturnValue(0),
  };
}

function makeRepo(overrides: {
  unsynced?: UnsyncedItem[];
  changed?: ChangedItem[];
  orphans?: OrphanedEntitlement[];
  readingStates?: ChangedReadingStateRow[];
}) {
  let uuidCounter = 0;
  return {
    findUnsyncedReadyItems: vi.fn().mockResolvedValue(overrides.unsynced ?? []),
    createEntitlement: vi.fn().mockImplementation(() => {
      uuidCounter += 1;
      return Promise.resolve(`new-uuid-${uuidCounter}`);
    }),
    findChangedItems: vi.fn().mockResolvedValue(overrides.changed ?? []),
    findOrphanedEntitlements: vi.fn().mockResolvedValue(overrides.orphans ?? []),
    purgeOrphans: vi.fn().mockResolvedValue(undefined),
    findChangedReadingStates: vi.fn().mockResolvedValue(overrides.readingStates ?? []),
  };
}

describe('KoboSyncService.sync', () => {
  it('emits a NewEntitlement per unsynced item and creates its entitlement row', async () => {
    const repo = makeRepo({ unsynced: [makeUnsyncedItem(1), makeUnsyncedItem(2)] });
    const service = new KoboSyncService(repo as never, makeEpubCache() as never);

    const result = await service.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);

    expect(repo.createEntitlement).toHaveBeenCalledTimes(2);
    expect(repo.createEntitlement).toHaveBeenCalledWith('u1', 'item-1');
    expect(repo.createEntitlement).toHaveBeenCalledWith('u1', 'item-2');
    expect(result.body).toHaveLength(2);

    const first = result.body[0] as {
      NewEntitlement: { BookEntitlement: { Id: string; IsRemoved: boolean } };
    };
    expect(first.NewEntitlement.BookEntitlement.Id).toBe('new-uuid-1');
    expect(first.NewEntitlement.BookEntitlement.IsRemoved).toBe(false);
  });

  it('sets continue=true only when a full page (100) of new items was emitted', async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => makeUnsyncedItem(i));
    const repoFull = makeRepo({ unsynced: fullPage });
    const serviceFull = new KoboSyncService(repoFull as never, makeEpubCache() as never);
    const fullResult = await serviceFull.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);
    expect(fullResult.continue).toBe(true);

    const shortPage = [makeUnsyncedItem(1), makeUnsyncedItem(2)];
    const repoShort = makeRepo({ unsynced: shortPage });
    const serviceShort = new KoboSyncService(repoShort as never, makeEpubCache() as never);
    const shortResult = await serviceShort.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);
    expect(shortResult.continue).toBe(false);
  });

  it('emits a ChangedEntitlement (not archived) for an already-entitled changed item', async () => {
    const changed: ChangedItem = {
      itemId: 'item-9',
      entitlementUuid: 'existing-uuid',
      entitlementCreatedAt: new Date('2026-06-01T00:00:00.000Z'),
      title: 'Existing',
      siteName: 'example.com',
      excerpt: null,
      savedAt: new Date('2026-06-01T00:00:00.000Z'),
      updatedAt: new Date('2026-07-05T00:00:00.000Z'),
      readState: 'read',
      articleExtractedAt: null,
      coverImageKey: null,
    };
    const repo = makeRepo({ changed: [changed] });
    const service = new KoboSyncService(repo as never, makeEpubCache() as never);

    const result = await service.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);

    expect(result.body).toHaveLength(1);
    const entry = result.body[0] as {
      ChangedEntitlement: {
        BookEntitlement: { Id: string; IsRemoved: boolean };
        BookMetadata: unknown;
      };
    };
    expect(entry.ChangedEntitlement.BookEntitlement.Id).toBe('existing-uuid');
    expect(entry.ChangedEntitlement.BookEntitlement.IsRemoved).toBe(false);
    expect(entry.ChangedEntitlement.BookMetadata).toBeDefined();
  });

  it('sets IsRemoved=true for a changed item whose readState is archived', async () => {
    const changed: ChangedItem = {
      itemId: 'item-9',
      entitlementUuid: 'existing-uuid',
      entitlementCreatedAt: new Date('2026-06-01T00:00:00.000Z'),
      title: 'Existing',
      siteName: null,
      excerpt: null,
      savedAt: new Date('2026-06-01T00:00:00.000Z'),
      updatedAt: new Date('2026-07-05T00:00:00.000Z'),
      readState: 'archived',
      articleExtractedAt: null,
      coverImageKey: null,
    };
    const repo = makeRepo({ changed: [changed] });
    const service = new KoboSyncService(repo as never, makeEpubCache() as never);

    const result = await service.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);

    const entry = result.body[0] as {
      ChangedEntitlement: { BookEntitlement: { IsRemoved: boolean } };
    };
    expect(entry.ChangedEntitlement.BookEntitlement.IsRemoved).toBe(true);
  });

  it('does not double-emit a new item as a changed item even if it now has an entitlement row', async () => {
    const newItem = makeUnsyncedItem(1);
    // findChangedItems is a separate query; a real repo wouldn't return the just-created
    // row within the same call, but the service must defensively exclude it if it did.
    const changedDuplicate: ChangedItem = {
      itemId: newItem.id,
      entitlementUuid: 'new-uuid-1',
      entitlementCreatedAt: new Date(),
      title: newItem.title,
      siteName: newItem.siteName,
      excerpt: newItem.excerpt,
      savedAt: newItem.savedAt,
      updatedAt: newItem.updatedAt,
      readState: 'unread',
      articleExtractedAt: null,
      coverImageKey: null,
    };
    const repo = makeRepo({ unsynced: [newItem], changed: [changedDuplicate] });
    const service = new KoboSyncService(repo as never, makeEpubCache() as never);

    const result = await service.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);

    expect(result.body).toHaveLength(1);
    expect(result.body[0]).toHaveProperty('NewEntitlement');
  });

  it('emits orphaned entitlements as ChangedEntitlement with IsRemoved=true, and purges them', async () => {
    const orphan: OrphanedEntitlement = {
      uuid: 'orphan-uuid',
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
    };
    const repo = makeRepo({ orphans: [orphan] });
    const service = new KoboSyncService(repo as never, makeEpubCache() as never);

    const result = await service.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);

    expect(result.body).toHaveLength(1);
    const entry = result.body[0] as {
      ChangedEntitlement: {
        BookEntitlement: { Id: string; IsRemoved: boolean };
        BookMetadata: { Title: string };
      };
    };
    expect(entry.ChangedEntitlement.BookEntitlement.Id).toBe('orphan-uuid');
    expect(entry.ChangedEntitlement.BookEntitlement.IsRemoved).toBe(true);
    expect(entry.ChangedEntitlement.BookMetadata.Title).toBe('');
    expect(repo.purgeOrphans).toHaveBeenCalledWith('u1', ['orphan-uuid']);
  });

  it('does not call purgeOrphans when there are no orphans', async () => {
    const repo = makeRepo({});
    const service = new KoboSyncService(repo as never, makeEpubCache() as never);
    await service.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);
    expect(repo.purgeOrphans).not.toHaveBeenCalled();
  });

  it('emits ChangedReadingState for reading-state deltas, excluding items also emitted as new', async () => {
    const newItem = makeUnsyncedItem(1);
    const readingStates: ChangedReadingStateRow[] = [
      {
        itemId: newItem.id, // should be excluded: already carried inside the NewEntitlement
        entitlementUuid: 'new-uuid-1',
        statusInfo: JSON.stringify({ Status: 'Reading' }),
        statistics: null,
        currentBookmark: null,
        priorityTimestamp: new Date('2026-07-01T00:00:00.000Z'),
        createdAt: new Date('2026-07-01T00:00:00.000Z'),
        lastModified: new Date('2026-07-01T00:00:00.000Z'),
      },
      {
        itemId: 'other-item',
        entitlementUuid: 'other-uuid',
        statusInfo: JSON.stringify({ Status: 'Finished' }),
        statistics: null,
        currentBookmark: null,
        priorityTimestamp: new Date('2026-07-06T00:00:00.000Z'),
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        lastModified: new Date('2026-07-06T00:00:00.000Z'),
      },
    ];
    const repo = makeRepo({ unsynced: [newItem], readingStates });
    const service = new KoboSyncService(repo as never, makeEpubCache() as never);

    const result = await service.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);

    // 1 NewEntitlement + 1 ChangedReadingState (the excluded one is dropped)
    expect(result.body).toHaveLength(2);
    const readingStateEntry = result.body.find(
      (entry): entry is { ChangedReadingState: { ReadingState: { EntitlementId: string } } } =>
        typeof entry === 'object' && entry !== null && 'ChangedReadingState' in entry,
    );
    expect(readingStateEntry?.ChangedReadingState.ReadingState.EntitlementId).toBe('other-uuid');
  });

  it('advances booksLastModified/readingStateLastModified in the returned sync token', async () => {
    const newItem = makeUnsyncedItem(1, { updatedAt: new Date('2026-07-10T00:00:00.000Z') });
    const readingStates: ChangedReadingStateRow[] = [
      {
        itemId: 'other-item',
        entitlementUuid: 'other-uuid',
        statusInfo: JSON.stringify({ Status: 'Finished' }),
        statistics: null,
        currentBookmark: null,
        priorityTimestamp: new Date('2026-07-11T00:00:00.000Z'),
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        lastModified: new Date('2026-07-11T00:00:00.000Z'),
      },
    ];
    const repo = makeRepo({ unsynced: [newItem], readingStates });
    const service = new KoboSyncService(repo as never, makeEpubCache() as never);

    const result = await service.sync('u1', EPOCH_TOKEN_HEADER, MOUNT_BASE);
    const decoded = decodeSyncToken(result.syncToken);

    expect(decoded.booksLastModified).toBe('2026-07-10T00:00:00.000Z');
    expect(decoded.readingStateLastModified).toBe('2026-07-11T00:00:00.000Z');
    expect(decoded.archiveLastModified).toBe(decoded.booksLastModified);
  });
});
