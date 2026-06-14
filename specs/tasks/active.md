# Active tasks

## T-2026-06-14-004 — S1-web (library / detail / settings + live SSE)

- Created: 2026-06-14
- Owner: claude
- Branch: `feat/s1-web`
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B4
- Plan: [specs/features/2026-06-13-s1-web.plan.md](../features/2026-06-13-s1-web.plan.md)
- Goal: web library experience — /library list (filters + `q`), inline save bar (pending→ready live via SSE), item metadata detail, settings; via `useApi` + `useState` composables + `@app/ui` composites.
- Depends on: S1-ui + S1-auth (merged). Codegen impact: no.
- Sub-steps:
  - [x] 1: extend useApi with item/tag methods
  - [x] 2: pure items-store + to-card-data utils (TDD)
  - [ ] 3: useItems + useTags composables
  - [ ] 4: useEvents SSE composable
  - [ ] 5: AppAddBar + AddLinkModal + library.vue
  - [ ] 6: items/[id].vue metadata detail
  - [ ] 7: settings.vue (theme + language)
  - [ ] 8: verification
- Status: in-progress
- Blockers: —
