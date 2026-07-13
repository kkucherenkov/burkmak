# Design: auto-extract on save · bookmarks vs read-later · shelves

Date: 2026-07-13
Status: draft — awaiting user review
Scope: three slices, built in order ① → ② → ③, each on its own branch/PR.

## Goals

1. **Auto-extract on save** — every saved article reaches reader view / OPDS / Kobo
   without pressing the manual extract button.
2. **Bookmarks vs saved-for-later** — a bookmark is a *reference link* (tool, docs,
   video): it never enters the reading queue, never syncs to the device, opens at
   its source URL. Saved-for-later items keep today's behavior.
3. **Shelves** — curated, many-to-many collections of articles, surfaced in the web
   UI, as **native Kobo device collections**, and as **OPDS navigation feeds**.

## Non-goals (explicitly out of scope)

- Two-way Kobo collection sync (device→server edits of shelves). Device-side
  collection edits hit the existing store catch-all and are ignored.
- Shelving bookmarks — shelves are article-only in this slice.
- Per-user auto-extract toggle — always on; manual extract button remains.
- Hierarchical shelves / folders.

---

## Slice ① — auto-extract on save

### Chain point

`FetchMetadataHandler.handle` (apps/backend/src/modules/items/infra/fetch-metadata.handler.ts),
after `applyMetadata(..., status: 'ready')` succeeds:

```
if (item.extractStatus === 'none' && item.kind === 'article')   // kind gate lands with slice ②
  → repo.applyExtractStatus(userId, itemId, 'extracting')
  → jobs.enqueue('extract_article', { userId, itemId })
  → events.publish(userId, 'item.updated', { id })
```

- Metadata **failure** → no extract attempt; the existing throw drives job
  retry/backoff, and each retry re-enters the chain — the `extractStatus === 'none'`
  guard makes the chain idempotent.
- `extract_article` semantics unchanged: retry ×3, terminal `extractStatus:
  'failed'`, `item.updated` SSE on completion.

### Backfill (one-shot)

`ExtractBackfillService` implementing `OnApplicationBootstrap` (pattern:
`common/fts/fts.bootstrap.ts`):

1. If a **completed job of type `extract_backfill`** exists → no-op (marker).
2. Else enqueue `extract_article` for every item with
   `status = 'ready' AND extractStatus IN ('none', 'failed')`
   (set `extractStatus = 'extracting'` per item, publish `item.updated`).
3. Insert the completed `extract_backfill` marker job.

Restart-safe, runs once ever. The Job table doubles as the "this ran" record —
no new system-flag table.

### Wire impact

None. No spec change, no codegen.

### Tests

- fetch-metadata handler spec: chains on success; skips when `extractStatus ≠ none`;
  no chain on metadata failure.
- backfill service spec: marker present → no-op; enqueues exactly the
  `ready + none/failed` set; writes marker after enqueueing.

---

## Slice ② — bookmarks (`Item.kind`)

### Data model

```prisma
model Item {
  kind String @default("article") // article | bookmark
  ...
}
```

Hand-written migration (FTS drift blocks `migrate dev` — see existing migration
comments). Existing rows become `article` via the default; zero data migration.

### Spec (`packages/specs/openapi/openapi.yaml`) + codegen

- `ItemDetail`: `kind` enum `[article, bookmark]`, **required** in responses.
- `SaveItemRequest`: optional `kind`, default `article`.
- `UpdateItemRequest`: optional `kind` — promote bookmark ⇄ reading queue.
- `GET /items`: optional `?kind=` filter. **No filter = all kinds** — API stays
  backward-compatible; each client passes `kind` explicitly.

### Backend

- Thread `kind` through `SaveItemDto` → `SaveItemCommand` → handler → `repo.create`.
- `ListItemsQuery` + `item.repo`: one `where` addition (FTS search inherits it —
  the kind filter applies at the item `where` level).
- `UpdateItemHandler`: accept `kind`.
- **Kobo sync repo + OPDS queries: add `kind: 'article'`** to the existing
  `extractStatus: 'ready'` where clauses — bookmarks never reach the device or
  OPDS, even if manually extracted.
