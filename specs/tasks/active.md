# Active tasks

## T-2026-07-14-003 — image-route containment vs untainted root (alerts #11/#12 follow-up)

- Created: 2026-07-14
- Owner: claude
- Spec: — (CodeQL js/path-injection #11/#12 survived PR #12 on main analysis)
- Goal: image route's containment check compared against a per-item dir built from the tainted id (self-referential); compare against the untainted images root instead — same pattern that closed the loadImages alert.
- Spec diff: none
- Codegen impact: no
- Sub-steps:
  - [x] items.controller: resolve against images root; single startsWith barrier
  - [ ] PR; main CodeQL closes #11/#12
- Status: in-progress
- Blockers: —
