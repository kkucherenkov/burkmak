# Feature spec — Extraction & Reading (P2 · S2)

- Status: draft
- Created: 2026-06-14
- Owner: claude
- PRD: [../PRD.md](../PRD.md) (§3 goals, §7 S2, §8 data model)
- Roadmap: [../roadmap.md](../roadmap.md) (Phase P2)
- Builds on: [2026-06-13-foundation-and-core.md](./2026-06-13-foundation-and-core.md) (S0+S1, shipped)

## Goal

Turn a saved link into a **clean, readable article you own**: extract the full
article on demand, read it distraction-free, search across the article body, and
highlight passages with optional notes. Everything stays **per-user** — each
account has its own library, article content, highlights, and search index.

At the end of this slice a user can: open a saved item, tap **Extract**, watch it
go `extracting → ready` live (SSE), read the cleaned article (web + mobile),
**highlight** text and attach a note (web), see those highlights when re-opening,
and **search the article body** (not just title/url) from the library — and never
touch another user's article, highlight, or search result.

This is burkmak's Omnivore-style reading core. The differentiators on top
(Kobo sync, Obsidian export) and other Omnivore-isms (newsletter-in, TTS, saved
filters) are **later phases**, explicitly out of S2.

## Confirmed decisions

1. **Extraction stack:** `@mozilla/readability` + `linkedom` (lightweight DOM) +
   `sanitize-html`. Pure JS, no native/browser deps — fits the in-process job
   worker on the SQLite stack. Built behind an `IArticleExtractor` port so the
   DOM/sanitizer can later be upgraded (e.g. jsdom + DOMPurify) without touching
   callers.
2. **Highlight anchoring:** **text-quote selector** — store the selected `quote`
   plus short `prefix`/`suffix` context (W3C Annotation / Hypothesis style).
   Re-anchored by searching `contentText`; robust to re-render, portable web↔mobile.
   (This is PRD §8 `Highlight.range`, realised as `quote`+`prefix`+`suffix`.)
3. **Mobile reader:** `flutter_html` (renders the sanitized HTML to native
   widgets — themeable, no WebView weight).
4. **Per-user isolation (non-negotiable):** `Article` is 1:1 with `Item` (keyed by
   `itemId`); `Item` is per-user, so article content is per-user with **no
   cross-user dedup by URL**. `Highlight` carries `userId`. FTS search filters by
   `userId`. Extraction, image cache, and every read path are ownership-scoped —
   exactly as S1 established.

## Scope

**In:**

- `extract_article` job + `POST /items/{id}/extract` with live SSE status.
- `Article` storage (sanitized HTML + plain text + word count + reading-time).
- **Local lead + inline image caching** during extraction (capped), served by the
  backend; article HTML rewritten to local image URLs.
- Reader view (web + mobile) rendering the clean article (one good default
  typography — Literata, sensible width/leading).
- **FTS5** full-text search over title + url + article body (the existing
  `listItems` `q` upgrades to FTS; same API param).
- **Highlights & notes**: create/list/edit/delete on **web**; **read-only** render
  on mobile.

**Out (later phases / deferred):**

- Adjustable reader typography controls (font/size/theme) — ship one default now.
- **Mobile highlight authoring** — mobile renders highlights read-only; create/edit
  is web-only this slice.
- Newsletter/email-in, text-to-speech, saved filters/views — later phases.
- Kobo sync (S4), Obsidian export (S5).
- Re-extraction scheduling / refresh — extract is on-demand, idempotent (re-extract
  replaces the Article); no background refresh.

---

## Data model (Prisma / SQLite) — additions

```prisma
model Item {
  // ... S1 fields ...
  extractStatus String  @default("none") // none | extracting | ready | failed
  article       Article?
  highlights    Highlight[]
}

model Article {
  itemId        String   @id
  item          Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  contentHtml   String                       // sanitized, image src rewritten to local
  contentText   String                       // plain text (FTS body + highlight anchoring)
  wordCount     Int
  readingTimeMin Int
  extractedAt   DateTime @default(now())

  @@map("article")
}

model Highlight {
  id        String   @id @default(cuid())
  itemId    String
  userId    String
  quote     String                           // selected text (the anchor)
  prefix    String                           // up to ~32 chars before, for disambiguation
  suffix    String                           // up to ~32 chars after
  note      String?
  color     String   @default("yellow")      // yellow | green | blue | pink (enum in spec)
  createdAt DateTime @default(now())
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([itemId, userId])
  @@map("highlight")
}
```

