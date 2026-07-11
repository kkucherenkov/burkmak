import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Device-sync projections. Kept as a plain Prisma-backed repo (not an
 * IItemRepo/IArticleRepo extension) because the shapes here are specific to
 * the Kobo delta protocol — reusing the generic item ports would force them
 * to carry Kobo-only concerns.
 */

export interface UnsyncedItem {
  id: string;
  title: string | null;
  siteName: string | null;
  excerpt: string | null;
  savedAt: Date;
  updatedAt: Date;
  articleExtractedAt: Date | null;
  coverImageKey: string | null;
}

export interface ChangedItem {
  itemId: string;
  entitlementUuid: string;
  entitlementCreatedAt: Date;
  title: string | null;
  siteName: string | null;
  excerpt: string | null;
  savedAt: Date;
  updatedAt: Date;
  readState: string;
  articleExtractedAt: Date | null;
  coverImageKey: string | null;
}

export interface OrphanedEntitlement {
  uuid: string;
  createdAt: Date;
}

export interface ChangedReadingStateRow {
  itemId: string;
  entitlementUuid: string;
  statusInfo: string;
  statistics: string | null;
  currentBookmark: string | null;
  priorityTimestamp: Date;
  createdAt: Date;
  lastModified: Date;
}

/** Result of `findEntitlementByUuid` — feeds metadata/state/download/delete/cover routes. */
export interface EntitlementWithItem {
  uuid: string;
  itemId: string | null;
  createdAt: Date;
  item: {
    id: string;
    title: string | null;
    siteName: string | null;
    excerpt: string | null;
    savedAt: Date;
    updatedAt: Date;
    readState: string;
  } | null;
  articleExtractedAt: Date | null;
  coverImageKey: string | null;
  readingState: {
    statusInfo: string;
    statistics: string | null;
    currentBookmark: string | null;
    priorityTimestamp: Date;
    createdAt: Date;
    lastModified: Date;
  } | null;
}

@Injectable()
export class KoboSyncRepo {
  constructor(private readonly prisma: PrismaService) {}

