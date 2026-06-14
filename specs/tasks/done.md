# Done tasks

_Archive of shipped tasks. Never delete entries — cancelled tasks go here with reason._

## T-2026-06-14-012 — fix Better Auth ↔ SQLite provider mismatch

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `dd82d09`, branch `fix/auth-sqlite-provider`, 1 commit `92a048d`).
- Spec: none (config bugfix) — see HANDOFF.md gotcha "Better Auth provider now matches the SQLite datasource".
- Root cause: `prismaAdapter(prisma, { provider: 'postgresql' })` was a monorepo-template leftover (`9fbcbcf`) that the "switch Prisma to SQLite" migration (`b8ec7a3`) never updated. The documented "can't boot the full Nest app in vitest without Postgres" blocker was **stale** — the app boots fine because Prisma reaches SQLite via the `@prisma/adapter-better-sqlite3` driver adapter, so the wrong provider never crashed. A config lie that pushed the team into repo-layer-only tests for no live reason.
- Fix: provider → `'sqlite'` (matches `schema.prisma` datasource, with a comment tying the two); added `test/auth-sqlite-boot.spec.ts` (boots the full `AppModule` over a migrated temp SQLite DB + email sign-up + bearer session round-trip — the integration test wrongly believed impossible); corrected the false "no app boot" claim in `s2.isolation.spec.ts` + `HANDOFF.md`.
- Verification: full backend suite **132/132** (29 files); typecheck + lint clean. Not a `template-fixes.md` entry — local migration miss, not a universal template bug.

## T-2026-06-14-011 — S2-mobile (reader + read-only highlights)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `c602af4`, branch `feat/s2-mobile`, 6 commits `2d937c6`→`f8344b7`).
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) · Plan: [specs/features/2026-06-14-s2-mobile.plan.md](../features/2026-06-14-s2-mobile.plan.md)
- Delivered: item-detail reader — `ArticleRepository` over the generated `ExtractionApi`/`HighlightsApi`; pure tested `injectHighlights` util (read-only `<mark>` injection); `DetailCubit` with article/extract/SSE/highlights (live `extracting→ready` via the existing SSE `item.updated`); `flutter_html` reader screen with `mark.hl-{yellow,green,blue,pink}` theming + image-origin rewrite; new slang `reader` namespace (en/ru/uk/el). No mobile highlight authoring (S2 cut).
- Reviews: spec-compliance ✅ (scope clean; baseline-fix for missing `extractStatus` confirmed legit; deviations type-safer than plan) → code-quality ✅ "merge-ready" → fixes `f8344b7` (negative-path SSE guard tests, non-destructive refetch error, `uri.origin`).
- Verification: `flutter analyze` 0 issues; `flutter test` **26/26**. (Generated slang `strings.g.dart` is gitignored — run `dart run slang` after pulling i18n source changes.)

## T-2026-06-14-010 — S2-ui (reader & highlight @app/ui composites)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `9bc210d`, branch `feat/s2-ui`, 6 commits `e981604`→`2ecf26e`).
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) · Plan: [specs/features/2026-06-14-s2-ui.plan.md](../features/2026-06-14-s2-ui.plan.md) · Mockup: `specs/design/mockups/reader-highlights.vue`
- Delivered: four `@app/ui` composites — `AppExtractState` (status machine), `AppArticleReader` (server-sanitized `v-html` + DOM-range highlight marks + selection `select` emit), `AppHighlightPopover` (4-swatch selection popover), `AppHighlightCard` (view + inline `AppTextarea` note editor); `--highlight-{yellow,green,blue,pink}` (+ `*-rail`) tokens; barrel exports + `AppHighlightData`/`AppHighlightColor` types. Storybook story + colocated spec per component, tokens-only, strings-as-props.
- Reviews: spec-compliance ✅ (extracting→`pending` badge justified) → code-quality "merge-with-fixes" → fixes `2ecf26e`: real anchoring bug fixed (`highlight-mark.ts` now anchors ALL quote occurrences per text node, not just the first — a short quote appearing twice was silently dropped), added the missing colocated `highlight-mark.spec.ts` (the two-in-one-node test failed pre-fix, passes post-fix), fixed the broken `WithHighlights` story, swapped native `<textarea>`→`AppTextarea`, lint cleanups.
- Verification: **242 tests** (22 files), typecheck 0 errors, lint 0 errors. Unblocks S2-web.

## T-2026-06-14-009 — S2-backend (P2 extraction & reading)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `d84737d`, branch `feat/s2-backend`, 21 commits). All phases A–E complete. 28 test files / 129 tests green. Typecheck clean. Live smoke passed.
  Key commits: 6e7e29b (schema), 84b08eb (FTS), 85dea28 (spec+codegen),
  2b4fc91 03161a8 76b0e1c dd02dad (extractor+repo), 19450dc 18f7d37 (job+controller),
  highlights phases (ecefa5d e2ba7bc), de599a2 (isolation test), 526e9d3 (extractStatus fix).
