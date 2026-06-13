# Feature spec — Foundation + Core Library (P1 · S0 + S1)

- Status: draft
- Created: 2026-06-13
- Owner: claude
- PRD: [../PRD.md](../PRD.md) (§5 stack, §6–§7 subsystems, §8 data model)
- Roadmap: [../roadmap.md](../roadmap.md) (Phase P1)

## Goal

Turn the template into **burkmak** running on a simplified stack, and ship a
usable core: a multi-user library where a user saves a URL, sees it appear
instantly, watches metadata fill in live, and organises it with tags and
read-state — on both web and mobile.

At the end of this slice a user can: sign in, paste a link, watch it resolve
title/favicon/excerpt without refreshing, tag it, mark it read/archived/
favorite, filter and text-search the list, and delete it — and never see
another user's data.

## Scope

**In:** everything in S0 + S1.
**Out (later phases):** full-article extraction, reader view, FTS over article
body, highlights/notes (S2); share-sheet & bookmarklet (S3); Kobo (S4);
Obsidian (S5); import.

---

## Part A — S0 Foundation

### A1. Rename & template setup
- Run `scripts/setup.sh` (or equivalent) substituting:
  - `{{APP_NAME}}` → `burkmak`
  - `{{APP_SLUG}}` → `burkmak`
  - `{{APP_DESCRIPTION}}` → "Self-hosted read-it-later with Kobo sync and Obsidian export"
  - sentinel `YourApp` → `burkmak`
- Update `README.md` top section to describe burkmak (keep the template's
  workflow/guardrail docs).

### A2. Postgres → SQLite
- Prisma `datasource` → `sqlite`; `DATABASE_URL="file:./burkmak.db"` (configurable
  via `AppConfig`, never `process.env` directly).
- Enable **WAL** mode at startup (worker + API both write).
- Remove Postgres-specific column types / extensions from `schema.prisma` and
  `docker/postgres/init.sql` (delete the latter).
- Generate the initial migration.

### A3. Strip dropped services
- Remove from `docker/compose.yml`: `postgres`, `redis`, `centrifugo`,
  `otel-lgtm`. Keep only `backend` (+ `web` if used) on SQLite volume.
- Remove Centrifugo config dir, realtime-token endpoint, and Centrifugo client
  wiring.
- Delete the **AsyncAPI** half of `packages/specs` (`asyncapi/centrifugo.yaml`,
  `codegen-asyncapi.ts`, generated `realtime/channels.ts`) and its scripts/CI
  steps. `packages/specs` is now OpenAPI-only.
- Remove Redis usage (throttler storage → in-memory; any cache → in-memory).
- Remove Sentry/OTel init from `main.ts` (or guard behind a disabled-by-default
  config flag). Update `health` endpoint deps to `{ db: ok }` only.
- Update CI (`.github/workflows/ci.yml`): drop AsyncAPI validation, drop the
  realtime codegen drift check, drop services no longer present.

### A4. Jobs spine (DB-backed worker)
- `Job` table (see §Data model).
- `JobsService.enqueue(type, payload, userId, itemId?)`.
- `JobWorker`: a NestJS background processor that claims `queued` jobs
  (transactional `SELECT … LIMIT 1` + status flip to `running`), runs the
  registered handler, sets `done` / `failed`, retries with exponential backoff
  up to `maxAttempts`. Polling interval from `AppConfig`.
- Handler registry keyed by job `type`; S1 registers `fetch_metadata`.

### A5. SSE spine
- `GET /api/v1/events` — `text/event-stream`, auth required (Better Auth
  session). Streams **only the authenticated user's** events.
- In-process event bus (NestJS `EventEmitter`) → per-connection SSE writer
  filtered by `userId`. No external broker.
- Heartbeat comment every ~25s to keep connections alive; clients reconnect via
  native `EventSource` / Dio stream retry.
- Event envelope: `{ "type": string, "data": object }` (see §SSE contract).

---

## Part B — S1 Core Library

### B1. Data model (Prisma / SQLite)

