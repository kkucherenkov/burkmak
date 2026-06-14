# Handoff — start here

_Last updated: 2026-06-14 (S2-backend shipped). Orientation for a cold-start session (Claude or human). Read this, then `specs/tasks/active.md` and `.claude/CLAUDE.md`. Don't re-derive — the durable records below already capture it._

## Where the project is

**burkmak** — self-hosted read-it-later (Omnivore-style core + Kobo sync + Obsidian export differentiators), per-user libraries. Stack: NestJS 11 + Prisma 7 (SQLite/FTS5) + Nuxt 4 SPA + Flutter, spec-first OpenAPI, DB-backed job worker + SSE. No remote git — **everything is merged locally to `main`** (per-slice `--no-ff` merges; user authorizes local merges).

**Shipped (all on `main`):**

- **P1 = S0 + S1** — foundation + core library (save → live metadata via SSE → tags → read-state/favorite → filtered list → delete), web + mobile + backend. Full per-slice ledger in `specs/tasks/done.md`.
- **P2 = S2 — Extraction & Reading, two of five slices done:**
  - **S2-design** (`bddc18b`) — `specs/design/mockups/reader-highlights.vue` (reader marks + selection popover + highlights panel + note editor; tokens-only). The visual source of truth for S2-ui.
  - **S2-backend** (`d84737d`, 21 commits) — `extract_article` job (Readability + sanitize-html + linkedom), `Article` read model, **FTS5** body search (`item_fts` + triggers + bootstrap), local **raster image cache** (SSRF-guarded), per-user **highlights** CRUD, extract/article/image endpoints. 129 backend tests green; security-reviewed; live smoke passed (extract→ready, sanitized article, image served w/ `nosniff`, FTS hit, highlight CRUD). Isolation tests live at the repo layer (see gotcha below).
  - Plus two repo-wide fixes this session: **prettier** root-cause (`openapi-types.ts` is generated → now in `.prettierignore`; killed a phantom 1624-line churn), and the **migrations-only policy** (see below).

**Next to build (user-chosen order): S2-ui + S2-mobile in PARALLEL, then S2-web.**

- Spec: `specs/features/2026-06-14-s2-extraction-and-reading.md` (approved).
- Remaining plans: `specs/features/2026-06-14-s2-{ui,web,mobile}.plan.md` (TDD, checkbox steps, mirror S1).
- **Dependencies:** S2-ui (needs design ✓ + backend ✓ → unblocked); S2-mobile (needs backend ✓ → unblocked); S2-web (needs S2-ui + backend). S2-ui touches `packages/ui`, S2-mobile touches `apps/mobile` — independent, safe to build concurrently. **Web follows ui.**
- The OpenAPI contract + generated `@app/api-client-{ts,dart}` clients for all S2 endpoints are **already committed** — web/mobile consume them directly (no further codegen needed unless the contract changes).

## How to continue (the proven workflow)

Execute each S2 plan with **superpowers:subagent-driven-development**, exactly as the shipped slices were built:

