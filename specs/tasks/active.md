# Active tasks

## T-2026-07-14-001 — fix CI security-audit criticals (better-auth, shell-quote)

- Created: 2026-07-14
- Owner: claude
- Spec: — (dependency security fix; advisories GHSA-pw9m-5jxm-xr6h, GHSA-w7jw-789q-3m8p)
- Goal: first CI run on GitHub failed `pnpm audit --audit-level=critical` — bump `better-auth` floor to ^1.6.11 (backend + web) and override transitive `shell-quote` ≥1.8.4 (nuxt→devtools→launch-editor chain).
- Spec diff: none
- Codegen impact: no
- Sub-steps:
  - [x] bump better-auth to ^1.6.11 in apps/backend + apps/web, add root pnpm override shell-quote >=1.8.4
  - [x] pnpm install; `pnpm audit --audit-level=critical` exits 0
  - [x] backend + web test suites green (209 + 31); live sign-up smoke on 1.6.23 OK
  - [ ] PR opened, CI green
- Status: in-progress
- Blockers: —
