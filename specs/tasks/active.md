# Active tasks

## T-2026-06-14-002 — design-system token-taxonomy reconciliation

- Created: 2026-06-14
- Owner: claude
- Branch: `feat/s1-tokens-reconcile`
- Spec: follow-up from T-2026-06-14-001 (S1-ui) — user-directed (emitter taxonomy is canonical)
- Goal: rewrite every token consumer (primitives, `@theme` alias layers, mockups, web pages) onto the emitter's emitted token names so no CSS references an undefined token.
- Codegen impact: no
- Sub-steps:
  - [x] inventory undefined refs (38 names across 27 files)
  - [x] map consumed→emitted; rewrite 27 files (283 replacements)
  - [x] drop unused `--brand-accent-50..950` `@theme` scale (main.css)
  - [x] fix pre-existing raw-px lint errors (default.vue, login.vue)
  - [x] verify: 215 ui tests, stylelint clean, lint 0 errors (ui+web), web typecheck clean
- Status: in-progress
- Blockers: —
