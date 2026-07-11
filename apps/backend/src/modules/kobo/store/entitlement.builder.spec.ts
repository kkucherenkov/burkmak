import { describe, expect, it } from 'vitest';

import {
  buildBookEntitlement,
  buildBookMetadata,
  buildReadingStatePayload,
} from './entitlement.builder';

const UUID = '11111111-1111-1111-1111-111111111111';
const CREATED = '2026-07-01T00:00:00.000Z';
const LAST_MODIFIED = '2026-07-05T00:00:00.000Z';

describe('buildBookEntitlement', () => {
  it('carries the exact Calibre-Web key names, uuid reused across Id/RevisionId/CrossRevisionId', () => {
    const entitlement = buildBookEntitlement({
      uuid: UUID,
      created: CREATED,
      lastModified: LAST_MODIFIED,
    });

    expect(entitlement).toEqual({
      Id: UUID,
      RevisionId: UUID,
      CrossRevisionId: UUID,
      Status: 'Active',
      IsRemoved: false,
      Created: CREATED,
      LastModified: LAST_MODIFIED,
      Accessibility: 'Full',
      ActivePeriod: { From: CREATED },
      IsLocked: false,
      IsHiddenFromArchive: false,
      OriginCategory: 'Imported',
    });
  });

  it('defaults IsRemoved to false, honours an explicit true', () => {
    expect(
      buildBookEntitlement({ uuid: UUID, created: CREATED, lastModified: LAST_MODIFIED }).IsRemoved,
    ).toBe(false);
    expect(
      buildBookEntitlement({
        uuid: UUID,
        created: CREATED,
        lastModified: LAST_MODIFIED,
        isRemoved: true,
      }).IsRemoved,
    ).toBe(true);
  });
});

describe('buildBookMetadata', () => {
  const base = {
    uuid: UUID,
    title: 'Reading Slowly',
    publicationDate: CREATED,
    excerpt: 'An excerpt',
    siteName: 'example.com',
    downloadUrl:
      'https://h/api/v1/kobo/tok/v1/download/11111111-1111-1111-1111-111111111111.kepub.epub',
    sizeBytes: 4096,
  };

  it('carries the exact Calibre-Web key names, uuid reused across EntitlementId/RevisionId/CrossRevisionId/WorkId', () => {
    const metadata = buildBookMetadata(base);

    expect(metadata.EntitlementId).toBe(UUID);
    expect(metadata.RevisionId).toBe(UUID);
    expect(metadata.CrossRevisionId).toBe(UUID);
    expect(metadata.WorkId).toBe(UUID);
    expect(metadata.CoverImageId).toBe(UUID);
    expect(metadata.Title).toBe('Reading Slowly');
    expect(metadata.Language).toBe('en');
    expect(metadata.PublicationDate).toBe(CREATED);
    expect(metadata).not.toHaveProperty('Series');
  });

  it('emits exactly one KEPUB DownloadUrls entry with the given size', () => {
    const metadata = buildBookMetadata(base);
    expect(metadata.DownloadUrls).toHaveLength(1);
    expect(metadata.DownloadUrls[0]).toEqual({
      Format: 'KEPUB',
      Url: base.downloadUrl,
      Size: 4096,
      Platform: 'Generic',
    });
  });

  it('falls back Description to empty string and Publisher.Name to burkmak when unset', () => {
    const metadata = buildBookMetadata({ ...base, excerpt: null, siteName: null });
    expect(metadata.Description).toBe('');
    expect(metadata.Publisher).toEqual({ Name: 'burkmak', Imprint: '' });
  });

  it('uses the given excerpt/siteName when present', () => {
    const metadata = buildBookMetadata(base);
    expect(metadata.Description).toBe('An excerpt');
    expect(metadata.Publisher.Name).toBe('example.com');
  });
});

describe('buildReadingStatePayload', () => {
  it('defaults to ReadyToRead / TimesStartedReading 0 when nothing is stored', () => {
    const payload = buildReadingStatePayload({ entitlementUuid: UUID, timestamp: CREATED });

    expect(payload).toEqual({
      EntitlementId: UUID,
      Created: CREATED,
      LastModified: CREATED,
      PriorityTimestamp: CREATED,
      StatusInfo: { Status: 'ReadyToRead', TimesStartedReading: 0 },
      Statistics: { LastModified: CREATED },
      CurrentBookmark: { LastModified: CREATED },
    });
  });

  it('merges a stored row verbatim over the defaults', () => {
    const payload = buildReadingStatePayload({
      entitlementUuid: UUID,
      timestamp: CREATED,
      stored: {
        statusInfo: JSON.stringify({ Status: 'Finished', TimesStartedReading: 2 }),
        statistics: JSON.stringify({ LastModified: LAST_MODIFIED, SpentReadingMinutes: 42 }),
        currentBookmark: JSON.stringify({ LastModified: LAST_MODIFIED, Location: { Value: 'x' } }),
        priorityTimestamp: LAST_MODIFIED,
        lastModified: LAST_MODIFIED,
      },
    });

    expect(payload.Created).toBe(CREATED); // Created always comes from the caller's timestamp
    expect(payload.LastModified).toBe(LAST_MODIFIED);
    expect(payload.PriorityTimestamp).toBe(LAST_MODIFIED);
    expect(payload.StatusInfo).toEqual({ Status: 'Finished', TimesStartedReading: 2 });
    expect(payload.Statistics).toEqual({ LastModified: LAST_MODIFIED, SpentReadingMinutes: 42 });
    expect(payload.CurrentBookmark).toEqual({
      LastModified: LAST_MODIFIED,
      Location: { Value: 'x' },
    });
  });

  it('defaults Statistics/CurrentBookmark to {LastModified} when the stored columns are null', () => {
    const payload = buildReadingStatePayload({
      entitlementUuid: UUID,
      timestamp: CREATED,
      stored: {
        statusInfo: JSON.stringify({ Status: 'Reading' }),
        statistics: null,
        currentBookmark: null,
        priorityTimestamp: LAST_MODIFIED,
        lastModified: LAST_MODIFIED,
      },
    });

    expect(payload.Statistics).toEqual({ LastModified: LAST_MODIFIED });
    expect(payload.CurrentBookmark).toEqual({ LastModified: LAST_MODIFIED });
  });
});
