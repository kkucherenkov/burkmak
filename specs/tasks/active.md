# Active tasks

## T-2026-07-11-002 — Kobo OPDS polish: covers, pagination, search

- Created: 2026-07-11
- Owner: claude
- Spec: [specs/features/2026-07-11-kobo-opds-polish.md](../features/2026-07-11-kobo-opds-polish.md)
- Goal: OPDS feed shows covers on-device, paginates past 50 items, and is searchable from the Kobo catalog UI.
- Spec diff: openapi.yaml — `GET /api/v1/opds` gains `cursor`+`q` params; new `GET /api/v1/opds/opensearch.xml`
- Codegen impact: yes (paths only, no new JSON schemas)
- Sub-steps:
  - [ ] feature spec doc
  - [ ] openapi.yaml + spec:validate/bundle/codegen
  - [ ] Prisma migration: Article.coverImageKey
  - [ ] extract handler captures first cached image as cover
  - [ ] ARTICLE_REPO.findCoverKeys bulk lookup
  - [ ] opds.feed.ts: cover/thumbnail links, next/start links, search link; opensearch doc builder
  - [ ] KoboController: cursor + q passthrough, opensearch route
  - [ ] unit + controller tests
  - [ ] backend gates + runtime verify (curl PAT Basic)
- Status: in-progress
- Blockers: —
