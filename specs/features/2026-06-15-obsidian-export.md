# Feature spec — Obsidian Export (P5 · S5)

- Status: draft
- Created: 2026-06-15
- Owner: claude
- PRD: [../PRD.md](../PRD.md) (§7 S5 Obsidian export)
- Roadmap: [../roadmap.md](../roadmap.md) (Phase P5)
- Depends on: [2026-06-15-personal-access-tokens.md](./2026-06-15-personal-access-tokens.md)

## Goal

Get your highlights and notes out of burkmak and into your Obsidian vault — one
markdown note per article (source link, metadata, highlights, personal notes),
**idempotent** so re-syncing updates rather than duplicates. Two parts: a backend
**export API** (markdown-ready) and an **Obsidian plugin** that pulls it in.

At the end of this slice a user can: create a PAT, install the burkmak plugin in
Obsidian, set base URL + token + target folder, run "Sync from burkmak", and get
one note per highlighted article in their vault; re-running updates those notes
in place.

## Scope

**In:**

- Backend: a pure markdown renderer + export query; `GET /api/v1/export/markdown`
  (bundle) and `GET /api/v1/items/{id}/export/markdown` (single).
- `packages/obsidian-plugin`: a new workspace package (esbuild → `main.js` +
  `manifest.json`) — settings, a "Sync from burkmak" command, idempotent writes.

**Out (deliberately):**

- Daily-note append mode (PRD mentions it as an alternative) — one-note-per-article
  only for now; daily-note is a follow-on.
- Two-way sync (editing in Obsidian → burkmak). Export is one-directional.
- Full article **body** mirroring — the note is a citation/highlights artifact
  (metadata + source + highlights + notes), not a content copy. (`excerpt` is
  included; the body is not.)
- Publishing the plugin to the Obsidian community store (manual install / BRAT).

## Backend — export API (spec-first → codegen)

### Markdown renderer (pure, testable)

`renderNote(item, highlights): { filename, markdown }`:

- **YAML frontmatter:** `burkmakId` (the item id — the idempotency key), `title`,
  `url`, `canonicalUrl` (if present), `source` (`siteName`), `savedAt` (ISO),
  `tags` (list), `readingTimeMin` (if article ready). Values YAML-escaped.
- **Body:** `# <title>` linking to `url`; a metadata line (source · saved date ·
  reading time); the `excerpt` as a short blockquote if present; a `## Highlights`
  section — each highlight as a `>` blockquote of `quote`, followed by its `note`
  (if any) as a plain paragraph, colour noted inline (e.g. `— yellow`).
- **filename:** `slugify(title || url)` + `-` + short id suffix → stable &
  collision-safe (so the plugin overwrites the same file each sync). e.g.
  `the-case-for-reading-slowly-cmqd.md`.
- No `author` field exists in the schema → omit author, use `source`. (Adding
  author = scope creep; deferred — see Kobo/export specs.)

Idempotency contract: `burkmakId` in frontmatter is the match key; `filename` is
stable for a given item. The plugin overwrites the file whose frontmatter
`burkmakId` matches (rename-safe).

### Query + endpoints

- `GET /api/v1/export/markdown` (PAT-Bearer or session) → `200
{ notes: [{ itemId, title, filename, markdown }] }`.
  - Default: items with **≥1 highlight** (the point is highlights/notes).
    `?includeEmpty=true` includes highlighted-or-not.
  - Filters: `?readState=unread|read|archived`, `?since=<ISO>` (items updated
    since). Newest first.
- `GET /api/v1/items/{id}/export/markdown` → `200` raw `text/markdown` for a single
  item (convenience / manual copy). `404` cross-user.

`ExportMarkdownQuery` + handler joining the items + highlights repos (CQRS, like
`ListHighlightsQuery`). New tag `export`; schema `ExportBundle`/`ExportedNote` in
components.

## Obsidian plugin — `packages/obsidian-plugin`

A new pnpm workspace package (`pnpm-workspace.yaml` already globs `packages/*`).

- **Build:** esbuild (Obsidian standard) → single `main.js`; ships `manifest.json`
  - `styles.css` (minimal). `tsconfig` extends `@app/tsconfig`; `obsidian` types as
    a dev dep; uses **plain `fetch`** (clean esbuild bundle; no api-client coupling).
    Turbo `build`/`typecheck`/`lint` tasks like siblings.
- **Settings tab:** `baseUrl` (e.g. `http://localhost:3000/api/v1`), `token`
  (PAT), `folder` (vault subfolder, default `burkmak`), `readState` filter.
- **Command "Sync from burkmak":** `fetch(${baseUrl}/export/markdown?…,
{ headers: { Authorization: 'Bearer <token>' } })` → for each note, ensure the
  folder, then write `folder/filename` — **idempotent by `burkmakId`**: scan the
  folder's existing files' frontmatter, if one already has this `burkmakId`
  overwrite it (handles user renames), else create `folder/filename`. Report a
  notice with created/updated counts.
- **Thin by design:** the markdown is rendered server-side; the plugin only
  fetches + writes + dedupes. The only pure logic worth unit-testing locally:
  `slugify`/filename safety and `parseBurkmakId(frontmatter)` (the idempotent
  match) — extract those into a `src/lib/*.ts` with a vitest (or the plugin's
  test runner) spec.

## Error handling

- Bad/expired PAT → plugin surfaces the `401` as an Obsidian notice.
- Network failure → notice, no partial-folder corruption (write per-note,
  continue on individual failures, summarise).
- Empty export → "Nothing to sync" notice.
- Backend: item not owned → `404`; invalid `readState`/`since` → `400`.

## Testing (DoD)

- Backend renderer units: frontmatter fields + YAML escaping; highlight
  blockquotes + note rendering; note-cleared (no note) case; no-author → source;
  tags list; empty-highlights handling (`includeEmpty`); filename slug stability.
- Backend endpoint/integration: bundle shape + filters; single raw markdown;
  cross-user `404`; PAT-Bearer accepted.
- Backend gates: `pnpm --filter @app/backend {lint,typecheck,test}`.
- Plugin: `slugify` + `parseBurkmakId` unit specs; `pnpm --filter
@app/obsidian-plugin {typecheck,lint,build}` (build emits `main.js`).

## Verification ceiling

The export API + renderer are **fully testable here**. The plugin **builds &
typechecks here**, but its in-Obsidian runtime (settings tab, vault writes, the
"Sync" command) is verifiable only inside Obsidian — out of sandbox; documented,
like S3-mobile / Kobo.

## Decomposition

Two sub-slices, sequenced (plugin consumes the API):

1. **`obsidian-backend`** — renderer + query + endpoints (fully tested here).
2. **`obsidian-plugin`** — the `packages/obsidian-plugin` package.

Both can be built after the PAT slice lands; the plugin starts once the export
API contract is in the regenerated client/spec.
