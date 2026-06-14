# Active tasks

## T-2026-06-14-009 — S2-backend (P2 extraction & reading)

- Created: 2026-06-14
- Owner: claude
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md)
- Plan: [specs/features/2026-06-14-s2-backend.plan.md](../features/2026-06-14-s2-backend.plan.md)
- Goal: backend for S2 — `extract_article` job (Readability→sanitized HTML+text+word/reading-time, local image cache) w/ live SSE; `Article` read model; FTS5 search over title+url+body; per-user highlights CRUD. All ownership-scoped.
- Spec diff: openapi.yaml — POST /items/{id}/extract, GET /items/{id}/article, GET /items/{id}/image/{key}, POST+GET /items/{id}/highlights, PATCH+DELETE /highlights/{id}; +Article/Highlight schemas; Item.extractStatus
- Codegen impact: yes
- Sub-steps (phases):
  - [x] Phase A.1: Prisma Article/Highlight/extractStatus + committed migration `20260614103000_s2_article_highlight` (6e7e29b)
  - [x] Policy: migrations-only — db push prohibited; Dockerfile.dev → migrate deploy, db:push script removed, .dockerignore added, docs updated (54eac78, cc1ff22, 3cc2dd9). Container rebuilt + boots via migrate deploy (health 200).
  - [x] Phase A.2: FTS5 table+triggers+bootstrap (84b08eb; runtime-verified in container)
  - [x] Phase A.3: OpenAPI schemas+paths → validate/bundle/codegen (85dea28; spec-reviewed APPROVE-w/-nits, nits applied; clients + dart \*.g.dart regenerated)
  - [x] Phase B: pure extractor core (TDD) + ports/adapters + image cache + ArticleRepo + FTS in listItems (2b4fc91, 03161a8, 76b0e1c); security-reviewed → SSRF guard + drop SVG cache + pin ext (dd02dad). Follow-up: DNS-rebinding (pin resolved IP on connect) deferred — low risk, self-hosted.
  - [x] Phase C: extract_article job handler (TDD) + register; ExtractArticle cmd + GetArticle query + controller routes + image serving (19450dc, 18f7d37)
  - [x] Phase D: highlights module (ports, repo, commands/queries, controller, module)
  - [ ] Phase E: multi-user isolation e2e + full green + manual smoke
- Status: in-progress
- Blockers: —