- Auto-extract chain (slice ①) gains the `kind === 'article'` gate.
- Manual `POST /items/:id/extract` stays permissive for bookmarks (harmless;
  they won't sync anyway).

### Web

- Save affordances (`AppAddBar`, `AddLinkModal`, `/save` share target): a
  "save as bookmark" toggle; default article.
- Library page passes `kind=article` — reading queue stays clean.
- New `/bookmarks` page + header nav link:
  - cards **without** read-state/archive actions;
  - **open = the external source URL** (bookmarks have no reader view);
  - favorite, tags, delete, search still work.
- `useItems` filters gain `kind`; i18n keys en+ru; any new/changed `@app/ui`
  component ships with Storybook story + colocated spec.

### Dormant-but-valid for bookmarks

`readState` (stuck `unread`, hidden in UI), `extractStatus`, article/highlights,
Kobo entitlements. Dormant fields beat a parallel `Bookmark` table that would
need its own metadata pipeline, tags junction, FTS, and endpoints.

### Tests

- repo/list specs: kind filter (article-only, bookmark-only, unfiltered = all).
- update handler: kind flip.
- Kobo sync + OPDS specs: extracted bookmark excluded.
- web: `/bookmarks` page spec, save-as-bookmark toggle spec, ui component specs.

---

## Slice ③ — shelves

### Data model

```prisma
model Shelf {
  id           String      @id @default(uuid())  // doubles as Kobo Tag.Id
  userId       String
  name         String
  createdAt    DateTime    @default(now())
  lastModified DateTime    @updatedAt            // bumped on rename AND membership change
  items        ShelfItem[]

  @@unique([userId, name])
  @@map("shelf")
}

model ShelfItem {
  shelfId String
  itemId  String
  addedAt DateTime @default(now())
  shelf   Shelf @relation(fields: [shelfId], references: [id], onDelete: Cascade)
  item    Item  @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@id([shelfId, itemId])
  @@map("shelf_item")
}

model KoboShelfTombstone {
  shelfId   String   @id            // the deleted shelf's uuid
  userId    String
  deletedAt DateTime @default(now())

  @@map("kobo_shelf_tombstone")
}
```

- Membership add/remove **explicitly touches** `Shelf.lastModified` (Prisma
  `@updatedAt` only fires on updates to the shelf row itself).
- Shelf delete writes the tombstone **in the same transaction**.

### API (spec-first, SessionGuard)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/shelves` | list with item counts |
| POST | `/api/v1/shelves` | create `{name}` (409 on duplicate name) |
| PATCH | `/api/v1/shelves/{id}` | rename |
| DELETE | `/api/v1/shelves/{id}` | delete (+ tombstone) |
| PUT | `/api/v1/shelves/{id}/items/{itemId}` | add item — idempotent |
| DELETE | `/api/v1/shelves/{id}/items/{itemId}` | remove item |

Plus: `GET /items` gains `?shelf={id}` filter; `ItemDetail` gains
`shelves: [{id, name}]`.

### Kobo device collections (`/v1/library/sync`)

Calibre-Web wire format (`Tag` entitlements):

- Sync token gains `tagsLastModified`. Old device tokens lack the field →
  zero-epoch default → all shelves re-emit once; device upserts by `Tag.Id`,
  harmless.
- `NewTag` — shelf with `createdAt > token.tagsLastModified`.
- `ChangedTag` — shelf with `lastModified > token.tagsLastModified`.
- Payload: `{"Tag": {"Id": <shelf uuid>, "Name", "Type": "UserTag", "Created",
  "LastModified", "Items": [{"RevisionId": <entitlement uuid>,
  "Type": "ProductRevisionTagItem"}]}}` — `Items` lists only members that have
  a Kobo entitlement (i.e. extracted, synced articles).
- `DeletedTag` — from tombstones with `deletedAt > token.tagsLastModified`;
  tombstone purged after emission (same single-device assumption as the item
  `IsRemoved` design).
- **Stale-membership fix**: a shelf can hold a not-yet-extracted item that has no
  entitlement uuid yet. When that item's entitlement is first emitted in a later
  sync, the same sync response **re-emits `ChangedTag` for every shelf containing
  a newly-entitled item** — computed in-request by the sync service, no coupling
  with the extract pipeline.
- Device-side collection edits (`/v1/library/tags*`): swallowed by the existing
  catch-all. One-way sync.

### OPDS

- `/api/v1/opds` root becomes a **navigation feed**: "All articles" →
  `/opds/all`, plus one entry per shelf → `/opds/shelf/{id}`.
- `/opds/all` = today's acquisition feed unchanged (covers, cursor pagination,
  OpenSearch); shelf feeds reuse the same builder with a membership `where`.
- All acquisition feeds filter `kind: 'article'` (from slice ②).

### Web

- `/shelves` page: list shelves (name + count), create, rename, delete.
- `/shelves/{id}` page: items on the shelf (reuses items list with `?shelf=`),
  remove-from-shelf action on cards.
- Item detail page: shelf picker (add/remove this item across shelves).
- Header nav link to `/shelves`. Library `AppFilterBar` unchanged in this slice —
  shelf browsing lives on the shelf pages.
- New `@app/ui` components (e.g. shelf list row, shelf picker) ship with
  Storybook stories + colocated specs; all strings via i18n en+ru.

### Tests

- sync token round-trip with `tagsLastModified` (incl. legacy token without it).
- tag delta emission: new shelf / rename / membership change / delete tombstone
  (emit + purge) / re-emission when a member gains its first entitlement.
- shelves CRUD + membership endpoints (ownership checks, idempotent PUT, 409 dup).
- OPDS: root nav feed shape; shelf acquisition feed; pagination on shelf feed.
- web: shelves pages + picker component specs; e2e smoke via the chromium recipe.

---

## Error handling (cross-cutting)

- All new endpoints return RFC 9457 problem+json via existing filters; not-found
  and ownership failures use the module error types (404), duplicate shelf name
  → 409.
- Job failures ride the existing JobWorker retry/backoff; terminal failures are
  visible via `extractStatus: 'failed'` exactly as today.
- Kobo store mount stays inside `ignorePaths` — no OpenAPI validation on device
  routes; the new `/shelves` endpoints ARE validated (spec-first).

## Build order & branches

| # | Branch | Content |
| --- | --- | --- |
| ① | `feat/auto-extract-on-save` | chain + backfill + tests |
| ② | `feat/item-kind-bookmarks` | schema, spec+codegen, backend filter, web /bookmarks |
| ③ | `feat/shelves` | schema, spec+codegen, CRUD, Kobo tags, OPDS nav, web pages |

Each slice: spec → codegen commit → implementation → gates
(`turbo run build lint test typecheck` semantics per repo rules) → PR-style
`--no-ff` merge; task entries in `specs/tasks/active.md` per slice.

## Known ceilings

- Kobo collection behavior verified against the Calibre-Web protocol reference
  and sandbox simulation; final confirmation needs the physical device (same
  ceiling as native sync, documented in done.md T-003).
