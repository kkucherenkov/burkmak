# Active tasks

## T-2026-07-15-006 — shelves core (slice ③a)

- Created: 2026-07-15
- Owner: claude
- Spec: [specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md](../features/2026-07-13-auto-extract-shelves-bookmarks.design.md) (slice ③)
- Plan: [specs/features/2026-07-15-shelves.plan.md](../features/2026-07-15-shelves.plan.md)
- Goal: `Shelf` + `ShelfItem`; shelves CRUD + idempotent membership; `GET /items?shelf=`; `Item.shelves`; `/shelves` + `/shelves/{id}` pages + item-detail picker.
- Spec diff: yes (Shelf/ShelfSummary/ShelfList/Create/Rename schemas; 6 paths; listItems gains shelf; Item.shelves required) — version 0.5.0 → 0.6.0
- Codegen impact: yes (ts + dart clients)
- Sub-steps:
  - [x] drift guard: openapi query params ↔ DTOs (prerequisite)
  - [x] spec: shelves schemas + paths + ?shelf= + Item.shelves + regen (own commit)
  - [x] schema + hand-written migration (shelf, shelf_item)
  - [x] domain ports + errors (first 409 DomainError)
  - [x] ShelfRepo + real-DB isolation specs
  - [x] CQRS commands/queries + DTOs + controller + module wiring
  - [x] Item.shelves on the item response
  - [x] GET /items?shelf= (filter + repo + DTO + controller)
  - [x] web: useApi/useShelves + /shelves pages + picker + nav + i18n
  - [x] ui: AppShelfRow + AppShelfPicker (+ stories + specs)
  - [x] gates + live verification (HTTP + browser, light/dark)
- Branch: `feat/shelves` (rebased onto `main` after #15 merged)
- PR: [#17](https://github.com/kkucherenkov/burkmak/pull/17) — **Part of** #11, does not close it (③a of three)
- Status: in-progress (in review)
- Blockers: —
