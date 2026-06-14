# Active tasks

## T-2026-06-14-014 — S2-web (reader view & highlight authoring)

- Created: 2026-06-14
- Owner: claude
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) · Plan: [specs/features/2026-06-14-s2-web.plan.md](../features/2026-06-14-s2-web.plan.md)
- Goal: `/items/[id]` becomes a full web reader — trigger extraction (live `extracting → ready` via SSE), read the cleaned article, select text to create color highlights with optional notes, and manage them in a side panel. FTS body search comes free via the existing library `q`.
- Acceptance:
  - Opening an un-extracted item shows an extract affordance; triggering it flips `extracting → ready` live (SSE) without reload.
  - When ready, the article renders (with images) and selecting text offers a color popover that creates a persisted highlight.
  - Highlights appear as marks in the body + cards in a side panel; notes can be added/edited/cleared; highlights survive reload.
  - Searching a word from the article body in the library surfaces the item.
- Spec diff: none (S2 OpenAPI contract + generated `@app/api-client-{ts,dart}` already committed).
- Codegen impact: no.
- Design impact: none new — composes the shipped S2-ui composites (`AppArticleReader`, `AppExtractState`, `AppHighlightPopover`, `AppHighlightCard`) + `--highlight-*` tokens.
- Tests: typecheck (vue-tsc, in container) + the production `nuxt build` gate (the integration gate); host unit suite 17/17. The Task-2 `highlight-anchor` util was removed in Task 4 — the shipped `AppArticleReader.select` already emits the `{quote,prefix,suffix}` anchor, so a page-side util was redundant + unwireable. Interactive browser smoke (SSE flip, highlight persist, FTS-in-UI) deferred to manual/CI e2e — no local Playwright in this sandbox.
- Sub-steps:
  - [x] Task 1 — extend `useApi` with article + highlight methods
  - [x] Task 2 — pure `highlight-anchor` util (TDD) — later removed in Task 4 (superseded by `AppArticleReader.select`)
  - [x] Task 3 — `useArticle` + `useHighlights` composables
  - [x] Task 4 — rewrite `pages/items/[id].vue` reader view + i18n (en/ru)
  - [x] Task 5 — FTS `q` wiring confirmed (no web change); full verify green; routes probed (article/highlights/extract → 401 = mounted)
- Status: in-progress (implementation complete + verified; awaiting final review + merge authorization)
- Blockers: —