- Live smoke: Wikipedia article saved → extract → ready (2s); article 200 (wordCount=216,
  readingTimeMin=2, 0 `<script` tags); image 200 + `X-Content-Type-Options: nosniff`;
  FTS `?q=read-it-later` → item returned; highlight CRUD (201/200/200/204).
- Concerns: `betterAuth` uses `provider: 'postgresql'` even on SQLite — prevents booting
  full Nest app in test without a real Postgres. Isolation tests therefore use repo layer
  directly (same pattern as items.isolation.spec.ts). Image HEAD returns 405 (OpenAPI
  validator rejects it); GET works correctly.

## T-2026-06-14-008 — S2-design (reader + highlights/notes mockup)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `bddc18b`, branch `feat/s2-design`, 2 commits `95068c8`+`a60247c`).
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) §Mockups · Plan: [specs/features/2026-06-14-s2-design.plan.md](../features/2026-06-14-s2-design.plan.md)
- Delivered: `specs/design/mockups/reader-highlights.vue` — one self-contained reader scene composing all three new S2 pieces (annotated for S2-ui): `ready`-state reader column (Literata `--font-reading`/`--leading-relaxed`, ~44rem measure) with 2 inline highlight marks → `AppArticleReader`; floating selection popover (4 color swatches + Add-note) → `AppHighlightPopover`; highlights side panel of 3 cards (colored quote + note + edit/delete + timestamp) → `AppHighlightCard`; inline note editor (textarea + save/cancel) → `AppHighlightCard (editing)`. Tokens-only, responsive collapse at 56rem.
- Verification: spec-compliance review (subagent) = GO after one fix — caught 4 undocumented card-rail hexes; all 8 content hexes (4 swatch fills + 4 rails) now documented in hex→role comments (rails kept as a sibling content-color set since `color-mix` toward `--text-fg` only mutes the pale swatch, can't reach the vivid tone). 59 `var(--…)` tokens all validated against `tokens.generated.css`; no forbidden/removed names; self-contained (only imports `vue`).
- Note: swatch/rail hexes carry a `TODO(S2-ui)` to promote to `--highlight-*` tokens if reused. No tests/Storybook (mockup, per plan).

## T-2026-06-14-007 — docker e2e validation + backend body-parser fix

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (branch `feat/s1-docker-e2e`: `7edfc22` backend fix + `e247bb2` e2e spec).
- Brought up the docker stack (`docker compose -f docker/compose.yml up -d --build`) — backend + web both healthy (`200`); compose was already the simplified SQLite stack (no postgres/redis/centrifugo).
- **Bug fixed (caught by the running stack):** the express-openapi-validator middleware (`app.use('/api', …)`) registered in `bootstrap` ran BEFORE Nest's built-in body parser, so POST/PATCH to API routes (`/items`, etc.) hit the validator with an empty `req.body` → `400 must have required property 'body'`. Auth routes worked only because they bypass the validator (`ignorePaths`) and reach the controller after Nest's parser. Fix: `bodyParser:false` + explicit `json()`/`urlencoded()` before the validator (`apps/backend/src/main.ts`). Integration tests missed it (in-process supertest, different parser order).
- Verified live: sign-up `200` → save item `201` (`pending`) → `ready` ("Example Domain") via the job worker; web pages all serve + Nuxt mounts. 51 backend tests still pass.
- e2e: backend-health smoke passes; added `tests/e2e/library-flow.spec.ts` (sign-up → guarded /library → save → SSE pending→ready). Browser tests run in CI — this sandbox can't extract the Playwright browser (hung unzip; no system chrome).
- Note: the docker stack is left **running** (normal dev state).

## T-2026-06-14-006 — migrate web i18n to global .ts langDir locale files

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: commit `5b48b2b` on branch `feat/s1-toolchain` (fixes the Vite 8 + @nuxtjs/i18n `<i18n>`-block build failure tracked in T-2026-06-14-004 follow-ups)
- nuxt build: Σ Total size: 2.64 MB (✓). 17/17 tests pass. lint + typecheck green.
- Docs updated: `.claude/docs/i18n.md`, `.claude/agents/frontend-engineer.md`.

## T-2026-06-14-005 — S1-mobile (library / item_detail / add_link + live SSE)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `2e3d8d3`, branch `feat/s1-mobile`, 17 commits).
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B5 · Plan: [specs/features/2026-06-13-s1-mobile.plan.md](../features/2026-06-13-s1-mobile.plan.md)
- Delivered: feature-first Flutter — `ItemsRepository` over the generated `app_api_client` (typed built_value builders); `LibraryCubit`/`DetailCubit`/`AddLinkCubit` + Equatable states; `EventsClient` (Dio `ResponseType.stream` SSE → `Stream<AppEvent>`, pending→ready live via `LibraryCubit.subscribe`/`applyEvent`); `LibraryScreen` (+ item card + filter bar) / `ItemDetailScreen` (metadata only; reader S2) / `AddLinkScreen`; `onGenerateRoute` for library/itemDetail/addLink + AuthGate → `LibraryScreen` (fills the post-auth landing the S1-auth slice pointed at); slang i18n `library`/`itemDetail`/`addLink` × en/ru/uk/el. DI factories for the 3 cubits.
- **Codegen pipeline fix (shipped here):** `packages/specs/scripts/codegen.ts` now runs `dart run build_runner build` after `dart pub get`, so the dart-dio built_value `*.g.dart` (Builder classes + serializers) are generated and committed — the generated Dart client never actually compiled before (latent since S0). Also fixed `apps/mobile/pubspec.yaml` to point `app_api_client` at `lib/generated`.
- Verification: `flutter analyze` clean; 16 `bloc_test` cases pass (3 library + 3 detail + 2 add-link + 8 auth). Slice reviewed = GO; 3 hardcoded strings caught in review + localized.
- Follow-ups: tag-selector UI in the filter bar is stubbed (callback wired, no dropdown rendered yet); emulator manual smoke deferred (no running device this session).

## T-2026-06-14-004 — S1-web (library / detail / settings + live SSE)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `3d8b6a6`, branch `feat/s1-web`, 8 commits).
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B4 · Plan: [specs/features/2026-06-13-s1-web.plan.md](../features/2026-06-13-s1-web.plan.md)
- Delivered: `useApi` item/tag methods (typed from `@app/specs`); pure `items-store` (`upsertItem`/`removeItemById`/`routeEvent`) + `to-card-data` utils (8 unit tests); `useItems`/`useTags`/`useEvents` composables (useState stores + native `EventSource` → store, pending→ready live); `/library` page (AppFilterBar + AppItemCard list + AppEmptyState + AppSkeleton + inline AppAddBar + AddLinkModal w/ header trigger); `/items/[id]` metadata detail (reader deferred to S2); minimal `/settings` (theme + en/ru). `auth` middleware guards all three.
- Verification: 17 web unit tests; typecheck + lint (0 errors) + stylelint clean. Slice reviewed = GO. (Per-task implementation was gate-driven; one dead-UI modal-trigger gap caught in slice review + fixed.)
- Follow-ups: **`nuxt build` (production) fails compiling `<i18n>` SFC blocks** — pre-existing/latent `@nuxtjs/i18n` v10 SPA issue (`vite:json` claims the block); CI web job runs only typecheck+test (both pass) and the dev container works, so non-blocking, but production output needs a dedicated fix (memory `burkmak-web-i18n-build`; adding the intlify plugin manually double-registers). Browser smoke deferred (Docker stack down this session).

## T-2026-06-14-003 — S1-auth surface (welcome / sign-in / sign-up)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `e0b7b3a`, branch `feat/s1-auth`, 13 commits).
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B4/B5 · Plan: [specs/features/2026-06-13-s1-auth.plan.md](../features/2026-06-13-s1-auth.plan.md)
- Delivered: **web** — welcome/sign-in/sign-up pages (email/password via Better Auth `signIn.email`/`signUp.email`) + `auth`/`guest` route middleware + `index.vue` redirect (authed→/library, else /welcome); app-local `AppBrand`/`AppFormError`/`AppStrength`; pure `auth-validation` + `password-strength` utils (9 tests); `login.vue` removed, sign-out → `/sign-in`. **mobile** — `sign_in_screen` reskinned phone-OTP→email/password, `sign_up_screen` real form built (was a stub redirect), `welcome_screen` polished to mockup; email `signIn` i18n keys (en/ru/uk/el); `AuthCubit` signIn/signUp `blocTest` cases (8 tests). Email/password is now the production auth on both platforms (confirmed decision); phone-OTP cubit methods retained but unsurfaced.
- Verification: web 9 unit tests + typecheck/lint/stylelint clean; mobile `flutter analyze` clean + 8 tests. Web half and mobile half independently reviewed = GO.
- Follow-ups: the `/library` route target (web page + mobile route handler) lands in S1-web / S1-mobile — the auth redirects point at it. Browser/emulator manual smoke deferred (Docker stack not running this session).

## T-2026-06-14-002 — design-system token-taxonomy reconciliation

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `6c267bf`, branch `feat/s1-tokens-reconcile`). User-directed follow-up to S1-ui.
- Goal: rewrite every token consumer onto the emitter's canonical taxonomy so no CSS references an undefined token.
- Delivered: 283 token refs across 27 files (UI primitives, the `@theme inline` alias layers in `styles.css`/`main.css`, all `specs/design/mockups/*`, web pages/layout) rewritten consumed→emitted: surface `bg→page`/`bg-subtle,bg-muted→surface`/`surface-alt→raised`; text `fg-muted→secondary`/`fg-subtle→tertiary`/`fg-disabled→disabled`/`fg-inverse→inverse`; status `X→X-fg`/`X-soft→X-subtle`/`danger→error`; brand `soft→subtle`/`soft-hover→subtle`/`border→accent`; ease `standard→default`/`decelerate→out`; `border-soft→default`; `tracking-snug→tight`. Dropped the unused `--brand-accent-50..950` `@theme` scale. Fixed two pre-existing raw-px lint errors. The six new S1-ui components already used emitted names and were untouched.
- Verification: 215 `@app/ui` tests green; stylelint clean; lint 0 errors (ui+web); web typecheck clean. Focused independent review = GO (no cross-contamination, zero undefined refs, CSS valid).

