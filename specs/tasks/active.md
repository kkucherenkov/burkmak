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
  - [ ] S0: brand rename + SQLite/WAL swap
  - [ ] S0: strip Centrifugo / Redis / Sentry+OTel / AsyncAPI
  - [ ] S0: health db-only
  - [ ] S0: jobs spine (Job model, JobsService, JobWorker, JobsModule)
  - [ ] S0: SSE spine (EventsService, EventsController, EventsModule)
  - [ ] S0: OpenAPI GET /events + codegen
  - [ ] S0: slim CI/compose + boot green
  - [ ] S1: Item/Tag/ItemTag models + migration
  - [ ] S1: OpenAPI items + tags + codegen
  - [ ] S1: items domain (ports/errors, metadata parser+fetcher, repo)
  - [ ] S1: items application (commands/queries) + DTOs/controller
  - [ ] S1: fetch_metadata handler + ItemsModule wiring
  - [ ] S1: tags module
  - [ ] S1: multi-user isolation e2e + full check
- Status: in-progress
- Blockers: —
