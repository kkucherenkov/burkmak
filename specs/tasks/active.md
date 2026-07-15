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
  - [ ] drift guard: openapi query params ↔ DTOs (prerequisite)
  - [ ] spec: shelves schemas + paths + ?shelf= + Item.shelves + regen (own commit)
  - [ ] schema + hand-written migration (shelf, shelf_item)
  - [ ] domain ports + errors (first 409 DomainError)
  - [ ] ShelfRepo + real-DB isolation specs
  - [ ] CQRS commands/queries + DTOs + controller + module wiring
  - [ ] Item.shelves on the item response
  - [ ] GET /items?shelf= (filter + repo + DTO + controller)
  - [ ] web: useApi/useShelves + /shelves pages + picker + nav + i18n
  - [ ] ui: AppShelfRow + AppShelfPicker (+ stories + specs)
  - [ ] gates + live verification (HTTP + browser, light/dark)
- Blocked-by: [#15](https://github.com/kkucherenkov/burkmak/pull/15) — ③a needs `Item.kind` (design `:221`); `feat/shelves` rebases onto `main` once it merges
- Status: blocked
- Blockers: waiting on PR #15 to merge

## T-2026-07-14-005 — bookmarks (Item.kind, slice ②)

- Created: 2026-07-14
- Owner: claude
- Spec: [specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md](../features/2026-07-13-auto-extract-shelves-bookmarks.design.md) (slice ②)
- Plan: [specs/features/2026-07-14-item-kind-bookmarks.plan.md](../features/2026-07-14-item-kind-bookmarks.plan.md)
- Goal: `Item.kind` = article | bookmark; bookmarks never extract/sync, open at source URL; web save-as-bookmark toggle + /bookmarks page; mobile queue article-only.
- Spec diff: yes (Kind enum; Item.kind required; Save/Update/listItems gain kind) — version 0.4.0 → 0.5.0
- Codegen impact: yes (ts + dart clients)
- Sub-steps:
  - [x] spec: Kind enum + Item/Save/Update/listItems + regen (own commit)
  - [x] schema + hand-written migration + ports + repo (buildItemWhere)
  - [x] save/update flows thread kind
  - [x] extraction pipeline skips bookmarks (chain + backfill)
  - [x] Kobo sync + OPDS + build-epub exclude bookmarks
  - [x] web: useApi/useItems + toggle + /bookmarks page + card variant + nav + i18n
  - [x] mobile: kind=article on list query
  - [x] gates (fixers, turbo build/lint/test/typecheck, backend container, mobile analyze)
  - [x] live verification
- PR: [#15](https://github.com/kkucherenkov/burkmak/pull/15)
- Status: in-progress (in review)
- Blockers: —