## T-2026-06-14-001 — S1-ui composite components (@app/ui)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `dfc30e0`, branch `feat/s1-ui`, 11 commits). No remote configured → local merge (user-authorized).
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B4
- Plan: [specs/features/2026-06-13-s1-ui.plan.md](../features/2026-06-13-s1-ui.plan.md)
- Delivered: six composite `@app/ui` components — AppStatusBadge, AppTagChip, AppSkeleton, AppEmptyState, AppItemCard, AppFilterBar — each Storybook-first (CSF3 `Compositions/*`) + colocated vitest spec, strings-as-props, token-only SCSS, exported from the package barrel. Plus a typography-token source fix: `typography.json` now carries the DESIGN.md brand faces (sans→Hanken Grotesk; added display→Fraunces, reading→Literata) so `--font-display`/`--font-reading` emit.
- Verification: 215 `@app/ui` unit tests green; typecheck clean; lint 0 errors. Each task two-stage reviewed (spec compliance + code quality); final slice review = GO. Storybook axe run deferred to CI (`test:visual:ci`) — no local Playwright browsers.
- Follow-ups (NOT in this slice): (1) **design-system token-taxonomy reconciliation** — pre-existing primitives (AppButton/AppChip/AppCard/AppSelect/AppSwitch) and the `@theme inline` alias layer in `styles.css`/`main.css` reference token names the emitter does NOT produce (`--brand-accent-soft`, `--surface-bg-muted`, `--text-fg-muted`, `--text-fg-inverse`, `--status-danger`, …), so those declarations resolve to nothing. The six new components are clean (emitted names only). (2) `AppButton` has no icon-only mode — renders `label` as visible text, so AppItemCard's action column shows words next to icons. (3) Webfont assets (Hanken/Fraunces/Literata) not yet loaded — stacks fall back to generic serif/sans until then.

