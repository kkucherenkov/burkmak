# Active tasks

## T-2026-06-14-015 — S2-web follow-ups (type barrel, build gate, reader UX polish)

- Created: 2026-06-14
- Owner: claude
- Spec: none (cleanup) — follow-ups carried from T-014 (see done.md) + the S2-web Task-4 code review.
- Goal: retire the cross-package `.vue` type-import workaround, close the latent library-Sass build gap, and apply the deferred reader UX polish.
- Acceptance:
  - The web reader page imports highlight types from `@app/ui` directly (no OpenAPI-derived shapes / workaround comment), and `pnpm --filter @app/web lint` stays clean.
  - CI runs `@app/ui` build; the documented per-slice UI gate includes it.
  - Selection popover dismisses on outside-click; tag add/remove update optimistically; a failed extract/highlight action surfaces a visible error.
- Spec diff: none.
- Codegen impact: no.
- Design impact: `@app/ui` highlight types relocated to a `.ts` (no component/visual change).
- Tests: `@app/ui` {build,test,typecheck,lint}; web typecheck (container) + lint + production build; existing 17 unit tests stay green.
- Sub-steps:
  - [x] A — `@app/ui` highlight types → `.ts` barrel; restore web page imports from `@app/ui`
  - [x] B — add `@app/ui` build to CI + documented gates (CLAUDE.md/HANDOFF)
  - [ ] C — reader UX polish: popover outside-click dismiss, optimistic tags, error feedback
- Status: in-progress
- Blockers: —
