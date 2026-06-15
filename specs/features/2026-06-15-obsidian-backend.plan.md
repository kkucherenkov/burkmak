# Obsidian Export — Backend API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A backend API that returns a user's items+highlights as Obsidian-ready markdown — a bundle (`GET /export/markdown`) and a single item (`GET items/:id/export/markdown`) — one note per article with YAML frontmatter (incl. `burkmakId` for idempotency), highlights as blockquotes, and notes.

**Architecture:** An `export` CQRS module: a pure `render-note.ts` (item+highlights → `{filename, markdown}`), an `ExportMarkdownQuery` joining the items + highlights repos, and an `ExportController`. Auth reuses `SessionGuard` (accepts PAT Bearer from the `pat` slice).

**Tech Stack:** NestJS 11 + CQRS, Prisma 7. No new DB model.

**Spec:** [2026-06-15-obsidian-export.md](./2026-06-15-obsidian-export.md). Contract (`exportMarkdownBundle`, `exportItemMarkdown`, `ExportBundle`, `ExportedNote`) already in `openapi.yaml` + clients (0.4.0).

**Branch:** `feat/obsidian-backend` off `main` (after `pat` merges; parallel with `kobo`). Commit per task; `--no-ff` when gates pass.

---

## File structure

| File                                                                                          | Responsibility                                         | New/Mod |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------- |
| `apps/backend/src/modules/export/infra/render-note.ts`                                        | pure: item+highlights → `{filename, markdown}`         | new     |
| `apps/backend/src/modules/export/infra/slugify.ts`                                            | pure filename slug                                     | new     |
| `apps/backend/src/modules/export/application/queries/export-markdown.{query,handler}.ts`      | bundle                                                 | new     |
| `apps/backend/src/modules/export/application/queries/export-item-markdown.{query,handler}.ts` | single                                                 | new     |
| `apps/backend/src/modules/export/export.controller.ts`                                        | `GET export/markdown`, `GET items/:id/export/markdown` | new     |
| `apps/backend/src/modules/export/export.module.ts`                                            | wire                                                   | new     |
| `apps/backend/src/app.module.ts`                                                              | register `ExportModule`                                | mod     |
| `apps/backend/test/export.spec.ts`                                                            | renderer + slug units                                  | new     |

Read first: `apps/backend/src/modules/highlights/` (query/handler/repo shape + `HighlightDetail`), `apps/backend/src/modules/items/application/queries/list-items.*` (item listing + filter), the export spec.

---

## Task 1: slugify (pure, TDD)

**Files:** `slugify.ts`, `test/export.spec.ts`.

- [ ] **Step 1: Failing test**

```ts
// apps/backend/test/export.spec.ts
import { describe, expect, it } from 'vitest';
import { slugFilename } from '../src/modules/export/infra/slugify';

describe('slugFilename', () => {
  it('slugifies title + short id suffix, .md', () => {
    expect(slugFilename('The Case for Reading Slowly!', 'cmqd1234')).toBe(
      'the-case-for-reading-slowly-cmqd1234.md',
    );
  });
  it('falls back to id when title empty', () => {
    expect(slugFilename(null, 'cmqd1234')).toBe('cmqd1234.md');
  });
  it('collapses non-alnum and trims', () => {
    expect(slugFilename('  A  —  B ', 'id1')).toBe('a-b-id1.md');
  });
});
```

- [ ] **Step 2: Run → FAIL.** `pnpm --filter @app/backend exec vitest run test/export.spec.ts`
- [ ] **Step 3: Implement** — lowercase, replace non `[a-z0-9]+` runs with `-`, trim leading/trailing `-`, append `-<id>` (id slugged too), `.md`. If title slug empty → just `<id>.md`.
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat(backend): export filename slug (obsidian-backend)"`

---

## Task 2: Markdown renderer (pure, TDD)

**Files:** `render-note.ts`, append `test/export.spec.ts`.

`renderNote(item, highlights): { itemId; title; filename; markdown }` where
`item = { id, title, url, canonicalUrl, siteName, savedAt, tags: string[], readingTimeMin?: number | null }`,
`highlights = { quote, note, color }[]`.

- [ ] **Step 1: Failing test**

