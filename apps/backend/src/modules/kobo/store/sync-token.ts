/**
 * Codec for the `x-kobo-synctoken` header — a base64url-encoded JSON object
 * that drives the delta portions of `/v1/library/sync` (changed items,
 * archived items, reading-state changes). "New" items are tracked by
 * `kobo_entitlement` row existence, not by this token — see the feature spec.
 */
export interface SyncToken {
  booksLastModified: string;
  readingStateLastModified: string;
  archiveLastModified: string;
}

/** Zero-epoch: "everything is a delta" — used the first time a device syncs. */
const EPOCH = '1970-01-01T00:00:00.000Z';

const DEFAULT_SYNC_TOKEN: SyncToken = {
  booksLastModified: EPOCH,
  readingStateLastModified: EPOCH,
  archiveLastModified: EPOCH,
};

function isSyncTokenShape(value: unknown): value is SyncToken {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['booksLastModified'] === 'string' &&
    typeof candidate['readingStateLastModified'] === 'string' &&
    typeof candidate['archiveLastModified'] === 'string'
  );
}

/**
 * Decode the `x-kobo-synctoken` request header. Never throws — an absent,
 * malformed, or wrong-shape header falls back to the zero-epoch default,
 * which makes the sync behave as a full sync (every changed row qualifies).
 */
export function decodeSyncToken(header: string | undefined): SyncToken {
  if (!header) return DEFAULT_SYNC_TOKEN;
  try {
    const json = Buffer.from(header, 'base64url').toString('utf8');
    const parsed: unknown = JSON.parse(json);
    return isSyncTokenShape(parsed) ? parsed : DEFAULT_SYNC_TOKEN;
  } catch {
    return DEFAULT_SYNC_TOKEN;
  }
}

/** Encode a sync token for the `x-kobo-synctoken` response header. */
export function encodeSyncToken(token: SyncToken): string {
  return Buffer.from(JSON.stringify(token), 'utf8').toString('base64url');
}
