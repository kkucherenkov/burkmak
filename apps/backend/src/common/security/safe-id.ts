import { NotFoundException } from '@nestjs/common';

/**
 * Item ids are Prisma cuids: lowercase alphanumeric, ~25 chars. The bound
 * matters because ids become filesystem path segments under the data dir
 * (image cache `images/<id>/`, EPUB cache `epub/<id>/`) — anything with a
 * separator, dot, or other metacharacter must never reach `path.join`.
 */
const SAFE_ID_RE = /^[a-z0-9]{1,64}$/;

export function isSafeItemId(id: string): boolean {
  return SAFE_ID_RE.test(id);
}

/**
 * A malformed id cannot exist, so 404 — indistinguishable from an unknown
 * id, and consistent with the OpenAPI contract (no 400 declared on these
 * routes; ids are plain strings in the spec).
 */
export function assertSafeItemId(id: string): void {
  if (!isSafeItemId(id)) {
    throw new NotFoundException();
  }
}
