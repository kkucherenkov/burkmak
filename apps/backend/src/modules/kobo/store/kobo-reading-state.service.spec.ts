import { describe, expect, it, vi } from 'vitest';

import { KoboReadingStateService } from './kobo-reading-state.service';
import { KoboEntitlementNotFoundError } from './kobo.errors';
import type { EntitlementWithItem } from './kobo-sync.repo';

const UUID = '11111111-1111-1111-1111-111111111111';

const ENTITLEMENT_NO_STATE: EntitlementWithItem = {
  uuid: UUID,
  itemId: 'item-1',
  createdAt: new Date('2026-06-01T00:00:00.000Z'),
  item: {
    id: 'item-1',
    title: 'Title',
    siteName: 'example.com',
    excerpt: null,
    savedAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    readState: 'unread',
  },
  articleExtractedAt: null,
  coverImageKey: null,
  readingState: null,
};

function makeRepo(
  overrides: {
    entitlement?: EntitlementWithItem | null;
    upsertResult?: { priorityTimestamp: Date; lastModified: Date };
  } = {},
) {
  return {
    findEntitlementByUuid: vi
      .fn()
      .mockResolvedValue(
        overrides.entitlement === undefined ? ENTITLEMENT_NO_STATE : overrides.entitlement,
      ),
    upsertReadingState: vi.fn().mockResolvedValue(
      overrides.upsertResult ?? {
        priorityTimestamp: new Date('2026-07-01T00:00:00.000Z'),
        lastModified: new Date('2026-07-01T00:00:00.000Z'),
      },
    ),
  };
}

function makeItemRepo() {
  return { update: vi.fn().mockResolvedValue(true) };
}

describe('KoboReadingStateService.getState', () => {
  it('throws KoboEntitlementNotFoundError for an unknown uuid', async () => {
    const repo = makeRepo({ entitlement: null });
    const service = new KoboReadingStateService(repo as never, makeItemRepo() as never);

    await expect(service.getState('u1', UUID)).rejects.toBeInstanceOf(KoboEntitlementNotFoundError);
  });

  it('returns the default ReadingState (ReadyToRead) when nothing is stored', async () => {
    const repo = makeRepo();
    const service = new KoboReadingStateService(repo as never, makeItemRepo() as never);

    const result = await service.getState('u1', UUID);

    expect(result).toHaveLength(1);
    expect(result[0]?.EntitlementId).toBe(UUID);
    expect(result[0]?.StatusInfo).toEqual({ Status: 'ReadyToRead', TimesStartedReading: 0 });
  });

  it('returns the stored reading state, verbatim, when present', async () => {
    const withState: EntitlementWithItem = {
      ...ENTITLEMENT_NO_STATE,
      readingState: {
        statusInfo: JSON.stringify({ Status: 'Finished', TimesStartedReading: 3 }),
        statistics: null,
        currentBookmark: null,
        priorityTimestamp: new Date('2026-07-02T00:00:00.000Z'),
        createdAt: new Date('2026-06-15T00:00:00.000Z'),
        lastModified: new Date('2026-07-02T00:00:00.000Z'),
      },
    };
    const repo = makeRepo({ entitlement: withState });
    const service = new KoboReadingStateService(repo as never, makeItemRepo() as never);

    const result = await service.getState('u1', UUID);

    expect(result[0]?.StatusInfo).toEqual({ Status: 'Finished', TimesStartedReading: 3 });
    expect(result[0]?.LastModified).toBe('2026-07-02T00:00:00.000Z');
  });
});

describe('KoboReadingStateService.putState', () => {
  it('throws KoboEntitlementNotFoundError when the entitlement is unknown or orphaned', async () => {
    const repo = makeRepo({ entitlement: null });
    const service = new KoboReadingStateService(repo as never, makeItemRepo() as never);

    await expect(service.putState('u1', UUID, { ReadingStates: [] })).rejects.toBeInstanceOf(
      KoboEntitlementNotFoundError,
    );
  });

  it('maps StatusInfo.Status "Finished" to readState "read"', async () => {
    const repo = makeRepo();
    const itemRepo = makeItemRepo();
    const service = new KoboReadingStateService(repo as never, itemRepo as never);

    await service.putState('u1', UUID, { ReadingStates: [{ StatusInfo: { Status: 'Finished' } }] });

    expect(itemRepo.update).toHaveBeenCalledWith('u1', 'item-1', { readState: 'read' });
  });

  it('maps StatusInfo.Status "ReadyToRead" to readState "unread"', async () => {
    const repo = makeRepo();
    const itemRepo = makeItemRepo();
    const service = new KoboReadingStateService(repo as never, itemRepo as never);

    await service.putState('u1', UUID, {
      ReadingStates: [{ StatusInfo: { Status: 'ReadyToRead' } }],
    });

    expect(itemRepo.update).toHaveBeenCalledWith('u1', 'item-1', { readState: 'unread' });
  });

  it('leaves readState untouched (no ITEM_REPO.update call) for StatusInfo.Status "Reading"', async () => {
    const repo = makeRepo();
    const itemRepo = makeItemRepo();
    const service = new KoboReadingStateService(repo as never, itemRepo as never);

    await service.putState('u1', UUID, { ReadingStates: [{ StatusInfo: { Status: 'Reading' } }] });

    expect(itemRepo.update).not.toHaveBeenCalled();
  });

  it('always upserts the verbatim JSON regardless of status', async () => {
    const repo = makeRepo();
    const itemRepo = makeItemRepo();
    const service = new KoboReadingStateService(repo as never, itemRepo as never);

    await service.putState('u1', UUID, {
      ReadingStates: [
        {
          StatusInfo: { Status: 'Reading' },
          Statistics: { SpentReadingMinutes: 5 },
          CurrentBookmark: { Location: { Value: 'x' } },
        },
      ],
    });

    expect(repo.upsertReadingState).toHaveBeenCalledWith('u1', 'item-1', {
      statusInfo: JSON.stringify({ Status: 'Reading' }),
      statistics: JSON.stringify({ SpentReadingMinutes: 5 }),
      currentBookmark: JSON.stringify({ Location: { Value: 'x' } }),
    });
  });

  it('returns the RequestResult/UpdateResults response shape', async () => {
    const repo = makeRepo({
      upsertResult: {
        priorityTimestamp: new Date('2026-07-03T00:00:00.000Z'),
        lastModified: new Date('2026-07-03T00:00:00.000Z'),
      },
    });
    const service = new KoboReadingStateService(repo as never, makeItemRepo() as never);

    const response = await service.putState('u1', UUID, {
      ReadingStates: [{ StatusInfo: { Status: 'Finished' } }],
    });

    expect(response).toEqual({
      RequestResult: 'Success',
      UpdateResults: [
        {
          EntitlementId: UUID,
          CurrentBookmarkResult: { Result: 'Success' },
          StatisticsResult: { Result: 'Success' },
          StatusInfoResult: { Result: 'Success' },
          LastModified: '2026-07-03T00:00:00.000Z',
          PriorityTimestamp: '2026-07-03T00:00:00.000Z',
        },
      ],
    });
  });

  it('tolerates a missing/malformed ReadingStates body (empty UpdateResults)', async () => {
    const repo = makeRepo();
    const service = new KoboReadingStateService(repo as never, makeItemRepo() as never);

    const response = await service.putState('u1', UUID, {});

    expect(response).toEqual({ RequestResult: 'Success', UpdateResults: [] });
  });
});
