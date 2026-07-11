# Active tasks

## T-2026-07-11-002 — Kobo OPDS polish: covers, pagination, search

- Created: 2026-07-11
- Owner: claude
- Spec: [specs/features/2026-07-11-kobo-opds-polish.md](../features/2026-07-11-kobo-opds-polish.md)
- Goal: OPDS feed shows covers on-device, paginates past 50 items, and is searchable from the Kobo catalog UI.
- Spec diff: openapi.yaml — `GET /api/v1/opds` gains `cursor`+`q` params; new `GET /api/v1/opds/opensearch.xml`
- Codegen impact: yes (paths only, no new JSON schemas)
- Sub-steps:
  - [x] feature spec doc
  - [x] openapi.yaml + spec:validate/bundle/codegen (84acb05)
  - [x] Prisma migration: Article.coverImageKey (hand-written; migrate dev drift-blocked by FTS5 virtual tables, applied via migrate deploy)
  - [x] extract handler captures first cached image as cover
  - [x] ARTICLE_REPO.findCoverKeys bulk lookup
  - [x] opds.feed.ts: cover/thumbnail links, next/start links, search link; opensearch doc builder
  - [x] KoboController: cursor + q passthrough, opensearch route
  - [x] unit tests (166 backend tests green; typecheck + lint clean)
  - [x] runtime verify: PAT Basic feed w/ cover links; cover fetch 200 image/png; q=EPUB → 1 entry; kepub download 200 (165KB, real Wikipedia article); bad cursor → 200 first page; no auth → 401
- Status: in-progress (merging)
- Blockers: —

## T-2026-07-11-001 — dark theme fixes + theme switcher in header + tag filter reset

- Created: 2026-07-11
- Owner: claude
- Spec: —
- Goal: no dark-on-dark text in dark mode; theme (light/dark/system) switchable from the layout header and settings page; tag filter can be reset to "all tags".
- Spec diff: none (frontend-only)
- Codegen impact: no
- Sub-steps:
  - [x] audit + fix dark-mode token/style offenders (web + @app/ui): AppChip primary soft/subtle/outline used --brand-accent-fg (on-solid color) → dark-on-dark; --highlight-\* tokens were Storybook-only + light-only → shared @app/ui/theme.css with .dark overrides; color-scheme rules keyed on never-set data-theme → now also .light/.dark classes
  - [x] AppThemeToggle component in @app/ui (story + spec)
  - [x] wire toggle into default layout header + settings page (3-way select); add Settings nav link
  - [x] AppFilterBar: "All tags" option emits null tag (story + spec updated)
  - [x] i18n keys en/ru
  - [x] lint/stylelint/format + tests (249 ui tests, ui+web typecheck)
  - [x] e2e verified in-browser: toggle, settings select persistence, tag filter 2→1→2 cards
- Status: in-progress (merging)
- Blockers: —
