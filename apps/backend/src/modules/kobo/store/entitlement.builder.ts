/**
 * Pure builders for the Kobo store-API payload shapes. Key names follow
 * Calibre-Web's `cps/kobo.py` verbatim — Nickel (the device firmware) is
 * case-sensitive about them.
 */

export interface BookEntitlement {
  Id: string;
  RevisionId: string;
  CrossRevisionId: string;
  Status: 'Active';
  IsRemoved: boolean;
  Created: string;
  LastModified: string;
  Accessibility: 'Full';
  ActivePeriod: { From: string };
  IsLocked: boolean;
  IsHiddenFromArchive: boolean;
  OriginCategory: 'Imported';
}

export function buildBookEntitlement(params: {
  uuid: string;
  created: string;
  lastModified: string;
  isRemoved?: boolean;
}): BookEntitlement {
  return {
    Id: params.uuid,
    RevisionId: params.uuid,
    CrossRevisionId: params.uuid,
    Status: 'Active',
    IsRemoved: params.isRemoved ?? false,
    Created: params.created,
    LastModified: params.lastModified,
    Accessibility: 'Full',
    ActivePeriod: { From: params.created },
    IsLocked: false,
    IsHiddenFromArchive: false,
    OriginCategory: 'Imported',
  };
}

export interface BookMetadata {
  EntitlementId: string;
  RevisionId: string;
  CrossRevisionId: string;
  WorkId: string;
  Title: string;
  Language: string;
  PublicationDate: string;
  CoverImageId: string;
  Description: string;
  Publisher: { Name: string; Imprint: string };
  DownloadUrls: { Format: 'KEPUB'; Url: string; Size: number; Platform: 'Generic' }[];
  Genre: string;
  Categories: string[];
  IsSocialEnabled: boolean;
  IsEligibleForKoboLove: boolean;
  IsPreOrder: boolean;
  IsInternetArchive: boolean;
  CurrentDisplayPrice: { CurrencyCode: string; TotalAmount: number };
  CurrentLoveDisplayPrice: { TotalAmount: number };
}

/** Placeholder genre/category — burkmak has no genre taxonomy; Nickel requires a value. */
const FIXED_GENRE_UUID = '00000000-0000-0000-0000-000000000001';

export function buildBookMetadata(params: {
  uuid: string;
  title: string;
  publicationDate: string;
  excerpt: string | null;
  siteName: string | null;
  downloadUrl: string;
  sizeBytes: number;
}): BookMetadata {
  return {
    // Single edition, single work per article — reuse the entitlement uuid everywhere.
    EntitlementId: params.uuid,
    RevisionId: params.uuid,
    CrossRevisionId: params.uuid,
    WorkId: params.uuid,
    Title: params.title,
    Language: 'en',
    PublicationDate: params.publicationDate,
    CoverImageId: params.uuid,
    Description: params.excerpt ?? '',
    Publisher: { Name: params.siteName ?? 'burkmak', Imprint: '' },
    DownloadUrls: [
      { Format: 'KEPUB', Url: params.downloadUrl, Size: params.sizeBytes, Platform: 'Generic' },
    ],
    Genre: FIXED_GENRE_UUID,
    Categories: [FIXED_GENRE_UUID],
    IsSocialEnabled: true,
    IsEligibleForKoboLove: false,
    IsPreOrder: false,
    IsInternetArchive: false,
    CurrentDisplayPrice: { CurrencyCode: 'USD', TotalAmount: 0 },
    CurrentLoveDisplayPrice: { TotalAmount: 0 },
  };
}

export interface ReadingStatePayload {
  EntitlementId: string;
  Created: string;
  LastModified: string;
  PriorityTimestamp: string;
  StatusInfo: Record<string, unknown>;
  Statistics: Record<string, unknown>;
  CurrentBookmark: Record<string, unknown>;
}

/** `kobo_reading_state` columns — verbatim device JSON, read back for round-tripping. */
export interface StoredReadingState {
  statusInfo: string;
  statistics: string | null;
  currentBookmark: string | null;
  priorityTimestamp: string;
  lastModified: string;
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(raw);
  return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
}

/**
 * Build a ReadingState payload. With no `stored` row (item never reported
 * progress) every field defaults to `timestamp`/`ReadyToRead`. With a stored
 * row, its verbatim JSON columns are merged over the defaults so the device
 * gets back exactly what it last wrote (bookmark, statistics).
 */
export function buildReadingStatePayload(params: {
  entitlementUuid: string;
  timestamp: string;
  stored?: StoredReadingState;
}): ReadingStatePayload {
  const { entitlementUuid, timestamp, stored } = params;

  if (!stored) {
    return {
      EntitlementId: entitlementUuid,
      Created: timestamp,
      LastModified: timestamp,
      PriorityTimestamp: timestamp,
      StatusInfo: { Status: 'ReadyToRead', TimesStartedReading: 0 },
      Statistics: { LastModified: timestamp },
      CurrentBookmark: { LastModified: timestamp },
    };
  }

  return {
    EntitlementId: entitlementUuid,
    Created: timestamp,
    LastModified: stored.lastModified,
    PriorityTimestamp: stored.priorityTimestamp,
    StatusInfo: parseJsonObject(stored.statusInfo),
    Statistics: stored.statistics
      ? parseJsonObject(stored.statistics)
      : { LastModified: stored.lastModified },
    CurrentBookmark: stored.currentBookmark
      ? parseJsonObject(stored.currentBookmark)
      : { LastModified: stored.lastModified },
  };
}
