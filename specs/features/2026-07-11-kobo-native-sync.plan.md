# Plan — Kobo native sync (see 2026-07-11-kobo-native-sync.md)

## Phase A — plumbing (schema, auth, validator)

1. Prisma: `KoboEntitlement` + `KoboReadingState` models; hand-written
   migration `kobo_native_sync` (FTS drift blocks `migrate dev`; apply via
   `migrate deploy` in the backend container).
2. `PatService.resolveSecret(secret: string): Promise<string | null>` —
   extract-free variant of `resolve` for token-in-path (hash lookup + touch).
3. `openapi-validator.middleware.ts`: `ignorePaths` regex gains `kobo` —
   `/\/v1\/(auth|kobo)(\/|$)/`.
4. `openapi.yaml`: overview note documenting the device mount (no paths).

## Phase B — store module (`apps/backend/src/modules/kobo/store/`)

| File | Contents |
| --- | --- |
| `kobo-token.guard.ts` | CanActivate: `req.params.token` → `PatService.resolveSecret` → `req.userId`; 401 problem+json on miss |
| `sync-token.ts` | Pure codec `{booksLastModified, readingStateLastModified, archiveLastModified}` ⇄ base64url JSON; zero-epoch default on absent/garbage |
| `entitlement.builder.ts` | Pure: `buildBookEntitlement`, `buildBookMetadata`, `buildReadingStatePayload` — exact Calibre-Web key names |
| `kobo-sync.repo.ts` | PrismaService projections: unsynced ready items (no entitlement row, limit), changed items since ts, orphaned entitlements, reading states since ts; entitlement upsert/purge |
| `kobo-sync.service.ts` | Delta assembly + new sync token + continuation flag |
| `kobo-reading-state.service.ts` | GET state payload; PUT: upsert JSON, `Finished`→`read` / `ReadyToRead`→`unread` via ITEM_REPO.update; build UpdateResults |
| `kobo-store.controller.ts` | All routes from the spec table incl. catch-all `@All('kobo/:token/*')` → `{}`; download route reuses BuildEpubService; image route streams `dataDir/images/<itemId>/<coverImageKey>` |
| `initialization.resources.ts` | Static Resources map builder (mount-rewritten keys) |

Wire into `KoboModule` (imports ItemsModule for ITEM_REPO/ARTICLE_REPO).
Route order caveat: register specific `/v1/*` routes before the catch-all;
Nest maps in declaration order.

## Phase C — tests + verification

1. Units per file (see spec DoD).
2. Backend gates: lint, typecheck, test.
3. Runtime device simulation (curl): auth/device → initialization (assert
   rewritten Resources) → library/sync (capture synctoken + entitlement) →
   download KEPUB → PUT state Finished → item readState == read → re-sync
   returns ChangedReadingState only → archive item in web API → re-sync emits
   IsRemoved.
4. Update task entry; commit per phase.

## Risks / device-verify ceiling

- `DownloadUrls.Size: 0` when the EPUB isn't disk-cached yet — Nickel may
  reject; mitigation documented, needs physical device to confirm.
- Static (non-proxied) `Resources` map is minimal; some Nickel firmwares may
  probe endpoints we stub with `{}`.
- Sync-token format is ours (no store passthrough) — factory-resetting the
  device restarts from a full sync, which is handled (entitlement table).
