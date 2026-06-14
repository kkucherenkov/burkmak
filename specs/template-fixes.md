# Template fixes — upstream candidates

_Running ledger of fixes made in this project that are **template-level scaffold bugs**, not app-specific — intended to be proposed back as a PR (or several) to the upstream monorepo template. Keep adding entries whenever a fix corrects something every project generated from the template would also hit. Last updated: 2026-06-14._

> Greenfield from a NestJS 11 + Nuxt 4 + Flutter + `packages/specs` (OpenAPI) + `packages/ui` (design tokens + components) monorepo template. The entries below would affect any project scaffolded the same way.

The headline class is **A: generator ↔ consumer mismatches** — where a code/token **generator** emits one thing but the hand-written **consumers** (UI primitives, clients, format rules) were authored against something else. These rot silently and bite every downstream project. **B** is other scaffold/config bugs.

---

## A. Generator ↔ consumer mismatches

### A1. Design-token taxonomy: emitter names ≠ theme/UI-primitive names

- **Symptom:** UI primitives and the `@theme inline` alias layers reference `var(--…)` names the token **emitter never emits** → CSS pointing at undefined tokens (silent: undefined custom properties just don't apply). e.g. components use `--surface-bg`, `--text-fg-muted`, `--brand-accent-soft`, `--status-danger`, `--status-*-soft`, `--ease-standard`, `--border-soft`; the emitter outputs `--surface-page`, `--text-secondary`, `--brand-accent-subtle`, `--status-error`, `--status-*-subtle`, `--ease-default`, `--border-default`.
- **Root cause:** the token **generator** (emitter taxonomy) and the template's theme/UI primitives were authored against two different, drifted vocabularies. Neither side is validated against the other, so the mismatch ships green.
- **Fix:** pick the **emitter taxonomy as canonical** and rewrite every consumer onto it (here: 283 refs across 27 files — UI primitives, `styles.css`/`main.css` alias layers, all `specs/design/mockups/*`, web pages/layout; dropped the unused `--brand-accent-50..950` scale). The emitted `tokens.generated.css` (run `pnpm design:build`) is the source of valid names.
- **Commit:** `6c267bf` (task `T-2026-06-14-002`).
- **Template relevance:** **high** — every project inherits the same generator + primitives, so the same undefined-token mismatch. Ideal template fix: make the primitives/alias layers consume the emitted names (and/or add a CI check that fails on any `var(--…)` not present in `tokens.generated.css`) so generator and consumers can't drift.

### A2. Generated `openapi-types.ts` reformatted by `pnpm format` on every run

- **Symptom:** every `pnpm format` rewrites `packages/specs/src/openapi-types.ts` (~1600 lines, 4-space→2-space) → phantom churn in unrelated commits.
- **Root cause:** the file is `openapi-typescript` **generator** output but lives in `src/` (not a `generated/` dir), so `.prettierignore` (which lists the `generated/` dirs) misses it while the `**/*.ts` format glob catches it. The codegen script also ran a redundant `prettier --write` on it.
- **Fix:** add `packages/specs/src/openapi-types.ts` to `.prettierignore`; drop the redundant post-codegen `prettier --write` (raw generator output is deterministic — verified byte-identical).
- **Commit:** `104a4eb`.
- **Template relevance:** **high** — the codegen output path is template-provided; the consumer (prettier config) doesn't account for it.

### A3. Dart client codegen skipped `build_runner` → generated client never compiled

- **Symptom:** the generated `@app/api-client-dart` didn't compile — the dart-dio `built_value` `*.g.dart` part files (Builders + serializers) were never generated.
- **Root cause:** the **generator** script (`packages/specs/scripts/codegen.ts`) ran `openapi-generator` + `dart pub get` but not `dart run build_runner build`, so the consumer (the Flutter app / dart tests) had a non-compiling client.
- **Fix:** codegen now runs `dart run build_runner build` (+ `dart fix --apply`) and commits the `*.g.dart`. (Requires the Dart SDK on PATH.)
- **Commit:** shipped in S1-mobile (task `T-2026-06-14-005`, merge `2e3d8d3`).
- **Template relevance:** **high** — latent since the template's S0 scaffold; any project using the dart client hits it.

---

## B. Other scaffold / config fixes

### B1. Missing root `.dockerignore` → `docker compose build` fails

- **Symptom:** `docker compose build backend` dies during "checking context" on `no permission to read from .../apps/web/node_modules/.tmp/...` (root-owned cache files); also slow (whole repo + `node_modules` sent as context).
- **Root cause:** no root `.dockerignore`. Dev Dockerfiles COPY nothing (compose volume-mounts the repo at runtime), so `node_modules`/artifacts shouldn't be in the build context.
- **Fix:** root `.dockerignore` excluding `**/node_modules`, build artifacts, `*.db*`, `.git`, logs.
- **Commit:** `cc1ff22`.

### B2. `prisma db push` dev entrypoint despite committed migrations

- **Symptom:** repo ships committed migrations, but the dev DB is built by `db push` → no `_prisma_migrations` baseline → `migrate dev` fails with drift.
- **Root cause:** `apps/backend/Dockerfile.dev` entrypoint ran `prisma:db:push`; a `prisma:db:push` script existed — contradicting the committed-migrations setup.
- **Fix:** entrypoint `db push` → `prisma migrate deploy`; remove `prisma:db:push`; document "db push prohibited".
- **Commit:** `54eac78` (+ docs `3cc2dd9`).
- **Note:** the template should pick one model — migrations + `migrate deploy`, OR db-push-only with no committed migrations. Shipping both is the footgun.

### B3. OpenAPI validator runs before Nest's body parser → empty `req.body`

- **Symptom:** every POST/PATCH to an API route 400s with `must have required property 'body'`; only auth routes (which bypass the validator) work.
- **Root cause:** `express-openapi-validator` (`app.use('/api', …)`) registered in bootstrap **before** Nest's body parser.
- **Fix:** `main.ts` `bodyParser:false` + explicit `json()`/`urlencoded()` before the validator.
- **Commit:** `7edfc22`.
- **Note:** in-process supertest tests miss it (different parser order) — only surfaces against a running server.

### B4. Web `<i18n>` SFC blocks break `nuxt build` (Vite 8 + @nuxtjs/i18n)

- **Symptom:** production `nuxt build` fails compiling `<i18n lang="json">` SFC blocks (`vite:json` claims the block).
- **Root cause:** @nuxtjs/i18n v10 + Vite 8 SPA incompatibility with per-component `<i18n>` blocks (a common template default).
- **Fix:** global `.ts` langDir locales (`apps/web/i18n/locales/{en,ru}.ts`, `useI18n()` + namespaced keys); remove `<i18n>` blocks.
- **Commit:** `5b48b2b`.

### B5. `@app/ui` library `build` absent from every gate → latent SCSS errors ship

- **Symptom:** a Dart-Sass compile error in a `@app/ui` component (here: a `&--<mod>` BEM suffix nested under a `:deep()` pseudo — invalid Sass) shipped green through the per-slice gate **and** CI; it only surfaced later when a _consumer_ build (web `nuxt build`) finally compiled the library.
- **Root cause:** only `vite build` compiles component SCSS through Dart Sass — `vue-tsc`/vitest don't. But turbo's `build` task is `dependsOn: ["^build", …]` (builds a package's **dependencies**, never itself), so `pnpm --filter @app/ui {test,typecheck,lint}` never builds `@app/ui`. CI had **only** `audit:components` for `@app/ui` (no build/lint/typecheck/test). So a broken stylesheet is latent until a downstream consumer build pulls `@app/ui#build` via `^build`.
- **Fix:** add the library `build` to the gates — a full `ui` CI job (`design:build` → lint/typecheck/test/**build**/audit) and `build` in the documented local gates (`turbo run build lint test typecheck`, the per-slice UI gate, the PR checklist).
- **Commits:** `240c629` (T-013, the SCSS symptom fix) + `a0779a0` (T-015, the structural gate fix).
- **Template relevance:** **high** — every project's component library has SCSS that compiles only at build time; the template's gate + CI omit the library build, so the same class of error ships latent everywhere.

### B6. `@app/ui` exported types declared inside `.vue` SFCs → cross-package consumers can't import them

- **Symptom:** importing a `@app/ui` exported type (e.g. `AppHighlightData`) from another package (the web app) makes typescript-eslint's `projectService` resolve it to an `error`/`any` type → hard **lint** errors, even though `vue-tsc` resolves it fine (passes typecheck, fails lint). Consumers resort to re-deriving the shape (S2-web derived it from the OpenAPI contract).
- **Root cause:** the component scaffold declares exported types **inside** `.vue` SFCs (e.g. `AppHighlightColor`/`AppHighlightData` in `AppArticleReader.vue`, `AppItemCardData` in `AppItemCard.vue`, `AppFilterSegment`, `AppSelectOption`), and the barrel re-exports `from './X.vue'`. typescript-eslint's projectService can't resolve `.vue` type exports across a package boundary.
- **Fix:** declare cross-package exported types in a plain `.ts` module; the SFC and the barrel import/re-export from the `.ts` (here: `AppArticleReader/highlight-types.ts`).
- **Commit:** `325b9c9` (T-015).
- **Template relevance:** **high** — the template's types-in-`.vue` convention bites any cross-package type consumer; the same fix applies to the other SFC-declared exported types if/when they're consumed outside `@app/ui`.

---

## C. Candidates (not yet fixed — flag for the template)

### C1. betterAuth hardcodes `provider: 'postgresql'` on a SQLite stack

- **Symptom:** the app runs on SQLite, but betterAuth declares `provider: 'postgresql'`, so a full Nest app can't boot in vitest against SQLite — backend isolation/e2e tests run at the repo/domain layer instead of over HTTP.
- **Likely fix:** make the auth provider track the configured datasource (config-driven) so tests can boot the full app on the same DB the app uses.
- **Status:** worked around here (repo-layer isolation tests + live docker smoke). Needs a template design decision.

---

## How to propose

Group **A** (generator↔consumer mismatches) is the strongest, most reusable PR — these silently affect every downstream project. Each A-entry could be its own PR, or one "generator/consumer consistency" PR (ideally adding CI guards: a token-name validator against `tokens.generated.css`, the existing codegen-drift guard extended to `openapi-types.ts`, and a dart-client compile check). Group **B** is independent scaffold fixes. **C1** needs a template decision first. Every entry lists the commit to cherry-pick the diff from.