- One **per-slice branch** off `main` (`feat/s2-<plan>`), fresh subagent per task (`frontend-engineer` for web + `@app/ui`, `flutter-engineer` for mobile), spec/quality review per phase, then `--no-ff` merge to `main` and archive `active.md` → `done.md` (with the merge commit SHA).
- **Spec-first loop** for any API change: edit `packages/specs/openapi/openapi.yaml` → `pnpm spec:validate && pnpm spec:bundle && pnpm spec:codegen` → commit codegen artifacts separately. (S2 frontends shouldn't need this — contract is done.)
- **Per-task gates:** ui `pnpm --filter @app/ui {test,typecheck,lint}`; web `pnpm --filter @app/web {test,typecheck,lint}` + production `nuxt build` (a real gate); mobile `flutter analyze && flutter test`; repo `pnpm stylelint:fix && pnpm format`.

## Environment gotchas (non-obvious — these will trip you up)

- **DB is migrations-only — `prisma db push` is PROHIBITED** (project rule). Schema change → edit `schema.prisma`, then make a committed migration. CLI needs the env prefix (`prisma.config.ts` disables `.env` autoload): `DATABASE_URL="file:./burkmak.db" pnpm --filter @app/backend exec prisma migrate dev --name X`. If the dev container holds the DB (WAL lock), generate the SQL offline: `prisma migrate diff --from-migrations ./prisma/migrations --to-schema ./prisma/schema.prisma --script --output <newdir>/migration.sql` (Prisma 7 renamed `--to-schema-datamodel`→`--to-schema`). The container entrypoint applies migrations via `prisma migrate deploy`. To reset a drifted dev DB: stop backend, `rm apps/backend/burkmak.db*`, rebuild. (memory: `burkmak-db-migrations-only`.)
- **Shell cwd PERSISTS across Bash calls** (rtk-wrapped shell). A `cd apps/backend && …` leaks into later calls and silently breaks repo-root-relative paths (false "No such file" errors). Avoid `cd`; use `pnpm --filter <pkg> …` from the repo root.
- **Docker container `node_modules` is an anonymous volume** — a host `pnpm add` does NOT reach it, and `docker compose restart` may not reinstall. After adding backend deps, run `docker compose -f docker/compose.yml exec backend pnpm install` (or `up -d --build` for a fresh volume), then restart so the watch picks them up.
- **No `.dockerignore` → broken builds.** A root `.dockerignore` (added this session) excludes `node_modules`/artifacts; without it `docker compose build` scans the repo and dies on root-owned `apps/web/node_modules/.tmp` cache files. (memory: `burkmak-docker-build-dockerignore`.)
- **Better Auth provider now matches the SQLite datasource** — `prismaAdapter(prisma, { provider: 'sqlite' })` in `auth.service.ts` (was a `'postgresql'` monorepo-template leftover the "switch to SQLite" migration missed; the full app booted fine even with the wrong value because Prisma talks to SQLite via the `@prisma/adapter-better-sqlite3` driver adapter, so the old "can't boot in vitest" belief was stale). The full Nest app **boots in vitest against SQLite** — see `test/auth-sqlite-boot.spec.ts` (boot + email sign-up + bearer session round-trip). HTTP/auth integration tests are no longer blocked; the repo-layer isolation tests (`test/items.isolation.spec.ts`, `test/s2.isolation.spec.ts`) stay repo-layer by choice (fast, ownership scoping needs no HTTP). Fixed in `fix/auth-sqlite-provider` (T-2026-06-14-012).
- **Flutter/Dart SDK is NOT on PATH** — use `~/projects/petProjects/tools/flutter/bin/{flutter,dart}`. Needed for `pnpm spec:codegen` (dart `build_runner` step) too.
- **Web i18n = global `.ts` langDir locales** (`apps/web/i18n/locales/{en,ru}.ts`, `useI18n()` + namespaced keys). NOT `<i18n lang="json">` SFC blocks — they break `nuxt build` under Vite 8 + @nuxtjs/i18n. (memory: `burkmak-web-i18n-build`.)
- **Design tokens: emitter taxonomy is canonical** (`--surface-page`/`--text-secondary`/`--brand-accent-subtle`/`--status-*-{fg,subtle}`). Run `pnpm design:build` first; the gitignored `tokens.generated.css` is the source of valid `var(--…)` names. NOT `--surface-bg`/`--text-fg-muted`/`--brand-accent-soft`/`--status-danger` (removed). The S2 reader/highlight mockup documents 8 content-color hexes for highlight swatches/rails (carry a `TODO` to promote to `--highlight-*` tokens if reused).
- **`@app/ui` rules:** strings come in as **props** (no `useI18n` inside); BEM-only classes, tokens-only SCSS, Storybook story + colocated spec per component.
- **Backend body parsing** is registered manually before the OpenAPI validator (`main.ts` `bodyParser:false` + `json()/urlencoded()`) — don't revert it or POST/PATCH bodies break.
- **Docker stack** (normally running): `docker compose -f docker/compose.yml up -d`; backend :3000, web :3001; SQLite. The container runs `pnpm dev` (watch) — edits hot-reload; don't run a second `pnpm dev`.
- **Generated `openapi-types.ts` is prettier-exempt** (`.prettierignore`) — codegen emits it raw, don't reformat it. **`apps/backend/data/`** (image cache) and `*.db*` are gitignored runtime data.
- **Playwright in this sandbox:** the `rtk` hook stalls browser downloads; install via the direct binary with `setsid`. Browser e2e otherwise runs in CI.

## S2-specific notes for the frontends

- **Reader (web + mobile):** `GET /items/{id}/article` → `{ contentHtml (sanitized, local img src), contentText, wordCount, readingTimeMin }`. `POST /items/{id}/extract` → 202; watch `extractStatus` (`none|extracting|ready|failed`) flip live via the existing SSE `item.updated` (re-fetch the item). Cached images served at `/api/v1/items/{id}/image/{key}` (ownership-checked, `nosniff`).
- **Highlights (web authoring; mobile read-only):** text-quote anchoring = `{ quote, prefix, suffix }`; colors `yellow|green|blue|pink`. `POST/GET /items/{id}/highlights`, `PATCH/DELETE /highlights/{id}`. To clear a note: `PATCH … {note: null}` (create can't null a note).
- **Search:** library `GET /items?q=…` now matches the article body (FTS5) in addition to title/url — same param, web/mobile keep passing `q`.
- **Mockup** `specs/design/mockups/reader-highlights.vue` is the visual contract for the S2-ui composites (`AppArticleReader`, `AppExtractState`, `AppHighlightPopover`, `AppHighlightCard`).

## Open follow-ups (not blocking)

- **SSRF guard DNS-rebinding residual** (backend): the guard validates at fetch time, not connect time — a TTL=0 rebind isn't caught. Proper fix = pin the resolved IP on connect. Low risk (self-hosted, single-user); deferred.
- Image route returns **405 on HEAD** (only GET is in the spec) — fine.
- No global image-cache GC; lead/inline images are per-item (cascade-deleted on item delete).
- From S1: mobile filter-bar tag dropdown stubbed. Storybook axe runs in CI (no local Playwright).
- **`.claude/` shared config is now force-tracked** in this repo (the user's global `~/.gitignore` blanket-ignores `.claude`, overriding the repo's intent — so it was committed with `git add -f`). When editing `.claude/**`, `git add -f` is required. (memory: `burkmak-claude-dir-global-ignore`.)