```prisma
model Item {
  id           String   @id @default(cuid())
  userId       String
  url          String
  canonicalUrl String?
  title        String?
  siteName     String?
  excerpt      String?
  leadImageUrl String?
  faviconUrl   String?
  status       String   @default("pending") // pending | ready | failed
  readState    String   @default("unread")  // unread | read | archived
  favorite     Boolean  @default(false)
  savedAt      DateTime @default(now())
  readAt       DateTime?
  updatedAt    DateTime @updatedAt
  tags         ItemTag[]
  @@index([userId, readState])
  @@index([userId, savedAt])
}

model Tag {
  id     String    @id @default(cuid())
  userId String
  name   String
  slug   String
  items  ItemTag[]
  @@unique([userId, slug])
}

model ItemTag {
  itemId String
  tagId  String
  item   Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([itemId, tagId])
}

model Job {
  id         String   @id @default(cuid())
  userId     String
  type       String                       // fetch_metadata (S1)
  itemId     String?
  status     String   @default("queued")  // queued | running | done | failed
  attempts   Int      @default(0)
  maxAttempts Int     @default(3)
  error      String?
  payload    String?                       // JSON
  createdAt  DateTime @default(now())
  startedAt  DateTime?
  finishedAt DateTime?
  @@index([status, createdAt])
}
```

### B2. API surface (spec-first — edit `openapi.yaml` first)

All under `/api/v1`, all require an authenticated session, all scoped to the
caller. Errors use the shared `Problem` (RFC 9457) schema.

| Method | Path                          | Purpose                                              |
| ------ | ----------------------------- | ---------------------------------------------------- |
| POST   | `/items`                      | Save URL → create `Item(pending)`, enqueue metadata  |
| GET    | `/items`                      | List with `readState`, `tag`, `favorite`, `q`, cursor pagination |
| GET    | `/items/{id}`                 | Get one                                              |
| PATCH  | `/items/{id}`                 | Update `readState` and/or `favorite`                 |
| DELETE | `/items/{id}`                 | Delete                                               |
| POST   | `/items/{id}/tags`            | Attach a tag (create-on-first-use) `{ tag }`         |
| DELETE | `/items/{id}/tags/{tagSlug}`  | Detach a tag                                         |
| GET    | `/tags`                       | List user's tags with item counts                   |
| PATCH  | `/tags/{id}`                  | Rename `{ name }`                                    |
| DELETE | `/tags/{id}`                  | Delete tag (detaches from items)                     |
| GET    | `/events`                     | SSE stream (`text/event-stream`)                     |

Schemas: `Item`, `ItemList` (paginated), `Tag`, `SaveItemRequest`,
`UpdateItemRequest`, `AddTagRequest`. Operation IDs camelCase
(`saveItem`, `listItems`, `getItem`, `updateItem`, `deleteItem`, `addItemTag`,
`removeItemTag`, `listTags`, `renameTag`, `deleteTag`, `streamEvents`).

`q` in S1 matches **title + url** only (article-body FTS arrives in S2).

### B3. Backend (NestJS + CQRS)
- **Commands**: `SaveItem`, `UpdateItem`, `DeleteItem`, `AddItemTag`,
  `RemoveItemTag`, `RenameTag`, `DeleteTag`.
- **Queries**: `ListItems`, `GetItem`, `ListTags`.
- `SaveItem` creates `Item(pending)` and enqueues a `fetch_metadata` job.
- **`fetch_metadata` handler**: HTTP GET the URL (configurable timeout, body
  size cap, descriptive user-agent, follow redirects). Parse `<title>` /
  `og:title`, meta description / `og:description`, `og:image` (lead image),
  favicon (`link[rel~=icon]`, fallback `/favicon.ico`), `og:site_name`,
  canonical (`og:url` / `link[rel=canonical]` / final URL). Update the item to
  `status: ready`; on error set `status: failed` (item is retained, retryable).
  Emit `item.updated` over SSE either way.
- Every command/query enforces `userId` ownership.

### B4. Web (Nuxt)
- Pages: `library` (index, the list), `items/[id]` (detail), `settings`
  (theme/language — minimal). Auth pages reuse the template's Better Auth flow.
- New `@app/ui` components (each with Storybook story + colocated spec; built
  from the design bundle in PRD §11): `AppItemCard`, `AppStatusBadge`,
  `AppFilterBar`, `AppTagChip`, `AppEmptyState`, `AppSkeleton`.
- `useEvents()` composable subscribes to `/events`, updates the items store on
  `item.*` so the `pending → ready` transition is live.
- All HTTP via the generated `@app/api-client-ts`. All strings via i18n.