## T-2026-06-13-001 — S0 foundation + S1-backend core library

- Created: 2026-06-13
- Completed: 2026-06-13
- Owner: claude
- Result: merged locally to `main` (branch tip `9bb758b`; 35 commits). No remote configured, so no PR — user authorized local merge.
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md)
- Plans: [S0](../features/2026-06-13-s0-foundation.plan.md) · [S1-backend](../features/2026-06-13-s1-backend.plan.md)
- Delivered: simplified stack (SQLite/WAL via better-sqlite3, native SSE `GET /api/v1/events`, in-process DB-backed Job worker with retry/backoff — no Centrifugo/Redis/Grafana/Sentry/OTel/AsyncAPI); db-only health; items + tags core library (CQRS, ownership-scoped repos, async `fetch_metadata` job → SSE `item.updated`); OpenAPI items/tags surface + regenerated TS/Dart clients; HttpExceptionFilter maps validator status errors.
- Verification: 51 backend unit/integration tests green (incl. multi-user isolation against real SQLite); typecheck + lint clean; spec validates; codegen drift-stable; boot verified (health 200 db-only, `/events` 401, unknown route 404).
- Sub-steps: all S0 (8) + S1-backend (9) units complete; 3 final-review nits fixed (saveItem tags, isolation-test lint, updateItem minProperties).
- Follow-ups (not in this slice): S1-web + S1-mobile plans/impl; root `README.md` still describes the old Postgres/Centrifugo/Sentry architecture (needs a rewrite); container-boot migration entrypoint is `prisma db push` (fine for dev).
