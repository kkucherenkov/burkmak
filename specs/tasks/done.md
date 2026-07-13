# Done tasks

_Archive of shipped tasks. Never delete entries — cancelled tasks go here with reason._

## T-2026-07-14-003 — image-route containment vs untainted root (alerts #11/#12 follow-up)

- Created: 2026-07-14
- Completed: 2026-07-14
- Owner: claude
- Spec: — (CodeQL js/path-injection #11/#12 survived PR #12's main analysis)
- Result: merged via [PR #13](https://github.com/kkucherenkov/burkmak/pull/13) (merge commit `e9770cf`, 1 commit `6004383`); branch deleted. Post-merge main CodeQL analysis: **0 open alerts** — the repo's code-scanning page is fully clean.
- Delivered: image route containment now resolves against the constant images root (`startsWith(imagesRoot + sep)`) instead of a per-item dir built from the tainted id — the old check was self-referential (a traversal id relocated the base dir too); CodeQL was right to keep the alerts open. Same barrier shape that closed the `loadImages`/`EpubCache` alerts. `assertSafeItemId` remains the primary gate.
- Verified: backend 216/216, typecheck clean; PR CI 8/8 green; main CodeQL run closed #11/#12.

## T-2026-07-14-002 — CodeQL code-scanning remediation (16 alerts)

- Created: 2026-07-14
- Completed: 2026-07-14
- Owner: claude
- Spec: — (https://github.com/kkucherenkov/burkmak/security/code-scanning)
- Result: merged via [PR #12](https://github.com/kkucherenkov/burkmak/pull/12) (merge commit `136f16c`, 1 commit `3b50e04`); branch deleted. PR-head CodeQL analysis: **0 open alerts** (was 16).
- Delivered: `common/security/safe-id.ts` (cuid charset gate, 404 on mismatch) applied at items image route, kobo EPUB route, and `BuildEpubService.getEpub` (covers Kobo store download); resolve+containment checks in `EpubCache.cachePath` + `loadImages` — the image route's old prefix check was bypassable in principle (traversal id relocated the base dir); full regex-metachar escaping in `rewriteImageSrcs`; helmet CSP on in every env + CORP `cross-origin` (root-causes the split-origin cached-image blocking bug from the README work); specs scripts `execSync` shell strings → `spawnSync` arg arrays; codeql.yml `paths-ignore` for `specs/design/mockups`. Alerts #3 (bookmarklet test assertion — FP) and #14 (image cache write is the feature) dismissed with comments.
- Verified: backend typecheck clean, 216/216 (7 new traversal/containment tests); `spec:diff` smoke-run after rewrite; live CSP + CORP headers on restarted stack; PR CI 0 failed.

## T-2026-07-14-001 — fix CI security-audit criticals (better-auth, shell-quote)

- Created: 2026-07-14
- Completed: 2026-07-14
- Owner: claude
- Spec: — (advisories [GHSA-pw9m-5jxm-xr6h](https://github.com/advisories/GHSA-pw9m-5jxm-xr6h), [GHSA-w7jw-789q-3m8p](https://github.com/advisories/GHSA-w7jw-789q-3m8p))
- Result: merged via [PR #8](https://github.com/kkucherenkov/burkmak/pull/8) (merge commit `5cdf76f`, 1 commit `b850bb1`); branch deleted. First green CI on GitHub.
- Delivered: `better-auth` floor `^1.6.8`→`^1.6.11` in backend + web (lockfile resolves 1.6.23; OAuth refresh-token replay in oidc-provider/mcp plugins — not mounted here, upgraded anyway); root pnpm override `shell-quote >=1.8.4` (resolves 1.10.0; transitive via nuxt→@nuxt/devtools→launch-editor). No audit-gate softening.
- Verified: `pnpm audit --audit-level=critical` exit 0; backend 209/209 in container, web 31/31; live sign-up smoke 200 on restarted stack (containers need their own `pnpm install` — node_modules volumes don't see host installs). Remaining 121 sub-critical advisories left to Dependabot PRs.

## T-2026-07-13-002 — README refresh + GitHub publication tidy

- Created: 2026-07-13
- Completed: 2026-07-14
- Owner: claude
- Spec: [specs/features/2026-07-13-readme-refresh.design.md](../features/2026-07-13-readme-refresh.design.md)
- Plan: [specs/features/2026-07-13-readme-refresh.plan.md](../features/2026-07-13-readme-refresh.plan.md)
- Result: merged to `main` via `--no-ff` as `34ec25a` (8 commits `c3a9208`→`034f0f9`); branch deleted.
- Delivered: README brought to P6 truth — status blockquote P1–P6, auto-extraction + theme bullets, "automatic with manual re-extract" wording, two-tier Kobo section (OPDS catalog + native store sync with `Kobo eReader.conf` `api_endpoint` setup, physical-device ceiling kept honest), roadmap P6 row, mermaid kobo node/edge. 4 real app screenshots (library light/dark, reader with live highlight, save flow; fresh seeded user, devtools-free, no broken images) replace the mockup renders; `welcome.png` removed. 3 merged stale branches deleted; 24 relative links verified.
- Found for future code branches: helmet's CORP `same-origin` header blocks locally-cached article images cross-origin (web:3001 vs api:3000 — hits any split-origin deploy; relax CORP on the image-cache route); `POST /items/{id}/tags` returns 201 but the spec allows only 200, so the validator 400s a successful mutation.

## T-2026-07-13-001 — auto-extract articles on save

- Created: 2026-07-13
- Completed: 2026-07-13
- Owner: claude
- Spec: [specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md](../features/2026-07-13-auto-extract-shelves-bookmarks.design.md) (slice ①)
- Plan: [specs/features/2026-07-13-auto-extract-on-save.plan.md](../features/2026-07-13-auto-extract-on-save.plan.md)
- Result: merged to `main` via `--no-ff` as `acc2f3d` (11 commits `412b10c`→`3f7b327`); branch deleted.
- Delivered: `FetchMetadataHandler` chains `extract_article` after metadata success (guard `extractStatus === 'none'`; chain failure logs + reverts to `none` instead of riding the metadata catch into a bogus `failed`), one-shot `ExtractBackfillService` in `extract-backfill.bootstrap.ts` (marker = completed `extract_backfill` Job row; errors swallowed so boot never fails; `*.bootstrap.ts` suffix keeps the modules/\*\*/\*.service.ts Prisma DI rule intact — no eslint-disable). No wire change. 6 new units (209 backend total).
- Verified live: backfill enqueued 2 pre-existing items (`none→ready`), marker singleton, second boot silent; fresh save `none→ready` in ~3s with `/extract` never called ("How to Do Great Work" extracted). Slices ② (Item.kind bookmarks) and ③ (shelves + Kobo collections) remain in the design doc.

## T-2026-07-11-003 — Kobo native sync (store-API emulation)

- Created: 2026-07-11
- Completed: 2026-07-11
- Owner: claude
- Spec: [specs/features/2026-07-11-kobo-native-sync.md](../features/2026-07-11-kobo-native-sync.md)
- Plan: [specs/features/2026-07-11-kobo-native-sync.plan.md](../features/2026-07-11-kobo-native-sync.plan.md)
- Result: merged to `main` via `--no-ff` as `38c44ab` (2 commits `6774139`, `6bc18b3`); branch deleted.
- Delivered: `/api/v1/kobo/:token/*` store mount (PAT in path — Nickel can't send auth headers): auth stubs, initialization Resources rewrite, library/sync delta engine (KoboEntitlement table for "new" detection, x-kobo-synctoken timestamps, IsRemoved tombstones, continuation at 100), metadata, KEPUB download, cover route, DELETE→archive, reading-state GET/PUT with write-back (Finished→read, ReadyToRead→unread), catch-all `{}` (no store proxy). KoboEntitlement + KoboReadingState models (hand-written migration — FTS5 drift blocks migrate dev). 36 new units (202 backend total).
- Verified: curl device simulation end-to-end (init → sync → download → PUT Finished → readState flipped → delta re-sync → archive → IsRemoved → 401). **On-device check on a physical Kobo still pending** — documented ceiling; needs HTTPS in front of the API.

## T-2026-07-11-002 — Kobo OPDS polish: covers, pagination, search

- Created: 2026-07-11
- Completed: 2026-07-11
- Owner: claude
- Spec: [specs/features/2026-07-11-kobo-opds-polish.md](../features/2026-07-11-kobo-opds-polish.md)
- Result: merged to `main` via `--no-ff` as `a22543e` (5 commits `eb587d3`→`914a995`); branch deleted.
- Delivered: `Article.coverImageKey` (first cached content image, captured at extraction; hand-written migration), OPDS entries with image/thumbnail links (remote lead-image fallback), cursor pagination (page 50, rel=next/start), OpenSearch (`/opds/opensearch.xml` + rel=search, `q` filter). Clients regenerated (`645fad3`).
- Verified: curl with real PAT — covers 200 image/png, q filter, KEPUB 165KB from a real Wikipedia article, bad cursor → first page, no auth → 401.

## T-2026-07-11-001 — dark theme fixes + theme switcher in header + tag filter reset

- Created: 2026-07-11
- Completed: 2026-07-11
- Owner: claude
- Spec: —
- Result: merged to `main` via `--no-ff` as `272b2af` (5 commits `9716f23`→`92e88ce`); branch deleted.
- Delivered: AppChip primary soft/subtle/outline contrast fix (--brand-accent-fg misuse → dark-on-dark in dark AND white-on-peach in light), shared `@app/ui/theme.css` (highlight tokens with dark variants — previously Storybook-only, transparent in the app; class-keyed color-scheme rules), new AppThemeToggle (story+spec) in the layout header, Settings nav link, 3-way theme select on settings, AppFilterBar "All tags" reset option, en/ru keys, AppSelectOption moved to select-types.ts.
- Verified: chromium e2e under forced dark/light — toggle, preference persistence over reload, tag filter 2→1→2 cards; 249 ui tests.

## T-2026-06-15-005 — Kobo Sync: OPDS catalog + EPUB/KEPUB (P4)

- Created: 2026-06-15
- Completed: 2026-06-15
- Owner: claude
- Spec: [specs/features/2026-06-15-kobo-sync.md](../features/2026-06-15-kobo-sync.md)
- Plan: [specs/features/2026-06-15-kobo.plan.md](../features/2026-06-15-kobo.plan.md)
- Result: merged to `main` via `--no-ff` as `c0d2088` (7 commits `c3bc2d2`→lint-fix); branch deleted. `app.module.ts` import-array conflict with the parallel obsidian-backend merge resolved (kept both `ExportModule` + `KoboModule`).
- Delivered: `jszip` dep; pure `epub.builder.ts` (EPUB3, mimetype-first STORE, `urn:burkmak:<id>`, embedded images with rewritten `src`), `kepub.transform.ts` (Kobo span injection, idempotent), `opds.feed.ts` (OPDS 1.2 Atom, XML-escaped, valid empty feed), `epub.cache.ts` (disk cache `data/epub/<itemId>/<variant>-<extractedAt>.epub`), `build-epub.service.ts` (ownership → not_ready guard → cache → build); `KoboController` (`GET items/:id/epub` streams `application/epub+zip`, 404/409; `GET opds` atom-xml); `ItemsModule` exports `ITEM_REPO`/`ARTICLE_REPO`; `AppConfig.publicApiBaseUrl` getter (via ConfigService, not process.env). 9 unit tests.
- Auth: shared `SessionGuard` (PAT Basic for OPDS) — no kobo-specific auth. Native Kobo store-API sync remains a documented fast-follow (device-unverifiable here).
- Gates: backend lint + typecheck clean; `pnpm --filter @app/backend test` 159/159 on the merged tree (PAT + export + kobo).

## T-2026-06-15-006 — Obsidian Plugin (packages/obsidian-plugin)

- Created: 2026-06-15
- Completed: 2026-06-15
- Owner: claude
- Spec: [specs/features/2026-06-15-obsidian-export.md](../features/2026-06-15-obsidian-export.md)
- Plan: [specs/features/2026-06-15-obsidian-plugin.plan.md](../features/2026-06-15-obsidian-plugin.plan.md)
- Result: merged to `main` via `--no-ff` (7 commits `254c4fc`→`c779054`); branch deleted. **Completes P5 (Obsidian export).**
- Delivered:
  - T1 — scaffold `packages/obsidian-plugin`: package.json, manifest.json, tsconfig.json, esbuild.config.mjs, vitest.config.ts, eslint.config.mjs, .gitignore (workspace globs `packages/*`).
  - T2 — `src/lib/export-url.ts` (`buildExportUrl` trims slash, appends `/export/markdown`, params only when set); 2 TDD tests.
  - T3 — `src/lib/frontmatter.ts` (`parseBurkmakId` from leading YAML block); 3 TDD tests.
  - T4 — `src/settings.ts` (`BurkmakSettings` + `DEFAULT_SETTINGS`; settings tab: baseUrl, token (password), folder, readState, includeEmpty).
  - T5 — `src/main.ts` (`BurkmakPlugin`, "Sync from burkmak" command; `requestUrl` Bearer PAT, idempotent write by `burkmakId`, per-note error-continue, Notice summary).
  - T6 — README (manual/BRAT install, setup, usage); `main.js`/`*.map` gitignored.
- Gates: 4/4 lib tests; typecheck + lint clean; build emits `main.js` (23.3 kb CJS); `main.js` NOT committed (manifest + src are).
- Deviations: `requestUrl` (CORS-safe) per plan; base.json `exactOptionalPropertyTypes` → conditional spread for the `readState` filter; `noImplicitOverride` → `override` on `settings`/`display()`; eslint `projectService` ↔ `project` key removed locally.
- Verification ceiling: pure libs unit-tested + package builds here; the in-Obsidian runtime (settings, Sync command, vault writes) is verifiable only inside Obsidian — out of sandbox.

## T-2026-06-15-004 — Obsidian Export Backend API

- Created: 2026-06-15
- Completed: 2026-06-15
- Owner: claude
- Spec: [specs/features/2026-06-15-obsidian-export.md](../features/2026-06-15-obsidian-export.md)
- Plan: [specs/features/2026-06-15-obsidian-backend.plan.md](../features/2026-06-15-obsidian-backend.plan.md)
- Result: merged to `main` via `--no-ff` as `716315d` (4 feature commits `c0ffdf4`→`4a3f5d7`); branch deleted.
- Delivered:
  - T1 (`feat(backend): export filename slug (obsidian-backend)`) — `slugify.ts`: lowercase, collapse non-alnum runs to `-`, trim, append `-<id>.md`; fallback to `<id>.md` when title null/empty. 3 TDD unit tests.
  - T2 (`feat(backend): obsidian markdown renderer (obsidian-backend)`) — `render-note.ts`: YAML frontmatter (`burkmakId`, `title`, `url`, `canonicalUrl`?, `source`?, `savedAt`, `readingTimeMin`?, `tags`?), body H1 + metadata line + `## Highlights` blockquotes with notes; YAML-special title quoting; null siteName/readingTime omitted cleanly. 3 TDD tests (6 assertions).
  - T3 (`feat(backend): export queries (obsidian-backend)`) — `export.ports.ts` (EXPORT_REPO symbol, ExportItem/ExportHighlight/ExportListFilter, IExportRepo); `ExportMarkdownQuery/Handler` (bundle, filter+includeEmpty); `ExportItemMarkdownQuery/Handler` (single, throws ItemNotFoundError on miss); `export.repo.ts` (Prisma joined select with highlights+article). exactOptionalPropertyTypes compliant.
  - T4 (`feat(backend): export endpoints (obsidian-backend)`) — `ExportMarkdownDto` (readState enum, since ISO8601, includeEmpty bool-string); `ExportController` (`@Controller({ version: '1' })`): `GET export/markdown` → JSON bundle, `GET items/:id/export/markdown` → `text/markdown` via `@Res()`; `ExportModule`; registered in `AppModule`.
- Gates: `pnpm --filter @app/backend lint` clean; `pnpm --filter @app/backend typecheck` clean; `pnpm --filter @app/backend test` 150/150 green (31 test files).
- Self-review: frontmatter carries `burkmakId`; YAML-special titles quoted (`title: "A: B #c"`); null note/siteName/readingTime omitted; `includeEmpty=false` filters highlight-less items; auth via shared `SessionGuard` (PAT Bearer already in); renderer pure + fully TDD.

## T-2026-06-15-003 — Personal Access Tokens (backend + web)

- Created: 2026-06-15
- Completed: 2026-06-15
- Owner: claude
- Spec: [specs/features/2026-06-15-personal-access-tokens.md](../features/2026-06-15-personal-access-tokens.md)
- Plan: [specs/features/2026-06-15-pat.plan.md](../features/2026-06-15-pat.plan.md)
- Result: merged to `main` via `--no-ff` as `be787ed` (7 commits `9df340b`→`8cb5a7d`); branch deleted. Shared enabler — unblocks P4 (Kobo OPDS, Basic auth) + P5 (Obsidian plugin, Bearer auth).
- Delivered (web, Task 6, `8cb5a7d`): `useApi` create/list/revokeToken; `app/utils/token-view.ts` (formatLastUsed, tokenRows) + 7 TDD specs; `settings.vue` Personal-access-tokens card (create / copy-once / revoke); `settings.tokens.*` i18n (en+ru). Gates: web 31 tests, container typecheck + nuxt build, lint, stylelint, format ✓.
- Delivered (backend, Tasks 1–5):
  - T1 (`feat(backend): PersonalAccessToken model + migration (pat)`) — `PersonalAccessToken` Prisma model + `User.personalAccessTokens` back-relation; migration `20260615101952_personal_access_tokens`; verified with `prisma migrate diff` (empty diff); `prisma generate` + typecheck green. WAL lock from running container required offline diff fallback.
  - T2 (`feat(backend): PAT token crypto (pat)`) — `pat.crypto.ts`: `PAT_PREFIX`, `hashToken`, `generateToken` (sha256, base64url, prefix slice); 2 unit tests TDD.
  - T3 (`feat(backend): PAT repo + ports (pat)`) — `tokens.ports.ts` (PAT_REPO symbol, PatRecord, PatRepo interface); `prisma-tokens.repo.ts` (create/listForUser/revoke/findActiveByHash/touch, with expiry + revokedAt filter); 5 repo isolation tests via `migrate deploy` temp SQLite.
  - T4 (`feat(backend): tokens CRUD endpoints (pat)`) — CQRS: `CreateTokenCommand/Handler`, `RevokeTokenCommand/Handler` (throws `TokenNotFoundError`), `ListTokensQuery/Handler`; `CreateTokenDto` (1..100 name); `TokensController` (`POST /api/v1/tokens` 201, `GET /` 200, `DELETE /:id` 204); `TokensModule`; registered in `AppModule`; typecheck + lint green.
  - T5 (`feat(backend): guard accepts PAT via Bearer + Basic (pat)`) — `PatService.resolve(req)`: extracts `burk_pat_` secret from `Bearer` or `Basic` header, looks up hash, fires non-blocking `touch`; `SessionGuard` updated (session-first, PAT second, no throw until both fail); `PatService` provided in `AuthModule` (`@Global`) with `TokensModule` imported via `forwardRef`; 5 PatService tests (bearer, basic, session-bearer rejection, revoked, unknown); all 30 backend test files / 144 tests green.
- Gates: `pnpm --filter @app/backend lint` clean; `pnpm --filter @app/backend typecheck` clean; `pnpm --filter @app/backend test` 144/144 green.
- Notes: `items.isolation.spec.ts` uses `db push` (pre-existing, not changed). New tokens test uses `migrate deploy` consistent with `auth-sqlite-boot.spec.ts`. Session-first ordering verified in `SessionGuard.canActivate`.

## T-2026-06-15-002 — S3-mobile: Android share-sheet capture

- Created: 2026-06-15
- Completed: 2026-06-15
- Owner: claude
- Spec: [specs/features/2026-06-15-s3-mobile.plan.md](../features/2026-06-15-s3-mobile.plan.md)
- Result: merged to `main` via `--no-ff` as `f88cc3c` (11 feature commits `eae1dad`→`09d2b81`); branch deleted.
- Delivered:
  - Task 1 (`eae1dad`) — `flutter create --platforms=android,ios` scaffolds `android/` + `ios/` inside `apps/mobile`; existing `lib/` untouched, package name stays `app_mobile`.
  - Task 2 (`7e56ccd`) — `share_url_parser.dart` (`extractFirstUrl`) with TDD: 4 tests green.
  - Task 3 (`8cac176`) — `PendingShareStore` (single-slot consume-once) + `appNavigatorKey` (`GlobalKey<NavigatorState>`).
  - Task 4 (`4cd0e72`) — `receive_sharing_intent 1.8.1` added; API matches plan exactly (`getInitialMedia`/`getMediaStream`/`SharedMediaFile.path`).
  - Task 5 (`5e60113`) — `quickSave_{en,el,ru,uk}.i18n.json` source files; `dart run slang` regenerates gitignored `strings.g.dart` with `context.t.quickSave.*` accessors.
  - Task 6 (`4de3af4`) — `QuickSaveScreen` reuses `AddLinkCubit`, auto-fires `save(url)` on init, handles idle/saving/saved/error states with retry + open-library actions.
  - Task 7 (`af7ac80`) — `AppRoutes.quickSave = '/quick-save'` + route handler in `onGenerateRoute`.
  - Task 8 (`9349ad6`) — `ShareIntentService` (listens cold-start + warm stream, routes to quickSave or PendingShareStore by token presence); `PendingShareStore` + `ShareIntentService` registered as lazy singletons in DI.
  - Task 9 (`365e191`) — `App` converted to `StatefulWidget`; `navigatorKey: appNavigatorKey` on `MaterialApp`; `ShareIntentService.start()` called `addPostFrameCallback`; `AuthGate` authenticated branch consumes `PendingShareStore.take()` post-frame and pushes quick-save if URL held.
  - Task 10 (`e88ccd1`) — `ACTION_SEND text/*` intent-filter added to `AndroidManifest.xml` (per receive_sharing_intent README; `text/*` not `text/plain` to match lib guidance).
  - Task 11 (`09d2b81`) — `dart format` cleanup; final `flutter analyze` 0 issues; `flutter test` 30/30 green.
- Verification: `flutter analyze` — `No issues found!`; `flutter test` — `+30: All tests passed!`; android/ + ios/ tracked in git; `strings.g.dart` and `strings_*.g.dart` NOT committed (gitignored by root `.gitignore` lines 73-74).

## T-2026-06-15-001 — S3-web: Bookmarklet & /save Popup

- Created: 2026-06-15
- Completed: 2026-06-15
- Owner: claude
- Result: merged to `main` via `--no-ff` as `238d547` (6 feature commits); branch deleted.
- Spec: [specs/features/2026-06-15-s3-web.plan.md](../features/2026-06-15-s3-web.plan.md)
- Delivered:
  - Task 1: `app/utils/bookmarklet.ts` + 3 unit tests (buildSaveUrl, buildBookmarkletHref)
  - Task 2: `app/utils/save-action.ts` + 4 unit tests (resolveSaveAction, rejects non-http, redirect-aware)
  - Task 3: `i18n/locales/en.ts` + `ru.ts` — `save.*` (7 keys) + `settings.bookmarklet.*` (6 keys)
  - Task 4: `app/pages/save.vue` — popup page, no auth middleware, self-guards via resolveSaveAction
  - Task 5: `app/pages/sign-in.vue` — honors safe `?redirect=` query param after sign-in
  - Task 6: `app/pages/settings.vue` — bookmarklet install card, drag anchor + copy button
- Gates: 24/24 unit tests; lint 0 errors; container typecheck EXIT:0; container production build EXIT:0; stylelint/format clean.

## T-2026-06-14-015 — S2-web follow-ups (type barrel · @app/ui build gate · reader UX polish)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `0a8cceb`, branch `chore/s2-web-followups`, 4 commits `61ad01e`→`7ed1395`). Cleanup — follow-ups carried from T-014 + the S2-web Task-4 review.
- Spec: none.
- Delivered:
  - **A** (`1668b57`) — `@app/ui` highlight types (`AppHighlightColor`/`AppHighlightData`/`AppHighlightCardHighlight`) moved out of `.vue` SFCs into `AppArticleReader/highlight-types.ts`; package barrel + components + stories/specs all import from it. The web reader page now imports these from `@app/ui` directly and the OpenAPI-derived workaround shapes/comment are gone. Retires the cross-package `.vue` type-import trap (typescript-eslint `projectService` resolved `.vue` type exports to `error`).
  - **B** (`8c91874`) — closed the latent library-Sass gap behind T-013: added a full `@app/ui` CI job (`design:build` → lint/typecheck/test/**build**/audit; `@app/ui` previously had only `audit:components` in CI), and made the documented gates include the library build (`CLAUDE.md` → `turbo run build lint test typecheck`; HANDOFF per-slice UI gate → `{build,test,typecheck,lint}`; `testing.md` PR checklist). Validated the full gate sequence locally.
  - **C** (`7ed1395`) — reader UX polish: selection popover dismisses on outside-click (capture `pointerdown`, containment-guarded, symmetric `onMounted`/`onBeforeUnmount` cleanup); optimistic tag add/remove (new `useItems.addTag`/`removeTag` mirroring `toggleFavorite`, reconciled with the server item); failed actions surface a token-styled dismissible `role="alert"` error banner (`runAction` wrapper, `reader.actionFailed`/`reader.dismiss` en+ru); removed an unnecessary `as` cast.
- Reviews: per-task verification + a consolidated final review (ready to merge — no Critical/Important/Minor).
- Verification: `@app/ui` `design:build` → lint/typecheck/**242 tests**/build/audit green; web container `vue-tsc` typecheck, host **17/17**, production `nuxt build` green.

## T-2026-06-14-014 — S2-web (reader view & highlight authoring)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `1d1ea8c`, branch `feat/s2-web`, 7 commits `642c0bf`→`b8c8c5d`). **Completes S2 (P2 Extraction & Reading) — all five slices shipped.**
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) · Plan: [specs/features/2026-06-14-s2-web.plan.md](../features/2026-06-14-s2-web.plan.md)
- Delivered: `/items/[id]` is now a full web reader. `useApi` article+highlight methods (over `@app/specs` types); `useArticle` (article + extractStatus state, SSE-decoupled — page feeds `syncStatus`, in-flight guard against double-fetch) + `useHighlights` (CRUD, optimistic remove) composables; page rewrite composing the four shipped `@app/ui` composites (`AppExtractState`, `AppArticleReader`, `AppHighlightPopover`, `AppHighlightCard`) with live `extracting→ready` over the existing `useItems`+`useEvents` SSE rail, selection popover positioned from the live `Selection` rect via a `:style` CSS-var binding, cross-origin image-src rewrite, note add/edit/clear (PATCH `note:null`), `reader`/`highlight` i18n (en/ru). Metadata controls re-routed through the shared store.
- Reviews: per-task spec-compliance ✅ + code-quality ✅ (Tasks 1–4), final holistic review ✅ "ready to merge". Code-review fixes applied: `loadArticle` 404-scoped catch + `extract()` stuck-state guard (Task 3), `loadArticle` concurrent-double-fetch guard (Task 4 race), variable-shadow cleanup.
- Verification: container `vue-tsc` typecheck clean; host unit 17/17; production `nuxt build` green (the integration gate); backend routes probed live (`GET article`/`GET highlights`/`POST extract` → 401 = mounted+auth-guarded). FTS body search transparent through the existing library `q` (no web change). Interactive browser smoke (SSE flip, highlight persist, FTS-in-UI) deferred to manual/CI e2e — no local Playwright in this sandbox.
- Notes / deviations: (1) Removed the Task-2 `highlight-anchor` util — the shipped `AppArticleReader.select` already emits the `{quote,prefix,suffix}` anchor, making a page-side util redundant + unwireable (the plan predated the composite's final emit). (2) Cross-package `.vue` type-export limitation: importing `AppHighlightData`/`AppHighlightColor` from `@app/ui` (declared inside `.vue` SFCs) trips typescript-eslint's `projectService` (resolves to `any`/error → CI lint fail). Worked around by deriving the prop shapes structurally from the OpenAPI `Highlight` contract (verified byte-identical to the composite's union). **Follow-up:** `@app/ui` should re-export these types from a `.ts` barrel so consumers can import them directly. (3) Follow-up: the `@app/ui` per-slice gate should include `build` (see T-013) so library SCSS errors can't ship latent.

## T-2026-06-14-013 — fix AppArticleReader `:deep()` highlight-modifier SCSS

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `cecb097`, branch `fix/ui-article-reader-deep-scss`, 1 commit `f4f88f1`). Preflight fix discovered starting S2-web.
- Spec: none (build bugfix) — see HANDOFF.md.
- Root cause: `AppArticleReader.vue` nested the highlight color modifiers as `&--<color>` under `:deep(.app-highlight)`, which makes Dart Sass append the `--<color>` suffix to a selector ending in the `:deep(...)` pseudo — an error ("can't add a suffix to a pseudo-selector"). The library `vite build` failed. It shipped green in T-010 only because the `@app/ui` slice gate runs test/typecheck/lint and turbo's `dependsOn: ["^build"]` never builds the package itself; `vue-tsc`/vitest don't compile SCSS through Dart Sass. The break surfaces via `@app/web#typecheck` (`^build → @app/ui#build`), so it also blocked the S2-web `nuxt build` gate.
- Fix: each modifier is now its own full `:deep(.app-highlight--<color>)` selector, matching the classes emitted by `highlight-mark.ts`.
- Verification: `pnpm --filter @app/ui build` green (87 modules); 242 ui tests still pass; full `pnpm typecheck` green (with Dart on PATH for codegen).
- Follow-up (not blocking): the `@app/ui` per-slice gate should include `build` (or a `vite build`-backed check) so library SCSS errors can't ship latent again.

## T-2026-06-14-012 — fix Better Auth ↔ SQLite provider mismatch

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `f94b8f3`, branch `fix/auth-sqlite-provider`, 1 commit `0b9791d`).
- Spec: none (config bugfix) — see HANDOFF.md gotcha "Better Auth provider now matches the SQLite datasource".
- Root cause: `prismaAdapter(prisma, { provider: 'postgresql' })` was a monorepo-template leftover (`7e71b30`) that the "switch Prisma to SQLite" migration (`415881b`) never updated. The documented "can't boot the full Nest app in vitest without Postgres" blocker was **stale** — the app boots fine because Prisma reaches SQLite via the `@prisma/adapter-better-sqlite3` driver adapter, so the wrong provider never crashed. A config lie that pushed the team into repo-layer-only tests for no live reason.
- Fix: provider → `'sqlite'` (matches `schema.prisma` datasource, with a comment tying the two); added `test/auth-sqlite-boot.spec.ts` (boots the full `AppModule` over a migrated temp SQLite DB + email sign-up + bearer session round-trip — the integration test wrongly believed impossible); corrected the false "no app boot" claim in `s2.isolation.spec.ts` + `HANDOFF.md`.
- Verification: full backend suite **132/132** (29 files); typecheck + lint clean. Not a `template-fixes.md` entry — local migration miss, not a universal template bug.

## T-2026-06-14-011 — S2-mobile (reader + read-only highlights)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `57afca9`, branch `feat/s2-mobile`, 6 commits `d707504`→`68ed915`).
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) · Plan: [specs/features/2026-06-14-s2-mobile.plan.md](../features/2026-06-14-s2-mobile.plan.md)
- Delivered: item-detail reader — `ArticleRepository` over the generated `ExtractionApi`/`HighlightsApi`; pure tested `injectHighlights` util (read-only `<mark>` injection); `DetailCubit` with article/extract/SSE/highlights (live `extracting→ready` via the existing SSE `item.updated`); `flutter_html` reader screen with `mark.hl-{yellow,green,blue,pink}` theming + image-origin rewrite; new slang `reader` namespace (en/ru/uk/el). No mobile highlight authoring (S2 cut).
- Reviews: spec-compliance ✅ (scope clean; baseline-fix for missing `extractStatus` confirmed legit; deviations type-safer than plan) → code-quality ✅ "merge-ready" → fixes `68ed915` (negative-path SSE guard tests, non-destructive refetch error, `uri.origin`).
- Verification: `flutter analyze` 0 issues; `flutter test` **26/26**. (Generated slang `strings.g.dart` is gitignored — run `dart run slang` after pulling i18n source changes.)

## T-2026-06-14-010 — S2-ui (reader & highlight @app/ui composites)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (`--no-ff` merge `36fca8e`, branch `feat/s2-ui`, 6 commits `03399b6`→`6dd4c9c`).
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) · Plan: [specs/features/2026-06-14-s2-ui.plan.md](../features/2026-06-14-s2-ui.plan.md) · Mockup: `specs/design/mockups/reader-highlights.vue`
- Delivered: four `@app/ui` composites — `AppExtractState` (status machine), `AppArticleReader` (server-sanitized `v-html` + DOM-range highlight marks + selection `select` emit), `AppHighlightPopover` (4-swatch selection popover), `AppHighlightCard` (view + inline `AppTextarea` note editor); `--highlight-{yellow,green,blue,pink}` (+ `*-rail`) tokens; barrel exports + `AppHighlightData`/`AppHighlightColor` types. Storybook story + colocated spec per component, tokens-only, strings-as-props.
- Reviews: spec-compliance ✅ (extracting→`pending` badge justified) → code-quality "merge-with-fixes" → fixes `6dd4c9c`: real anchoring bug fixed (`highlight-mark.ts` now anchors ALL quote occurrences per text node, not just the first — a short quote appearing twice was silently dropped), added the missing colocated `highlight-mark.spec.ts` (the two-in-one-node test failed pre-fix, passes post-fix), fixed the broken `WithHighlights` story, swapped native `<textarea>`→`AppTextarea`, lint cleanups.
- Verification: **242 tests** (22 files), typecheck 0 errors, lint 0 errors. Unblocks S2-web.

## T-2026-06-14-009 — S2-backend (P2 extraction & reading)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `5e63964`, branch `feat/s2-backend`, 21 commits). All phases A–E complete. 28 test files / 129 tests green. Typecheck clean. Live smoke passed.
  Key commits: adceb03 (schema), 6319c60 (FTS), 75a1b9b (spec+codegen),
  561e37a 58a228e 21d1a9e 38ee64e (extractor+repo), 33104f0 7a8b3c8 (job+controller),
  highlights phases (9233226 888c1f5), 3329d9d (isolation test), 45704f3 (extractStatus fix).
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
- Result: merged locally to `main` (merge commit `b269146`, branch `feat/s2-design`, 2 commits `afc0c33`+`5521e34`).
- Spec: [specs/features/2026-06-14-s2-extraction-and-reading.md](../features/2026-06-14-s2-extraction-and-reading.md) §Mockups · Plan: [specs/features/2026-06-14-s2-design.plan.md](../features/2026-06-14-s2-design.plan.md)
- Delivered: `specs/design/mockups/reader-highlights.vue` — one self-contained reader scene composing all three new S2 pieces (annotated for S2-ui): `ready`-state reader column (Literata `--font-reading`/`--leading-relaxed`, ~44rem measure) with 2 inline highlight marks → `AppArticleReader`; floating selection popover (4 color swatches + Add-note) → `AppHighlightPopover`; highlights side panel of 3 cards (colored quote + note + edit/delete + timestamp) → `AppHighlightCard`; inline note editor (textarea + save/cancel) → `AppHighlightCard (editing)`. Tokens-only, responsive collapse at 56rem.
- Verification: spec-compliance review (subagent) = GO after one fix — caught 4 undocumented card-rail hexes; all 8 content hexes (4 swatch fills + 4 rails) now documented in hex→role comments (rails kept as a sibling content-color set since `color-mix` toward `--text-fg` only mutes the pale swatch, can't reach the vivid tone). 59 `var(--…)` tokens all validated against `tokens.generated.css`; no forbidden/removed names; self-contained (only imports `vue`).
- Note: swatch/rail hexes carry a `TODO(S2-ui)` to promote to `--highlight-*` tokens if reused. No tests/Storybook (mockup, per plan).

## T-2026-06-14-007 — docker e2e validation + backend body-parser fix

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (branch `feat/s1-docker-e2e`: `99cb798` backend fix + `3d0b5c2` e2e spec).
- Brought up the docker stack (`docker compose -f docker/compose.yml up -d --build`) — backend + web both healthy (`200`); compose was already the simplified SQLite stack (no postgres/redis/centrifugo).
- **Bug fixed (caught by the running stack):** the express-openapi-validator middleware (`app.use('/api', …)`) registered in `bootstrap` ran BEFORE Nest's built-in body parser, so POST/PATCH to API routes (`/items`, etc.) hit the validator with an empty `req.body` → `400 must have required property 'body'`. Auth routes worked only because they bypass the validator (`ignorePaths`) and reach the controller after Nest's parser. Fix: `bodyParser:false` + explicit `json()`/`urlencoded()` before the validator (`apps/backend/src/main.ts`). Integration tests missed it (in-process supertest, different parser order).
- Verified live: sign-up `200` → save item `201` (`pending`) → `ready` ("Example Domain") via the job worker; web pages all serve + Nuxt mounts. 51 backend tests still pass.
- e2e: backend-health smoke passes; added `tests/e2e/library-flow.spec.ts` (sign-up → guarded /library → save → SSE pending→ready). Browser tests run in CI — this sandbox can't extract the Playwright browser (hung unzip; no system chrome).
- Note: the docker stack is left **running** (normal dev state).

## T-2026-06-14-006 — migrate web i18n to global .ts langDir locale files

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: commit `641830b` on branch `feat/s1-toolchain` (fixes the Vite 8 + @nuxtjs/i18n `<i18n>`-block build failure tracked in T-2026-06-14-004 follow-ups)
- nuxt build: Σ Total size: 2.64 MB (✓). 17/17 tests pass. lint + typecheck green.
- Docs updated: `.claude/docs/i18n.md`, `.claude/agents/frontend-engineer.md`.

## T-2026-06-14-005 — S1-mobile (library / item_detail / add_link + live SSE)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `d0eaf5e`, branch `feat/s1-mobile`, 17 commits).
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B5 · Plan: [specs/features/2026-06-13-s1-mobile.plan.md](../features/2026-06-13-s1-mobile.plan.md)
- Delivered: feature-first Flutter — `ItemsRepository` over the generated `app_api_client` (typed built_value builders); `LibraryCubit`/`DetailCubit`/`AddLinkCubit` + Equatable states; `EventsClient` (Dio `ResponseType.stream` SSE → `Stream<AppEvent>`, pending→ready live via `LibraryCubit.subscribe`/`applyEvent`); `LibraryScreen` (+ item card + filter bar) / `ItemDetailScreen` (metadata only; reader S2) / `AddLinkScreen`; `onGenerateRoute` for library/itemDetail/addLink + AuthGate → `LibraryScreen` (fills the post-auth landing the S1-auth slice pointed at); slang i18n `library`/`itemDetail`/`addLink` × en/ru/uk/el. DI factories for the 3 cubits.
- **Codegen pipeline fix (shipped here):** `packages/specs/scripts/codegen.ts` now runs `dart run build_runner build` after `dart pub get`, so the dart-dio built_value `*.g.dart` (Builder classes + serializers) are generated and committed — the generated Dart client never actually compiled before (latent since S0). Also fixed `apps/mobile/pubspec.yaml` to point `app_api_client` at `lib/generated`.
- Verification: `flutter analyze` clean; 16 `bloc_test` cases pass (3 library + 3 detail + 2 add-link + 8 auth). Slice reviewed = GO; 3 hardcoded strings caught in review + localized.
- Follow-ups: tag-selector UI in the filter bar is stubbed (callback wired, no dropdown rendered yet); emulator manual smoke deferred (no running device this session).

## T-2026-06-14-004 — S1-web (library / detail / settings + live SSE)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `54f19e8`, branch `feat/s1-web`, 8 commits).
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B4 · Plan: [specs/features/2026-06-13-s1-web.plan.md](../features/2026-06-13-s1-web.plan.md)
- Delivered: `useApi` item/tag methods (typed from `@app/specs`); pure `items-store` (`upsertItem`/`removeItemById`/`routeEvent`) + `to-card-data` utils (8 unit tests); `useItems`/`useTags`/`useEvents` composables (useState stores + native `EventSource` → store, pending→ready live); `/library` page (AppFilterBar + AppItemCard list + AppEmptyState + AppSkeleton + inline AppAddBar + AddLinkModal w/ header trigger); `/items/[id]` metadata detail (reader deferred to S2); minimal `/settings` (theme + en/ru). `auth` middleware guards all three.
- Verification: 17 web unit tests; typecheck + lint (0 errors) + stylelint clean. Slice reviewed = GO. (Per-task implementation was gate-driven; one dead-UI modal-trigger gap caught in slice review + fixed.)
- Follow-ups: **`nuxt build` (production) fails compiling `<i18n>` SFC blocks** — pre-existing/latent `@nuxtjs/i18n` v10 SPA issue (`vite:json` claims the block); CI web job runs only typecheck+test (both pass) and the dev container works, so non-blocking, but production output needs a dedicated fix (memory `burkmak-web-i18n-build`; adding the intlify plugin manually double-registers). Browser smoke deferred (Docker stack down this session).

## T-2026-06-14-003 — S1-auth surface (welcome / sign-in / sign-up)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `4436106`, branch `feat/s1-auth`, 13 commits).
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B4/B5 · Plan: [specs/features/2026-06-13-s1-auth.plan.md](../features/2026-06-13-s1-auth.plan.md)
- Delivered: **web** — welcome/sign-in/sign-up pages (email/password via Better Auth `signIn.email`/`signUp.email`) + `auth`/`guest` route middleware + `index.vue` redirect (authed→/library, else /welcome); app-local `AppBrand`/`AppFormError`/`AppStrength`; pure `auth-validation` + `password-strength` utils (9 tests); `login.vue` removed, sign-out → `/sign-in`. **mobile** — `sign_in_screen` reskinned phone-OTP→email/password, `sign_up_screen` real form built (was a stub redirect), `welcome_screen` polished to mockup; email `signIn` i18n keys (en/ru/uk/el); `AuthCubit` signIn/signUp `blocTest` cases (8 tests). Email/password is now the production auth on both platforms (confirmed decision); phone-OTP cubit methods retained but unsurfaced.
- Verification: web 9 unit tests + typecheck/lint/stylelint clean; mobile `flutter analyze` clean + 8 tests. Web half and mobile half independently reviewed = GO.
- Follow-ups: the `/library` route target (web page + mobile route handler) lands in S1-web / S1-mobile — the auth redirects point at it. Browser/emulator manual smoke deferred (Docker stack not running this session).

## T-2026-06-14-002 — design-system token-taxonomy reconciliation

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `e11e287`, branch `feat/s1-tokens-reconcile`). User-directed follow-up to S1-ui.
- Goal: rewrite every token consumer onto the emitter's canonical taxonomy so no CSS references an undefined token.
- Delivered: 283 token refs across 27 files (UI primitives, the `@theme inline` alias layers in `styles.css`/`main.css`, all `specs/design/mockups/*`, web pages/layout) rewritten consumed→emitted: surface `bg→page`/`bg-subtle,bg-muted→surface`/`surface-alt→raised`; text `fg-muted→secondary`/`fg-subtle→tertiary`/`fg-disabled→disabled`/`fg-inverse→inverse`; status `X→X-fg`/`X-soft→X-subtle`/`danger→error`; brand `soft→subtle`/`soft-hover→subtle`/`border→accent`; ease `standard→default`/`decelerate→out`; `border-soft→default`; `tracking-snug→tight`. Dropped the unused `--brand-accent-50..950` `@theme` scale. Fixed two pre-existing raw-px lint errors. The six new S1-ui components already used emitted names and were untouched.
- Verification: 215 `@app/ui` tests green; stylelint clean; lint 0 errors (ui+web); web typecheck clean. Focused independent review = GO (no cross-contamination, zero undefined refs, CSS valid).

## T-2026-06-14-001 — S1-ui composite components (@app/ui)

- Created: 2026-06-14
- Completed: 2026-06-14
- Owner: claude
- Result: merged locally to `main` (merge commit `a233627`, branch `feat/s1-ui`, 11 commits). No remote configured → local merge (user-authorized).
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md) §B4
- Plan: [specs/features/2026-06-13-s1-ui.plan.md](../features/2026-06-13-s1-ui.plan.md)
- Delivered: six composite `@app/ui` components — AppStatusBadge, AppTagChip, AppSkeleton, AppEmptyState, AppItemCard, AppFilterBar — each Storybook-first (CSF3 `Compositions/*`) + colocated vitest spec, strings-as-props, token-only SCSS, exported from the package barrel. Plus a typography-token source fix: `typography.json` now carries the DESIGN.md brand faces (sans→Hanken Grotesk; added display→Fraunces, reading→Literata) so `--font-display`/`--font-reading` emit.
- Verification: 215 `@app/ui` unit tests green; typecheck clean; lint 0 errors. Each task two-stage reviewed (spec compliance + code quality); final slice review = GO. Storybook axe run deferred to CI (`test:visual:ci`) — no local Playwright browsers.
- Follow-ups (NOT in this slice): (1) **design-system token-taxonomy reconciliation** — pre-existing primitives (AppButton/AppChip/AppCard/AppSelect/AppSwitch) and the `@theme inline` alias layer in `styles.css`/`main.css` reference token names the emitter does NOT produce (`--brand-accent-soft`, `--surface-bg-muted`, `--text-fg-muted`, `--text-fg-inverse`, `--status-danger`, …), so those declarations resolve to nothing. The six new components are clean (emitted names only). (2) `AppButton` has no icon-only mode — renders `label` as visible text, so AppItemCard's action column shows words next to icons. (3) Webfont assets (Hanken/Fraunces/Literata) not yet loaded — stacks fall back to generic serif/sans until then.

## T-2026-06-13-001 — S0 foundation + S1-backend core library

- Created: 2026-06-13
- Completed: 2026-06-13
- Owner: claude
- Result: merged locally to `main` (branch tip `b179cf2`; 35 commits). No remote configured, so no PR — user authorized local merge.
- Spec: [specs/features/2026-06-13-foundation-and-core.md](../features/2026-06-13-foundation-and-core.md)
- Plans: [S0](../features/2026-06-13-s0-foundation.plan.md) · [S1-backend](../features/2026-06-13-s1-backend.plan.md)
- Delivered: simplified stack (SQLite/WAL via better-sqlite3, native SSE `GET /api/v1/events`, in-process DB-backed Job worker with retry/backoff — no Centrifugo/Redis/Grafana/Sentry/OTel/AsyncAPI); db-only health; items + tags core library (CQRS, ownership-scoped repos, async `fetch_metadata` job → SSE `item.updated`); OpenAPI items/tags surface + regenerated TS/Dart clients; HttpExceptionFilter maps validator status errors.
- Verification: 51 backend unit/integration tests green (incl. multi-user isolation against real SQLite); typecheck + lint clean; spec validates; codegen drift-stable; boot verified (health 200 db-only, `/events` 401, unknown route 404).
- Sub-steps: all S0 (8) + S1-backend (9) units complete; 3 final-review nits fixed (saveItem tags, isolation-test lint, updateItem minProperties).
- Follow-ups (not in this slice): S1-web + S1-mobile plans/impl; root `README.md` still describes the old Postgres/Centrifugo/Sentry architecture (needs a rewrite); container-boot migration entrypoint is `prisma db push` (fine for dev).