### B5. Mobile (Flutter)
- Features (feature-first `domain/data/presentation`): `library` (list +
  filters), `item_detail`, `add_link`. Auth reuses the template's vertical.
- `flutter_bloc` cubits for items/tags; SSE consumed as a Dio/`http` byte
  stream feeding the cubit so `pending → ready` updates live.
- All HTTP via the generated `app_api_client`. Strings via `slang`
  (en/ru/uk/el).

---

## SSE event contract

`GET /api/v1/events` emits (envelope `{ type, data }`):

| `type`         | `data`                          | When                          |
| -------------- | ------------------------------- | ----------------------------- |
| `item.created` | `{ item }`                      | a save is accepted            |
| `item.updated` | `{ item }`                      | metadata filled / state change |
| `item.deleted` | `{ id }`                        | item deleted                  |
| `job.updated`  | `{ id, type, status, itemId? }` | job status transitions        |

Only the authenticated user's events are delivered.

## Spec-first / codegen

- **Spec diff:** `openapi.yaml` — add Item/Tag/Job schemas + the paths above;
  **remove** `asyncapi/centrifugo.yaml` and realtime channels.
- **Codegen impact:** yes — regenerate `@app/api-client-{ts,dart}` and land in
  its own commit. (SSE is documented as an OpenAPI path with
  `text/event-stream`; the stream itself is consumed manually, not via codegen.)
- **Design impact:** new `@app/ui` components — depends on the design bundle
  produced from PRD §11. Build the design bundle (tokens + mockups) before/along
  the web UI work.

## Acceptance criteria

1. App boots via `docker compose` on **SQLite**; `GET /api/v1/health` → `db: ok`
   with no centrifugo/redis/grafana present. CI is green.
2. `pnpm spec:validate && pnpm spec:bundle && pnpm spec:codegen` succeed;
   codegen drift check passes (AsyncAPI checks removed).
3. Saving a URL returns immediately; the item shows as **pending** and, without
   any manual refresh, transitions to **ready** with title/favicon/excerpt via
   SSE (and to **failed**, retained, if the fetch errors).
4. List filters by read-state, tag, and favorite; `q` matches title/url.
5. A user can set read/archived, toggle favorite, add/remove tags, rename/delete
   tags, and delete items — on **both web and mobile**.
6. **Multi-user isolation:** user A never sees user B's items, tags, jobs, or
   SSE events (covered by tests).

## Testing

- **Backend (vitest):** each command/query handler; `fetch_metadata` handler
  with a mocked fetcher (success + failure + redirect + missing-meta cases);
  job worker claim/retry/backoff; SSE per-user filtering; ownership/isolation.
- **`@app/ui` (vitest):** each new component — variants × light/dark, a11y
  smoke, keyboard nav.
- **Web:** items store + `useEvents()` composable (pending→ready update).
- **Mobile:** items/tags cubits incl. SSE-driven update.

## Risks / notes

- SQLite write concurrency under worker + API → WAL mode; revisit only if
  contention shows.
- Metadata fetch hits hostile/slow sites → enforce timeout + size cap; failure
  degrades to a retained `failed` item, never a lost save.
- SSE behind some reverse proxies needs buffering disabled — document in the
  self-host guide.

## Task-stack entry (push to `specs/tasks/active.md` at build start)

```md
## T-2026-06-13-001 — foundation + core library (P1)

- Created: 2026-06-13
- Owner: claude
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md)
- Goal: burkmak runs on the simplified stack and a user can save, organise, and
  live-track links on web + mobile.
- Acceptance: see spec §Acceptance criteria.
- Spec diff: openapi.yaml — add items/tags/events; remove asyncapi
- Codegen impact: yes
- Design impact: new @app/ui components (AppItemCard, AppStatusBadge, …)
- Tests: backend handlers + worker + SSE isolation; @app/ui specs; web/mobile state
- Sub-steps:
  - [ ] S0: rename, SQLite swap, strip services + AsyncAPI, jobs worker, SSE
  - [ ] S1: openapi paths + codegen
  - [ ] S1: backend commands/queries + fetch_metadata handler
  - [ ] S1: @app/ui components from design bundle
  - [ ] S1: web library/detail/settings + useEvents
  - [ ] S1: mobile library/detail/add-link + SSE cubit
- Status: in-progress
- Blockers: —
```
