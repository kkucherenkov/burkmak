# Active tasks

## T-2026-07-14-002 — CodeQL code-scanning remediation (16 alerts)

- Created: 2026-07-14
- Owner: claude
- Spec: — (https://github.com/kkucherenkov/burkmak/security/code-scanning)
- Goal: close all 16 open CodeQL alerts — path-injection hardening (item ids → fs paths), regex-injection escape, helmet CSP/CORP fix (also fixes the known cross-origin cached-image bug), shell→array-args in specs scripts, mockups excluded from scanning, 2 justified dismissals (FP test assertion, intended image-cache write).
- Spec diff: none
- Codegen impact: no
- Sub-steps:
  - [x] backend: safe-id validation + path containment (items image route, kobo epub route, BuildEpubService, EpubCache) + escapeRegExp in epub.builder
  - [x] main.ts helmet: CSP on in all envs, CORP cross-origin (fixes cached-image rendering across origins)
  - [x] packages/specs scripts: execSync shell strings → spawnSync array args
  - [x] codeql.yml: paths-ignore specs/design/mockups; dismiss alerts #3 (FP) + #14 (intended) with comments
  - [ ] gates green; PR; CodeQL on PR confirms alerts resolved
- Status: in-progress
- Blockers: —