  /** Ready-extracted, non-archived items with no entitlement row yet — oldest first. */
  async findUnsyncedReadyItems(userId: string, limit: number): Promise<UnsyncedItem[]> {
    const rows = await this.prisma.item.findMany({
      where: {
        userId,
        extractStatus: 'ready',
        readState: { not: 'archived' },
        koboEntitlement: { is: null },
      },
      select: {
        id: true,
        title: true,
        siteName: true,
        excerpt: true,
        savedAt: true,
        updatedAt: true,
        article: { select: { extractedAt: true, coverImageKey: true } },
      },
      orderBy: { savedAt: 'asc' },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      siteName: row.siteName,
      excerpt: row.excerpt,
      savedAt: row.savedAt,
      updatedAt: row.updatedAt,
      articleExtractedAt: row.article?.extractedAt ?? null,
      coverImageKey: row.article?.coverImageKey ?? null,
    }));
  }

  /** Create the entitlement row that marks `itemId` as "already emitted"; returns its uuid. */
  async createEntitlement(userId: string, itemId: string): Promise<string> {
    const row = await this.prisma.koboEntitlement.create({ data: { userId, itemId } });
    return row.uuid;
  }

  /** Entitled items whose Item.updatedAt advanced past `sinceIso`. */
  async findChangedItems(userId: string, sinceIso: string): Promise<ChangedItem[]> {
    const rows = await this.prisma.item.findMany({
      where: {
        userId,
        updatedAt: { gt: new Date(sinceIso) },
        koboEntitlement: { isNot: null },
      },
      select: {
        id: true,
        title: true,
        siteName: true,
        excerpt: true,
        savedAt: true,
        updatedAt: true,
        readState: true,
        article: { select: { extractedAt: true, coverImageKey: true } },
        koboEntitlement: { select: { uuid: true, createdAt: true } },
      },
      orderBy: { updatedAt: 'asc' },
    });

    const result: ChangedItem[] = [];
    for (const row of rows) {
      if (!row.koboEntitlement) continue; // filtered by isNot:null above; guards the type
      result.push({
        itemId: row.id,
        entitlementUuid: row.koboEntitlement.uuid,
        entitlementCreatedAt: row.koboEntitlement.createdAt,
        title: row.title,
        siteName: row.siteName,
        excerpt: row.excerpt,
        savedAt: row.savedAt,
        updatedAt: row.updatedAt,
        readState: row.readState,
        articleExtractedAt: row.article?.extractedAt ?? null,
        coverImageKey: row.article?.coverImageKey ?? null,
      });
    }
    return result;
  }

  /** Entitlement rows whose item was deleted (`itemId` went `SET NULL`). */
  async findOrphanedEntitlements(userId: string): Promise<OrphanedEntitlement[]> {
    return this.prisma.koboEntitlement.findMany({
      where: { userId, itemId: null },
      select: { uuid: true, createdAt: true },
    });
  }

  async purgeOrphans(userId: string, uuids: string[]): Promise<void> {
    if (uuids.length === 0) return;
    await this.prisma.koboEntitlement.deleteMany({ where: { userId, uuid: { in: uuids } } });
  }

  /** Reading-state rows updated past `sinceIso`, resolved to their entitlement uuid. */
  async findChangedReadingStates(
    userId: string,
    sinceIso: string,
  ): Promise<ChangedReadingStateRow[]> {
    const rows = await this.prisma.koboReadingState.findMany({
      where: { userId, lastModified: { gt: new Date(sinceIso) } },
      select: {
        itemId: true,
        statusInfo: true,
        statistics: true,
        currentBookmark: true,
        priorityTimestamp: true,
        createdAt: true,
        lastModified: true,
        item: { select: { koboEntitlement: { select: { uuid: true } } } },
      },
      orderBy: { lastModified: 'asc' },
    });

    const result: ChangedReadingStateRow[] = [];
    for (const row of rows) {
      const uuid = row.item.koboEntitlement?.uuid;
      if (uuid === undefined) continue; // no entitlement (shouldn't happen — state PUT requires one)
      result.push({
        itemId: row.itemId,
        entitlementUuid: uuid,
        statusInfo: row.statusInfo,
        statistics: row.statistics,
        currentBookmark: row.currentBookmark,
        priorityTimestamp: row.priorityTimestamp,
        createdAt: row.createdAt,
        lastModified: row.lastModified,
      });
    }
    return result;
  }

  /** Single entitlement lookup, scoped to userId — feeds metadata/state/download/delete/cover routes. */
  async findEntitlementByUuid(userId: string, uuid: string): Promise<EntitlementWithItem | null> {
    const row = await this.prisma.koboEntitlement.findFirst({
      where: { uuid, userId },
      select: {
        uuid: true,
        itemId: true,
        createdAt: true,
        item: {
          select: {
            id: true,
            title: true,
            siteName: true,
            excerpt: true,
            savedAt: true,
            updatedAt: true,
            readState: true,
            article: { select: { extractedAt: true, coverImageKey: true } },
            koboReadingState: {
              select: {
                statusInfo: true,
                statistics: true,
                currentBookmark: true,
                priorityTimestamp: true,
                createdAt: true,
                lastModified: true,
              },
            },
          },
        },
      },
    });
    if (!row) return null;

    return {
      uuid: row.uuid,
      itemId: row.itemId,
      createdAt: row.createdAt,
      item: row.item
        ? {
            id: row.item.id,
            title: row.item.title,
            siteName: row.item.siteName,
            excerpt: row.item.excerpt,
            savedAt: row.item.savedAt,
            updatedAt: row.item.updatedAt,
            readState: row.item.readState,
          }
        : null,
      articleExtractedAt: row.item?.article?.extractedAt ?? null,
      coverImageKey: row.item?.article?.coverImageKey ?? null,
      readingState: row.item?.koboReadingState ?? null,
    };
  }

  /** Upsert the device-reported reading state (verbatim JSON columns); returns the fresh timestamps. */
  async upsertReadingState(
    userId: string,
    itemId: string,
    data: { statusInfo: string; statistics: string | null; currentBookmark: string | null },
  ): Promise<{ priorityTimestamp: Date; lastModified: Date }> {
    return this.prisma.koboReadingState.upsert({
      where: { itemId },
      create: { itemId, userId, ...data, priorityTimestamp: new Date() },
      update: { ...data, priorityTimestamp: new Date() },
      select: { priorityTimestamp: true, lastModified: true },
    });
  }
}