```ts
import { renderNote } from '../src/modules/export/infra/render-note';

const item = {
  id: 'it1',
  title: 'Reading Slowly',
  url: 'https://x.com/a',
  canonicalUrl: null,
  siteName: 'x.com',
  savedAt: '2026-06-14T00:00:00Z',
  tags: ['reading', 'longread'],
  readingTimeMin: 12,
};

it('renders frontmatter + highlights blockquotes + notes', () => {
  const { filename, markdown, itemId } = renderNote(item, [
    { quote: 'first quote', note: 'my note', color: 'yellow' },
    { quote: 'second', note: null, color: 'green' },
  ]);
  expect(itemId).toBe('it1');
  expect(filename).toBe('reading-slowly-it1.md');
  expect(markdown).toContain('burkmakId: it1'); // idempotency key
  expect(markdown).toContain('title: Reading Slowly');
  expect(markdown).toContain('url: https://x.com/a');
  expect(markdown).toContain('source: x.com');
  expect(markdown).toMatch(/tags:\n\s+- reading\n\s+- longread/);
  expect(markdown).toContain('> first quote'); // highlight blockquote
  expect(markdown).toContain('my note'); // note rendered
  expect(markdown).toContain('> second');
});

it('escapes YAML-special title and omits empty note', () => {
  const { markdown } = renderNote({ ...item, title: 'A: B #c' }, [
    { quote: 'q', note: null, color: 'blue' },
  ]);
  expect(markdown).toContain('title: "A: B #c"'); // quoted because of :
});

it('uses id when title null; omits author when no siteName', () => {
  const { filename, markdown } = renderNote({ ...item, title: null, siteName: null }, []);
  expect(filename).toBe('it1.md');
  expect(markdown).not.toContain('source:');
});
```

- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement** — build a YAML frontmatter block (`---\n…\n---`) with `burkmakId`, `title` (quote if it contains YAML-special chars `:#-?[]{}` or leading space), `url`, `canonicalUrl` (omit if null), `source` (omit if null), `savedAt`, `readingTimeMin` (omit if null/absent), `tags` as a block list (omit if empty). Body: `# [title](url)`, a metadata line (`*source · saved <date> · N min*` omitting absent parts), then if highlights: `## Highlights` and for each `> quote` (multi-line quotes get each line `> `-prefixed) followed by the `note` paragraph (skip if null) and ` — <color>` marker. `filename = slugFilename(title, id)`. Return `{ itemId: id, title: title ?? id, filename, markdown }`.
- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat(backend): obsidian markdown renderer (obsidian-backend)"`

---

## Task 3: Queries + handlers

**Files:** `export-markdown.{query,handler}.ts`, `export-item-markdown.{query,handler}.ts`.

- [ ] `ExportMarkdownQuery(userId, filter: { readState?: ReadState; since?: string; includeEmpty: boolean })` → handler:
  - list the user's items (reuse the items repo's list with the filter; newest first), for each load its highlights (highlights repo `listForItem`), `renderNote`. Drop items with zero highlights unless `includeEmpty`. Return `{ notes: ExportedNote[] }` where `ExportedNote = { itemId, title, filename, markdown }`.
- [ ] `ExportItemMarkdownQuery(userId, itemId)` → load item (ownership; not found → throw `NotFoundException`) + highlights, `renderNote`, return the raw `markdown` string.
- [ ] (No new repo methods if the items repo already lists by user + filter and the highlights repo has `listForItem`; otherwise add a thin `listForUser`-style method following existing patterns.)
- [ ] typecheck PASS. Commit — `git commit -m "feat(backend): export queries (obsidian-backend)"`

---

## Task 4: Controller + module

**Files:** `export.controller.ts`, `export.module.ts`, `app.module.ts`.

- [ ] **Controller** (`@Controller({ version: '1' })`, `@UseGuards(SessionGuard)`):
  - `@Get('export/markdown')` → parse `readState`/`since`/`includeEmpty` query (validate `readState` ∈ enum, `since` ISO → else 400), run `ExportMarkdownQuery`, return `{ notes }` (JSON).
  - `@Get('items/:id/export/markdown')` → run `ExportItemMarkdownQuery`, set `Content-Type: text/markdown; charset=utf-8`, send the raw markdown string (use `@Res()` like the binary routes, or return a string with an interceptor — match how text responses are done; if none, `@Res()` + `res.type('text/markdown').send(md)`).
- [ ] **Module** + register in `app.module.ts`.
- [ ] typecheck + lint + `pnpm --filter @app/backend test` → PASS.
- [ ] Commit — `git commit -m "feat(backend): export endpoints (obsidian-backend)"`

---

## Task 5: Slice gates

- [ ] `pnpm --filter @app/backend {lint,typecheck,test}` green.
- [ ] Live smoke (container, optional): with a highlighted item, `GET /api/v1/export/markdown` (Bearer PAT) → `{ notes:[…] }` with a markdown body; `GET /api/v1/items/<id>/export/markdown` → text/markdown; cross-user → 404; bad `readState` → 400.
- [ ] No `*/generated/` edits; no new DB model; no `process.env`.

## Self-review checklist

- Frontmatter carries `burkmakId` (idempotency); YAML-special titles quoted; null note/siteName/readingTime omitted cleanly.
- `includeEmpty=false` drops highlight-less items; filters validated.
- Auth via the shared guard (PAT Bearer). Renderer is pure + fully unit-tested.
