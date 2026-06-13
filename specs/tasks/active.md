# Active tasks

## T-2026-06-13-001 — S0 foundation + S1-backend core library

- Created: 2026-06-13
- Owner: claude
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md)
- Plans: [S0](../features/2026-06-13-s0-foundation.plan.md) · [S1-backend](../features/2026-06-13-s1-backend.plan.md)
- Goal: simplified stack (SQLite/WAL, SSE, in-process job worker — no Centrifugo/Redis/Grafana/Sentry/OTel/AsyncAPI) booting green, then the core library backend (items/tags, async metadata via the job worker, per-user scoping).
- Spec diff: openapi.yaml — drop POST /realtime/token; add GET /events; add items + tags paths.
- Codegen impact: yes (TS + Dart clients regenerate).
- Branch: feat/s0-s1-foundation (worktree)
- Sub-steps:
  - [x] S0: brand rename + SQLite/WAL swap
  - [x] S0: strip Centrifugo / Redis / Sentry+OTel / AsyncAPI
  - [x] S0: health db-only
  - [x] S0: jobs spine (Job model, JobsService, JobWorker, JobsModule)
  - [x] S0: SSE spine (EventsService, EventsController, EventsModule)
  - [x] S0: OpenAPI GET /events + codegen (boot verified: health 200 db-only, events 401)
  - [x] S0: slim CI/compose + boot green
  - [x] S1: Item/Tag/ItemTag models + migration
  - [x] S1: OpenAPI items + tags + codegen
  - [x] S1: items domain (ports/errors, metadata parser+fetcher, repo)
  - [x] S1: items application (commands/queries) + DTOs/controller
  - [x] S1: fetch_metadata handler + ItemsModule wiring
  - [x] S1: tags module
  - [x] S1: multi-user isolation integration test + full check (50 tests green)
- Status: in-review (awaiting PR)
- Blockers: —
