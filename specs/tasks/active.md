# Active tasks

## T-2026-07-14-004 — Docker release images + homelab deploy

- Created: 2026-07-14
- Owner: claude
- Spec: [specs/features/2026-07-14-docker-release-images.design.md](../features/2026-07-14-docker-release-images.design.md)
- Plan: [specs/features/2026-07-14-docker-release-images.plan.md](../features/2026-07-14-docker-release-images.plan.md)
- Goal: pushing tag `vX.Y.Z` publishes backend+web images to GHCR (amd64+arm64) and creates the GitHub Release; a homelab installs via `deploy/compose.yml`.
- Spec diff: none (no HTTP API changes)
- Codegen impact: no
- Sub-steps:
  - [x] Task 1 — backend production Dockerfile (+ `prisma` → dependencies)
  - [x] Task 2 — web production Dockerfile
  - [x] Task 3 — `deploy/` homelab stack (compose, .env.example, README)
  - [x] Task 4 — `release.yml` + `docker-build.yml` workflows
  - [x] Final whole-branch review + PR
- Status: in-review — [PR #14](https://github.com/kkucherenkov/burkmak/pull/14) awaiting merge
- Blockers: —
