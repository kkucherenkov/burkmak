# Active tasks

## T-2026-07-11-003 — Kobo native sync (store-API emulation)

- Created: 2026-07-11
- Owner: claude
- Spec: [specs/features/2026-07-11-kobo-native-sync.md](../features/2026-07-11-kobo-native-sync.md)
- Plan: [specs/features/2026-07-11-kobo-native-sync.plan.md](../features/2026-07-11-kobo-native-sync.plan.md)
- Goal: Kobo pointed at `/api/v1/kobo/<PAT>` auto-syncs extracted articles as KEPUBs and pushes reading progress / Finished back.
- Spec diff: none (device mount excluded from contract, documented in overview; validator ignorePaths)
- Codegen impact: no
- Sub-steps:
  - [x] Phase A: Prisma models + migration, PatService.resolveSecret, validator ignore, openapi overview note
  - [x] Phase B: store module (guard, sync token, builders, repo, services, controller, init resources) — 202/202 backend tests green, lint+typecheck clean
  - [x] Phase C: curl device simulation — auth stub, initialization resources, first sync (NewEntitlement + real Size), KEPUB download, cover 200, PUT Finished → readState=read, delta re-sync, archive → IsRemoved, unknown → {}, bad token → 401
  - [ ] On-device verification (physical Kobo) — documented ceiling
- Status: in-progress (awaiting PR + physical-device check)
- Blockers: —

## T-2026-07-11-002 — Kobo OPDS polish: covers, pagination, search

- Created: 2026-07-11
- Owner: claude
- Spec: [specs/features/2026-07-11-kobo-opds-polish.md](../features/2026-07-11-kobo-opds-polish.md)
- Goal: OPDS feed shows covers on-device, paginates past 50 items, and is searchable from the Kobo catalog UI.
- Spec diff: openapi.yaml — `GET /api/v1/opds` gains `cursor`+`q` params; new `GET /api/v1/opds/opensearch.xml`
- Codegen impact: yes (paths only, no new JSON schemas)
- Sub-steps:
  - [x] feature spec doc
  - [x] openapi.yaml + spec:validate/bundle/codegen (84acb05)
  - [x] Prisma migration: Article.coverImageKey (hand-written; migrate dev drift-blocked by FTS5 virtual tables, applied via migrate deploy)
  - [x] extract handler captures first cached image as cover
  - [x] ARTICLE_REPO.findCoverKeys bulk lookup
  - [x] opds.feed.ts: cover/thumbnail links, next/start links, search link; opensearch doc builder
  - [x] KoboController: cursor + q passthrough, opensearch route
  - [x] unit tests (166 backend tests green; typecheck + lint clean)
  - [x] runtime verify: PAT Basic feed w/ cover links; cover fetch 200 image/png; q=EPUB → 1 entry; kepub download 200 (165KB, real Wikipedia article); bad cursor → 200 first page; no auth → 401
- Status: in-progress (awaiting PR)
- Blockers: —
