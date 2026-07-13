# Active tasks

## T-2026-07-13-001 — auto-extract articles on save

- Created: 2026-07-13
- Owner: claude
- Spec: [specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md](../features/2026-07-13-auto-extract-shelves-bookmarks.design.md) (slice ①)
- Goal: saved articles reach reader/OPDS/Kobo without the manual extract button; existing library backfilled once.
- Spec diff: none (no wire change)
- Codegen impact: no
- Sub-steps:
  - [ ] chain extract_article after fetch_metadata success (guard: extractStatus none)
  - [ ] one-shot marker-guarded ExtractBackfillService
  - [ ] gates (lint, format, tests in container)
  - [ ] live verification: backfill log line, fresh save auto-extracts, restart no-op
- Status: in-progress
- Blockers: —
