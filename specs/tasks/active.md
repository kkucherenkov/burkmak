# Active tasks

## T-2026-07-14-005 — bookmarks (Item.kind, slice ②)

- Created: 2026-07-14
- Owner: claude
- Spec: [specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md](../features/2026-07-13-auto-extract-shelves-bookmarks.design.md) (slice ②)
- Plan: [specs/features/2026-07-14-item-kind-bookmarks.plan.md](../features/2026-07-14-item-kind-bookmarks.plan.md)
- Goal: `Item.kind` = article | bookmark; bookmarks never extract/sync, open at source URL; web save-as-bookmark toggle + /bookmarks page; mobile queue article-only.
- Spec diff: yes (Kind enum; Item.kind required; Save/Update/listItems gain kind) — version 0.4.0 → 0.5.0
- Codegen impact: yes (ts + dart clients)
- Sub-steps:
  - [ ] spec: Kind enum + Item/Save/Update/listItems + regen (own commit)
  - [ ] schema + hand-written migration + ports + repo (buildItemWhere)
  - [ ] save/update flows thread kind
  - [ ] extraction pipeline skips bookmarks (chain + backfill)
  - [ ] Kobo sync + OPDS + build-epub exclude bookmarks
  - [ ] web: useApi/useItems + toggle + /bookmarks page + card variant + nav + i18n
  - [ ] mobile: kind=article on list query
  - [ ] gates (fixers, turbo build/lint/test/typecheck, backend container, mobile analyze)
  - [ ] live verification
- Status: in-progress
- Blockers: —
