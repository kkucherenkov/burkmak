# Feature spec — Kobo native sync (P4 follow-on) — store-API emulation

- Status: draft
- Created: 2026-07-11
- Owner: claude
- Parent: [2026-06-15-kobo-sync.md](./2026-06-15-kobo-sync.md) (documented fast-follow `kobo-native-sync`)
- Reference: Calibre-Web `cps/kobo.py` (route set, sync-token design, payload shapes), BookLore KoboController
- Plan: [2026-07-11-kobo-native-sync.plan.md](./2026-07-11-kobo-native-sync.plan.md)

## Goal

Articles appear on the Kobo **automatically** — no catalog browsing. The user
edits `api_endpoint` in `Kobo eReader.conf` to
`https://<host>/api/v1/kobo/<PAT>` and the device's built-in store sync pulls
new extracted articles as KEPUBs, shows covers, and pushes **reading progress
and Finished status back** to burkmak.

## Scope decisions

- **Auth: PAT in the URL path** (`/api/v1/kobo/:token/…`), exactly the
  Calibre-Web scheme — Nickel cannot send custom auth headers. The token is
  the existing `burk_pat_…` secret; validated per request against the PAT
  store (hash lookup, `touch` on use).
- **No store proxy.** Unknown `/v1/*` endpoints under the mount return `{}`
  (Calibre-Web's dummy-response mode). No traffic ever leaves for
  `storeapi.kobo.com`. A proxy toggle is future work.
- **Sync tracking: entitlement table, not timestamps-only.** A
  `kobo_entitlement` row (UUID pk) is created when an item is first emitted;
  "new" = ready-extracted item with no row (Calibre-Web's `KoboSyncedBooks`
  design — immune to timestamp ties). Changed/archived/reading-state deltas
  are timestamp-driven via the `x-kobo-synctoken` header (base64 JSON:
  `booksLastModified`, `readingStateLastModified`, `archiveLastModified`).
- **Tombstones**: `kobo_entitlement.itemId` is `SET NULL` on item delete; the
  orphaned row emits one `ChangedEntitlement` with `IsRemoved: true`, then is
  purged. Archiving an item likewise emits `IsRemoved` (device removes the
  book) without deleting server state.
- **Read-state mapping**: device `StatusInfo.Status` → burkmak `readState`:
  `Finished` → `read`, `ReadyToRead` → `unread`, `Reading` → left untouched
  (burkmak has no in-progress state). Full device JSON (bookmark, statistics)
  stored verbatim in `kobo_reading_state` for round-tripping.
- **Out**: shelves/tags endpoints (return `{}`), analytics, deals, store
  proxy, multi-device dedup (single sync stream per user).

## Endpoints (all under `/api/v1/kobo/:token`)

| Method | Path | Behaviour |
| --- | --- | --- |
| POST | `/v1/auth/device`, `/v1/auth/refresh` | Stub tokens (random base64 AccessToken/RefreshToken, `TokenType: Bearer`, TrackingId uuid, echo UserKey) |
| GET | `/v1/initialization` | Static Kobo `Resources` map with `image_host`, `image_url_template`, `image_url_quality_template`, `library_sync` (+ download/state hosts) rewritten to this mount |
| GET | `/v1/library/sync` | Delta sync (below); `x-kobo-synctoken` request/response header; `x-kobo-sync: continue` when a full page (100) was emitted |
| GET | `/v1/library/:uuid/metadata` | `[BookMetadata]` for one entitlement |
| GET/PUT | `/v1/library/:uuid/state` | Reading state read / write-back (`RequestResult`/`UpdateResults` response) |
| DELETE | `/v1/library/:uuid` | Archive the item in burkmak (device-initiated removal) |
| GET | `/v1/download/:uuid.kepub.epub` | Stream the KEPUB (BuildEpubService; token is in the path, no Basic needed) |
| GET | `/:uuid/:width/:height/:grey/image.jpg` (+ quality variant) | Stream the cover (size params ignored; 404 when the item has none) |
| ANY | anything else under the mount | `200 {}` |

## Sync payload

`NewEntitlement` / `ChangedEntitlement` objects carry `BookEntitlement`
(Id/RevisionId/CrossRevisionId = entitlement uuid, `Status: "Active"`,
`OriginCategory: "Imported"`, Created/LastModified), `BookMetadata` (title,
language, description = excerpt, `Publisher.Name` = siteName, `CoverImageId` =
uuid, `DownloadUrls: [{Format: "KEPUB", Url, Platform: "Generic", Size}]` —
Size from the EPUB disk cache when present, else 0), and optional
`ReadingState`. `ChangedReadingState` mirrors the stored device state.
Key names follow Calibre-Web verbatim — Nickel is case-sensitive.

## Data (Prisma migration, hand-written — see parent slice note on FTS drift)

```
kobo_entitlement    uuid pk (uuid4), itemId? unique → item (SET NULL), userId, createdAt
kobo_reading_state  itemId pk → item (CASCADE), userId, statusInfo/statistics/
                    currentBookmark (JSON strings), priorityTimestamp,
                    createdAt, lastModified (@updatedAt)
```

## Contract & validation

The mount is a **device-facing protocol, not part of the JSON API contract**
— same treatment as the Better Auth mount: excluded from
`express-openapi-validator` (`ignorePaths` gains `/v1/kobo`), documented in
`openapi.yaml` as an overview-level description entry, no codegen surface.

## Testing (DoD)

- Units: sync-token codec round-trip; entitlement/metadata/reading-state
  builders (exact key names); sync service deltas (new / changed / archived /
  removed / continuation); read-state mapping incl. `Reading` no-op.
- Controller: token-in-path auth (bad token → 401), state PUT persists +
  flips readState, catch-all returns `{}`.
- Runtime (sandbox ceiling): scripted device simulation — init → sync →
  download → PUT state → re-sync sees the state — via curl against the
  docker stack.
- **On-device verification requires a physical Kobo** (documented ceiling;
  budget a device before calling the slice shipped).
