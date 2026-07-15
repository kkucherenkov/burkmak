import { Injectable } from '@nestjs/common';

import { EpubCache } from '../infra/epub.cache';
import {
  buildBookEntitlement,
  buildBookMetadata,
  buildReadingStatePayload,
} from './entitlement.builder';
import { KoboSyncRepo } from './kobo-sync.repo';
import { decodeSyncToken, encodeSyncToken } from './sync-token';

/** Nickel treats a full page as "more to fetch" — matches Calibre-Web's page size. */
const SYNC_PAGE_SIZE = 100;
const DOWNLOAD_SUFFIX = '.kepub.epub';

export interface SyncResult {
  body: unknown[];
  syncToken: string;
  continue: boolean;
}

/** Byte size of the built KEPUB, or 0 when it hasn't been cached to disk yet. */
export function epubSizeBytes(cache: EpubCache, itemId: string, extractedAt: Date | null): number {
  if (!extractedAt) return 0;
  return cache.size(cache.cachePath(itemId, 'kepub', extractedAt.toISOString()));
}

export function buildDownloadUrl(mountBase: string, uuid: string): string {
  return `${mountBase}/v1/download/${uuid}${DOWNLOAD_SUFFIX}`;
}

/** Lexical max of two ISO-8601 UTC timestamps (safe because they share format/precision). */
function laterIso(a: string, b: string): string {
  return a >= b ? a : b;
}

@Injectable()
export class KoboSyncService {
  constructor(
    private readonly repo: KoboSyncRepo,
    private readonly epubCache: EpubCache,
  ) {}

  async sync(
    userId: string,
    tokenHeader: string | undefined,
    mountBase: string,
  ): Promise<SyncResult> {
    const token = decodeSyncToken(tokenHeader);
    const now = new Date().toISOString();

    // 1. New: ready-extracted items never emitted before (no entitlement row).
    const newItems = await this.repo.findUnsyncedReadyItems(userId, SYNC_PAGE_SIZE);
    const newIds = new Set(newItems.map((item) => item.id));

    let booksLastModified = token.booksLastModified;
    const newEntries: unknown[] = [];
    for (const item of newItems) {
      const uuid = await this.repo.createEntitlement(userId, item.id);
      const bookEntitlement = buildBookEntitlement({ uuid, created: now, lastModified: now });
      const bookMetadata = buildBookMetadata({
        uuid,
        title: item.title ?? 'Untitled',
        publicationDate: item.savedAt.toISOString(),
        excerpt: item.excerpt,
        siteName: item.siteName,
        downloadUrl: buildDownloadUrl(mountBase, uuid),
        sizeBytes: epubSizeBytes(this.epubCache, item.id, item.articleExtractedAt),
      });
      const readingState = buildReadingStatePayload({ entitlementUuid: uuid, timestamp: now });
      newEntries.push({
        NewEntitlement: {
          BookEntitlement: bookEntitlement,
          BookMetadata: bookMetadata,
          ReadingState: readingState,
        },
      });
      booksLastModified = laterIso(booksLastModified, item.updatedAt.toISOString());
    }

    // 2. Changed: already-entitled items whose Item.updatedAt advanced, minus this batch's new items.
    const changedItemRows = await this.repo.findChangedItems(userId, token.booksLastModified);
    const changedItems = changedItemRows.filter((item) => !newIds.has(item.itemId));

    const changedEntries: unknown[] = [];
    for (const item of changedItems) {
      const bookEntitlement = buildBookEntitlement({
        uuid: item.entitlementUuid,
        created: item.entitlementCreatedAt.toISOString(),
        lastModified: item.updatedAt.toISOString(),
        isRemoved: item.readState === 'archived',
      });
      const bookMetadata = buildBookMetadata({
        uuid: item.entitlementUuid,
        title: item.title ?? 'Untitled',
        publicationDate: item.savedAt.toISOString(),
        excerpt: item.excerpt,
        siteName: item.siteName,
        downloadUrl: buildDownloadUrl(mountBase, item.entitlementUuid),
        sizeBytes: epubSizeBytes(this.epubCache, item.itemId, item.articleExtractedAt),
      });
      changedEntries.push({
        ChangedEntitlement: { BookEntitlement: bookEntitlement, BookMetadata: bookMetadata },
      });
      booksLastModified = laterIso(booksLastModified, item.updatedAt.toISOString());
    }

    // 3. Tombstones: entitlements that must leave the device — item deleted (itemId
    //    SET NULL) or demoted to a bookmark — emit removal, then purge.
    const orphans = await this.repo.findOrphanedEntitlements(userId);
    for (const orphan of orphans) {
      const bookEntitlement = buildBookEntitlement({
        uuid: orphan.uuid,
        created: orphan.createdAt.toISOString(),
        lastModified: now,
        isRemoved: true,
      });
      // The item is gone — only a minimal metadata stub is available, but Nickel expects the key.
      const bookMetadata = buildBookMetadata({
        uuid: orphan.uuid,
        title: '',
        publicationDate: orphan.createdAt.toISOString(),
        excerpt: null,
        siteName: null,
        downloadUrl: buildDownloadUrl(mountBase, orphan.uuid),
        sizeBytes: 0,
      });
      changedEntries.push({
        ChangedEntitlement: { BookEntitlement: bookEntitlement, BookMetadata: bookMetadata },
      });
    }
    if (orphans.length > 0) {
      await this.repo.purgeOrphans(
        userId,
        orphans.map((orphan) => orphan.uuid),
      );
    }

    // 4. Reading-state deltas, minus items already carried as NewEntitlement (their ReadingState is embedded).
    const readingStateRowsAll = await this.repo.findChangedReadingStates(
      userId,
      token.readingStateLastModified,
    );
    const readingStateRows = readingStateRowsAll.filter((row) => !newIds.has(row.itemId));

    let readingStateLastModified = token.readingStateLastModified;
    const readingStateEntries: unknown[] = [];
    for (const row of readingStateRows) {
      readingStateLastModified = laterIso(readingStateLastModified, row.lastModified.toISOString());
      const readingState = buildReadingStatePayload({
        entitlementUuid: row.entitlementUuid,
        timestamp: row.createdAt.toISOString(),
        stored: {
          statusInfo: row.statusInfo,
          statistics: row.statistics,
          currentBookmark: row.currentBookmark,
          priorityTimestamp: row.priorityTimestamp.toISOString(),
          lastModified: row.lastModified.toISOString(),
        },
      });
      readingStateEntries.push({ ChangedReadingState: { ReadingState: readingState } });
    }

    const syncToken = encodeSyncToken({
      booksLastModified,
      readingStateLastModified,
      // No separate archive tracking — archived items ride the same Item.updatedAt delta.
      archiveLastModified: booksLastModified,
    });

    return {
      body: [...newEntries, ...changedEntries, ...readingStateEntries],
      syncToken,
      continue: newItems.length === SYNC_PAGE_SIZE,
    };
  }
}
