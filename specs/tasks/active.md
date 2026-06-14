# Active tasks

## T-2026-06-14-011 — S2-mobile (reader + read-only highlights)

- Created: 2026-06-14
- Owner: claude (flutter-engineer subagent · worktree `feat/s2-mobile`)
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) · Plan: [specs/features/2026-06-14-s2-mobile.plan.md](../features/2026-06-14-s2-mobile.plan.md)
- Goal: the mobile item-detail screen reads the cleaned article (flutter_html) with live extract status (SSE) and shows the user's highlights read-only.
- Acceptance:
  - open an item → Extract → status goes `extracting → ready` live (SSE) → article renders with images
  - highlights authored on web appear as colored marks (read-only; no mobile authoring)
  - searching a body word in the library finds the item (FTS via existing `q`)
- Spec diff: none (contract already shipped in S2-backend)
- Codegen impact: no (generated `app_api_client` already committed)
- Design impact: none (mobile)
- Tests: pure highlight-inject util (unit); DetailCubit extract→ready + SSE (bloc_test); render + manual smoke
- Sub-steps:
  - [ ] T1 — flutter_html dep + ArticleRepository (over generated client)
  - [ ] T2 — pure highlight-inject util (TDD)
  - [ ] T3 — DetailCubit + state: article, extract, SSE, highlights (TDD)
  - [ ] T4 — reader screen: flutter_html + read-only marks + `reader` i18n namespace
  - [ ] T5 — full verify (analyze + test + manual smoke)
- Status: in-progress
- Blockers: —

## T-2026-06-14-010 — S2-ui (reader & highlight @app/ui composites)

- Created: 2026-06-14
- Owner: claude (frontend-engineer subagent · worktree `feat/s2-ui`)
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) · Plan: [specs/features/2026-06-14-s2-ui.plan.md](../features/2026-06-14-s2-ui.plan.md) · Mockup: `specs/design/mockups/reader-highlights.vue`
- Goal: `@app/ui` gains the four S2 composites (`AppExtractState`, `AppArticleReader`, `AppHighlightPopover`, `AppHighlightCard`) consumed by S2-web.
- Acceptance:
  - all four components exist with a Storybook story + colocated spec each, tokens-only, strings-as-props
  - `AppArticleReader` renders server-sanitized HTML and applies highlight marks per anchored quote
  - `AppExtractState` maps `none|extracting|ready|failed` to the right affordance
  - barrel exports the components + `AppHighlightData`/`AppHighlightColor` types
- Spec diff: none (no API change)
- Codegen impact: no
- Design impact: 4 new `@app/ui` components + `--highlight-{yellow,green,blue,pink}` tokens
- Tests: Vitest + @vue/test-utils per component; blocking axe in Storybook
- Sub-steps:
  - [ ] T1 — AppExtractState (extract status machine)
  - [ ] T2 — AppArticleReader (article + highlight marks + selection)
  - [ ] T3 — AppHighlightPopover (selection popover)
  - [ ] T4 — AppHighlightCard (view + edit note)
  - [ ] T5 — barrel exports + full green
- Status: in-progress
- Blockers: —
