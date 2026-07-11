import { Inject, Injectable } from '@nestjs/common';

import { ITEM_REPO, type IItemRepo, type ReadState } from '../../items/domain/items.ports';
import { buildReadingStatePayload, type ReadingStatePayload } from './entitlement.builder';
import { KoboEntitlementNotFoundError } from './kobo.errors';
import { KoboSyncRepo } from './kobo-sync.repo';

export interface UpdateResult {
  EntitlementId: string;
  CurrentBookmarkResult: { Result: 'Success' };
  StatisticsResult: { Result: 'Success' };
  StatusInfoResult: { Result: 'Success' };
  LastModified: string;
  PriorityTimestamp: string;
}

export interface PutStateResponse {
  RequestResult: 'Success';
  UpdateResults: UpdateResult[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Device `StatusInfo.Status` → burkmak `readState`. `Reading` (and anything unknown) is a no-op. */
function mapStatusToReadState(status: string | undefined): ReadState | undefined {
  if (status === 'Finished') return 'read';
  if (status === 'ReadyToRead') return 'unread';
  return undefined;
}

interface ParsedDeviceState {
  status: string | undefined;
  statusInfoJson: string;
  statisticsJson: string | null;
  currentBookmarkJson: string | null;
}

/** Parse one `ReadingStates[]` entry from the device's PUT body — tolerant of missing keys. */
function parseDeviceState(raw: unknown): ParsedDeviceState {
  const entry = isRecord(raw) ? raw : {};
  const statusInfo = isRecord(entry['StatusInfo']) ? entry['StatusInfo'] : {};
  const statistics = entry['Statistics'];
  const currentBookmark = entry['CurrentBookmark'];
  const status = typeof statusInfo['Status'] === 'string' ? statusInfo['Status'] : undefined;

  return {
    status,
    statusInfoJson: JSON.stringify(statusInfo),
    statisticsJson: isRecord(statistics) ? JSON.stringify(statistics) : null,
    currentBookmarkJson: isRecord(currentBookmark) ? JSON.stringify(currentBookmark) : null,
  };
}

@Injectable()
export class KoboReadingStateService {
  constructor(
    private readonly repo: KoboSyncRepo,
    @Inject(ITEM_REPO) private readonly itemRepo: IItemRepo,
  ) {}

  /** GET /v1/library/:uuid/state — current (or default) reading state for one entitlement. */
  async getState(userId: string, uuid: string): Promise<ReadingStatePayload[]> {
    const entitlement = await this.repo.findEntitlementByUuid(userId, uuid);
    if (!entitlement?.item) {
      throw new KoboEntitlementNotFoundError(uuid);
    }

    const stored = entitlement.readingState;
    const payload = buildReadingStatePayload({
      entitlementUuid: uuid,
      timestamp: stored ? stored.createdAt.toISOString() : entitlement.item.savedAt.toISOString(),
      ...(stored
        ? {
            stored: {
              statusInfo: stored.statusInfo,
              statistics: stored.statistics,
              currentBookmark: stored.currentBookmark,
              priorityTimestamp: stored.priorityTimestamp.toISOString(),
              lastModified: stored.lastModified.toISOString(),
            },
          }
        : {}),
    });

    return [payload];
  }

  /** PUT /v1/library/:uuid/state — persist device-reported progress, flip readState on Finished/ReadyToRead. */
  async putState(userId: string, uuid: string, body: unknown): Promise<PutStateResponse> {
    const entitlement = await this.repo.findEntitlementByUuid(userId, uuid);
    if (entitlement?.itemId == null) {
      throw new KoboEntitlementNotFoundError(uuid);
    }
    const itemId = entitlement.itemId;

    const rawStates =
      isRecord(body) && Array.isArray(body['ReadingStates']) ? body['ReadingStates'] : [];

    const updateResults: UpdateResult[] = [];
    for (const rawState of rawStates) {
      const parsed = parseDeviceState(rawState);

      const row = await this.repo.upsertReadingState(userId, itemId, {
        statusInfo: parsed.statusInfoJson,
        statistics: parsed.statisticsJson,
        currentBookmark: parsed.currentBookmarkJson,
      });

      const readState = mapStatusToReadState(parsed.status);
      if (readState) {
        await this.itemRepo.update(userId, itemId, { readState });
      }

      updateResults.push({
        EntitlementId: uuid,
        CurrentBookmarkResult: { Result: 'Success' },
        StatisticsResult: { Result: 'Success' },
        StatusInfoResult: { Result: 'Success' },
        LastModified: row.lastModified.toISOString(),
        PriorityTimestamp: row.priorityTimestamp.toISOString(),
      });
    }

    return { RequestResult: 'Success', UpdateResults: updateResults };
  }
}