**FTS5** (raw SQL — Prisma can't model virtual tables; lands in a migration +
`prisma db push` won't create it, so a dedicated SQL migration / startup statement
applies it):

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS item_fts USING fts5(
  title, url, body, item_id UNINDEXED, tokenize = 'porter unicode61'
);
-- kept in sync by triggers on `item` (title,url) and `article` (body=contentText),
-- keyed by item_id. Search: SELECT item_id FROM item_fts WHERE item_fts MATCH ?,
-- then join `item` filtered by userId, ordered by rank.
```

Image cache: cached image bytes stored under a configurable data dir
(`AppConfig`, e.g. `./data/images/<itemId>/<hash>.<ext>`); served via
`GET /api/v1/items/{id}/image/{key}` (ownership-checked) — no public static mount.

---

## API surface (spec-first — edit `openapi.yaml` first)

All under `/api/v1`, authenticated, ownership-scoped, `Problem` (RFC 9457) errors.

| Method | Path                      | Purpose                                                     |
| ------ | ------------------------- | ----------------------------------------------------------- |
| POST   | `/items/{id}/extract`     | Enqueue `extract_article`; → `202` `{ extractStatus }`      |
| GET    | `/items/{id}/article`     | Get extracted `Article` (404 if not extracted)              |
| GET    | `/items/{id}/image/{key}` | Serve a cached image (binary; ownership-checked)            |
| POST   | `/items/{id}/highlights`  | Create highlight `{ quote, prefix, suffix, note?, color? }` |
| GET    | `/items/{id}/highlights`  | List the item's highlights (caller's only)                  |
| PATCH  | `/highlights/{id}`        | Update `{ note?, color? }`                                  |
| DELETE | `/highlights/{id}`        | Delete                                                      |

`GET /items` (S1) gains FTS: when `q` is present, match title+url+body via
`item_fts` instead of `contains(title,url)`. Same query param, upgraded impl.
`Item` schema gains `extractStatus`. New schemas: `Article`, `Highlight`,
`HighlightList`, `CreateHighlightRequest`, `UpdateHighlightRequest`,
`HighlightColor` enum (`yellow|green|blue|pink`). operationIds:
`extractArticle, getArticle, getItemImage, createHighlight, listHighlights,
updateHighlight, deleteHighlight`.

**Codegen impact: yes** — regenerate `@app/api-client-{ts,dart}` + `@app/specs`,
land in its own commit.

---

## Backend (NestJS + CQRS)

- **`extract_article` JobHandler** (registered with the S0 `JobWorker`): load the
  item (ownership), HTTP GET the url (reuse the S1 fetcher with the same
  timeout/size cap), run `IArticleExtractor.extract(html, url)` →
  `{ contentHtml, contentText, title?, wordCount, readingTimeMin }`, run
  `IImageCache.cacheFrom(itemId, contentHtml)` → rewritten html + stored bytes,
  upsert `Article`, set `Item.extractStatus = ready`, emit SSE `item.updated`.
  On any failure: `extractStatus = failed`, emit, rethrow for retry/backoff.
- **Ports:** `IArticleExtractor` (Readability/linkedom/sanitize-html impl;
  `metadata.ts`-style pure core where possible), `IImageCache` (download capped
  set of images, store, return rewritten html + a key→path map). Both Symbol-token
  injected, swappable.
- **Commands:** `ExtractArticle` (set extracting + enqueue + emit), `CreateHighlight`,
  `UpdateHighlight`, `DeleteHighlight`. **Queries:** `GetArticle`, `ListHighlights`.
  `ListItems` (S1) extended with an FTS branch when `q` set.
- **FTS5 setup:** an idempotent startup/migration step creates `item_fts` + triggers;
  `ItemRepo.findMany` uses `$queryRaw` against `item_fts` when `q` present (still
  applies readState/tag/favorite filters + userId + cursor).
- **Reading-time:** `ceil(wordCount / 200)` min (configurable WPM).
- Every command/query enforces `userId` ownership (item + highlight).

---

## `@app/ui` (S2-ui)

New composites (Storybook story + colocated spec each, tokens-only, strings as
props — built from the reader mockup + the new highlight mockups):

- `AppArticleReader` — renders sanitized `contentHtml` in the reading column
  (Literata body, `--leading-relaxed`); exposes a `highlights` prop and a
  `text-selected` event (web authoring); renders highlight marks.
- `AppExtractState` — the fetch state machine UI (`none` pitch + Extract button →
  `extracting` progress → `failed` retry); `ready` hands off to the reader.
- `AppHighlightPopover` — selection popover (color swatches + add-note) [web].
- `AppHighlightCard` — a highlight in the side panel (quote + note + color + edit/delete).
- `AppStatusBadge` (S1) reused for the extract status; the item-detail reader
  markup already exists in `specs/design/mockups/item-detail.vue`.

## Mockups (S2-design)

Reader/fetch machine is already designed (`item-detail.vue`). New mockups needed:

- highlight-create **popover** (on text selection),
- **highlights/notes panel** (list of `AppHighlightCard`),
- **note editor** (attach/edit a note on a highlight).
  Produced into `specs/design/mockups/` using the existing tokens, before the web UI.

## Web (S2-web)

- `/items/[id]` becomes the full reader: `AppExtractState` (Extract → live status
  via `useEvents`) → `AppArticleReader`. Article fetched via the generated client
  (`getArticle`).
- **Highlight authoring:** select text in the reader → `AppHighlightPopover` →
  create (color + optional note); a highlights panel lists/edits/deletes. Anchoring
  computed client-side (quote+prefix+suffix from the selection) and re-applied on
  load by searching the rendered text.
- **Search:** library `q` now returns FTS body matches (backend change; web keeps
  passing `q`). Optional: show a "matched in article" hint.
- HTTP via `@app/api-client-ts`/`useApi`; strings via the `.ts` langDir locales.

## Mobile (S2-mobile)

- Reader screen (`item_detail` feature): Extract button → live status (SSE cubit) →
  `flutter_html` renders `contentHtml`; highlights rendered **read-only** as marked
  spans. Search via the existing `q` filter (now FTS). HTTP via `app_api_client`;
  strings via slang (en/ru/uk/el). No highlight authoring this slice.

---

## SSE event contract (extends S1)

`item.updated` `{ id }` now also covers extract-status transitions (the client
re-fetches the item and sees `extractStatus`). No new event types in S2;
highlights are plain REST (single-user-session, not realtime this slice).

---

## Acceptance criteria

1. `POST /items/{id}/extract` returns immediately; the item shows `extracting` and,
   without refresh, transitions to `ready` (article available) or `failed`
   (retained, retryable) via SSE — on web and mobile.
2. The reader renders the cleaned article (web + mobile) with cached images served
   locally; raw/unsafe HTML is sanitized out.
3. Library `q` matches the **article body** (FTS5) in addition to title/url.
4. A user can select text on web, create a highlight with a color + optional note,
   see it re-rendered on reload, edit/delete it; mobile shows the same highlights
   read-only.
5. **Multi-user isolation (extends S1):** user A cannot extract, read the article
   of, search the body of, view/serve cached images of, or list/create/edit/delete
   highlights on, user B's items. Covered by tests.
6. App boots via `docker compose` on SQLite; `pnpm spec:validate && spec:bundle &&
spec:codegen` succeed, drift-stable; `nuxt build` passes; CI green.

## Testing

- **Backend (vitest):** `IArticleExtractor` pure parse (clean HTML, strip scripts,
  word count, reading-time) with fixtures; `extract_article` handler (success /
  failure / missing-content) with a mocked fetcher+extractor; image cache (cap,
  rewrite, ownership-served); FTS search (body match, userId scoping, filter combo);
  highlight commands (ownership, color/note validation); **multi-user isolation
  e2e** for article/search/highlights/images.
- **`@app/ui` (vitest):** each new component — variants × light/dark, a11y, the
  reader's highlight-mark rendering + selection event.
- **Web:** reader store/composable (extract→ready), highlight anchoring util
  (compute + re-anchor quote/prefix/suffix), FTS-`q` wiring.
- **Mobile:** detail/reader cubit (extract→ready), flutter_html render smoke,
  read-only highlight rendering.
- **e2e (playwright):** extend `library-flow` — extract an item → reader renders →
  create a highlight → reload shows it.

## Risks / notes

- **Hostile/huge pages** → reuse S1's timeout + size cap; extraction failure
  degrades to a retained `failed` item, never a lost save.
- **Sanitization is security-critical** (stored HTML rendered in the reader) —
  sanitize-html allowlist; the `IArticleExtractor` port lets us harden later.
- **FTS5 availability** — better-sqlite3 ships FTS5; verify at startup, warn if absent.
- **Image cache growth** — cap count+size per item; cascade-delete the item's image
  dir on item delete. No global GC in S2 (note for later).
- **Highlight re-anchoring** can miss if the article re-extracts and the quote text
  changes — acceptable (orphaned highlights kept, flagged), revisit if it bites.

## Decomposition (one plan each, mirrors S1)

1. **S2-design** — highlight popover/panel/note-editor mockups (+ reconcile the
   reader mockup); tokens-only.
2. **S2-backend** — Prisma `Article`/`Highlight`/`extractStatus` + FTS5; OpenAPI +
   codegen; `extract_article` job + extractor/image-cache ports; article/highlights
   queries+commands; FTS in `ListItems`; isolation tests. Depends on: S1 (shipped).
3. **S2-ui** — `AppArticleReader`, `AppExtractState`, `AppHighlightPopover`,
   `AppHighlightCard`. Depends on: S2-design.
4. **S2-web** — reader view + highlight authoring + FTS `q` wiring. Depends on:
   S2-ui, S2-backend.
5. **S2-mobile** — reader (flutter_html) + read-only highlights + search. Depends
   on: S2-backend.

## Task-stack entry (push to `active.md` at build start, per plan)

```md
## T-YYYY-MM-DD-NNN — S2 <plan> (P2 extraction & reading)

- Spec: specs/features/2026-06-14-s2-extraction-and-reading.md
- Plan: specs/features/2026-06-14-s2-<plan>.plan.md
- ...
```
