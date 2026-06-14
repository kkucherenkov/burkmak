# Handoff — start here

_Last updated: 2026-06-14. Orientation for a cold-start session (Claude or human). Read this, then `specs/tasks/active.md` and `.claude/CLAUDE.md`. Don't re-derive — the durable records below already capture it._

## Where the project is

**burkmak** — self-hosted read-it-later (Omnivore-style core + Kobo sync + Obsidian export differentiators), per-user libraries. Stack: NestJS 11 + Prisma 7 (SQLite/FTS5) + Nuxt 4 SPA + Flutter, spec-first OpenAPI, DB-backed job worker + SSE. No remote git — **everything is merged locally to `main`** (per-slice `--no-ff` merges; user authorizes local merges).

**Shipped (all on `main`):**
- **P1 = S0 + S1** — foundation + core library (save → live metadata via SSE → tags → read-state/favorite → filtered list → delete), web + mobile + backend. See `specs/tasks/done.md` for the full per-slice ledger (S1-ui, token reconcile, S1-auth, S1-web, S1-mobile + toolchain fixes), each with commit SHAs.
- This session also fixed two latent toolchain bugs and validated the stack — see `done.md` `T-2026-06-14-006/007`.

**Planned and ready to build next: P2 = S2 — Extraction & Reading.**
- Spec: `specs/features/2026-06-14-s2-extraction-and-reading.md` (approved).
- Five plans (TDD, checkbox steps, mirror the S1 plans):
  `specs/features/2026-06-14-s2-{design,backend,ui,web,mobile}.plan.md`.
- **Build order (dependencies):** `S2-design` → `S2-backend` → `S2-ui` (∥ after backend) → `S2-web` (needs ui+backend) → `S2-mobile` (needs backend).

## How to continue (the proven workflow)

Execute each S2 plan with **superpowers:subagent-driven-development**, exactly as S1 was built:
- One **per-slice branch** off `main` (`feat/s2-<plan>`), fresh subagent per task (`frontend-engineer` for web/`@app/ui`, `flutter-engineer` for mobile, `backend-engineer`/general for backend), spec+quality review, then `--no-ff` merge to `main` and archive the entry from `active.md` → `done.md`.
- **Spec-first loop** for any API change: edit `packages/specs/openapi/openapi.yaml` → `pnpm spec:validate && pnpm spec:bundle && pnpm spec:codegen` → commit codegen artifacts separately.
- **Per-task gates:** backend `pnpm --filter @app/backend {test,typecheck}`; ui `pnpm --filter @app/ui {test,typecheck,lint}`; web `pnpm --filter @app/web {test,typecheck,lint} && build` (the production `nuxt build` is a real gate); mobile `flutter analyze && flutter test`; repo `pnpm stylelint:fix && pnpm format`.

## Environment gotchas (non-obvious — these will trip you up)

- **Flutter/Dart SDK is NOT on PATH** — use `~/projects/petProjects/tools/flutter/bin/{flutter,dart}`. Needed for `pnpm spec:codegen` (dart client) too.
- **`pnpm spec:codegen` now runs `build_runner`** so the dart-dio `built_value` `*.g.dart` are generated (was missing → client didn't compile). Keep dart on PATH when running codegen.
- **Web i18n = global `.ts` langDir locales** (`apps/web/i18n/locales/{en,ru}.ts`, `useI18n()` + namespaced keys). Do NOT use `<i18n lang="json">` SFC blocks — they break `nuxt build` under Vite 8 + @nuxtjs/i18n. (memory: `burkmak-web-i18n-build`.)
- **Design tokens: emitter taxonomy is canonical** (`--surface-page`/`--text-secondary`/`--brand-accent-subtle`/`--status-*-{fg,subtle}`). Run `pnpm design:build` first; the gitignored `tokens.generated.css` is the source of valid `var(--…)` names. NOT `--surface-bg`/`--text-fg-muted`/`--brand-accent-soft`/`--status-danger` (those were removed).
- **`@app/ui` rules:** strings come in as **props** (no `useI18n` inside); BEM-only classes, tokens-only SCSS, Storybook story + colocated spec per component.
- **Backend body parsing** is registered manually before the OpenAPI validator (`main.ts` `bodyParser:false` + `json()/urlencoded()`) — don't revert it or POST/PATCH bodies break.
- **Docker stack** (normally running): `docker compose -f docker/compose.yml up -d --build`; backend :3000, web :3001; SQLite (no postgres/redis/centrifugo). The container runs `pnpm dev` (watch) — edits hot-reload; don't run a second `pnpm dev`.
- **Playwright in this sandbox:** the `rtk` shell hook stalls browser downloads; install via the direct binary with `setsid` (`setsid bash -c './node_modules/.bin/playwright install chromium-headless-shell'`). Browser e2e otherwise runs in CI.

## Small open follow-ups (not blocking S2)

From `done.md`: mobile filter-bar tag dropdown is stubbed; no global image-cache GC; lead-image caching is per-item (cascade-deleted). Storybook axe runs in CI (no local Playwright). None block S2.
