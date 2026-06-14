# Done tasks

_Archive of shipped tasks. Never delete entries — cancelled tasks go here with reason._

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
