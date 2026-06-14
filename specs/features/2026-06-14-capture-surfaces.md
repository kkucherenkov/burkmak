# Feature spec — Capture Surfaces (P3 · S3)

- Status: draft
- Created: 2026-06-14
- Owner: claude
- PRD: [../PRD.md](../PRD.md) (§6 one-tap capture, §7 S3)
- Roadmap: [../roadmap.md](../roadmap.md) (Phase P3)

## Goal

Let a user save a URL into burkmak from **outside the app**: a desktop browser
**bookmarklet** and the mobile **OS share-sheet**. Both surfaces funnel into the
existing `POST /api/v1/items {url}` — the same save path the in-app add-bar
already uses — so an article saved from anywhere shows up in the library and
fills in metadata live over the existing SSE rail.

At the end of this phase a user can: drag a one-click bookmarklet to their
browser bar and save the current page from any site; and share a link from any
mobile app straight into burkmak without opening it first.

## Scope

**In:**

- Web: a `/save` popup page + a Settings bookmarklet installer.
- Mobile: Android OS share-target → quick-save flow.

**Out (deliberately):**

- **No OpenAPI / backend change.** Both surfaces reuse `POST /items {url}` as-is.
- **No tokenized save URL / persistent API-key mechanism.** Decided: the
  bookmarklet uses the existing cookie session via a same-origin popup (the
  Pocket/Instapaper pattern), so no long-lived credential is minted. The PRD's
  "tokenized save URL" is parked as future work (would be its own backend slice).
- **No `@app/ui` component slice, no design-mockup slice.** The new UI is
  transient app-glue (a save-result view, an install card) built on existing
  tokens + primitives — not reusable brand parts.
- **iOS share extension** — deferred (see Slice B §6).
- **URL dedupe** — `POST /items` does not dedupe; capture surfaces make
  double-saves easier but dedupe is not a PRD requirement. Logged as a
  follow-up, not built here.

This is intentionally a **lean** phase versus S2: no spec loop, no backend, no
component library work.

## Architecture — the auth crux

A `javascript:` bookmarklet executes in the context of _the page being saved_
(e.g. `nytimes.com`) — cross-origin to burkmak, so it cannot read burkmak's
HttpOnly session cookie or bearer. The fix sidesteps it entirely: the
bookmarklet only `window.open()`s a **burkmak-origin** page (`/save?url=…`);
that page is same-origin to the SPA, so the session cookie is present, and _it_
performs the authenticated `POST`. Net backend change: zero.

Mobile is simpler: the app already attaches a bearer token from
`flutter_secure_storage` via a Dio interceptor, so the share-target just routes
the received URL into the existing save path.

---

## Slice A — `s3-web` (frontend-engineer)

Branch `feat/s3-web` off `main`; `--no-ff` merge when green.

### A1. `/save` page — `apps/web/app/pages/save.vue`

The bookmarklet's popup target.

- Reads `?url=` from the query.
- **No session** → redirect to `/sign-in?redirect=<full /save?url=… path>`; after
  login the user lands back on `/save` and the save proceeds. (Reuses the
  existing auth middleware / redirect convention.)
- **Has session** → `POST /items {url}` via `useApi.saveItem`, rendering a
  three-state view:
  - `saving` — spinner + "Saving…"
  - `saved` — "✓ Saved to burkmak"; auto `window.close()` after ~1.2 s, with a
    **"View in library"** link as a fallback when the browser blocks
    programmatic close.
  - `failed` — "✗ Couldn't save" + a **Retry** button (and the View-in-library
    link).
- Malformed/missing `?url=` → render the `failed` state with a clear message
  (do not POST).
- States reuse existing design tokens + `AppButton` + a spinner; **kept in-app**
  (not a new `@app/ui` component — it's glue, not brand).

### A2. Settings bookmarklet section — `apps/web/app/pages/settings.vue`

An install card with:

- A **drag-to-your-bookmarks-bar** anchor whose `href` is the `javascript:`
  snippet.
- A **Copy** button for users who prefer to create the bookmark manually.
- Short instructions.

The snippet is built **at runtime from `window.location.origin`**, so it points
at the right host with no extra config — `:3001` in dev, the real origin in prod:

```js
javascript: (function () {
  window.open(
    location.origin.replace(/\/$/, '') /* burkmak origin, injected */ +
      '/save?url=' +
      encodeURIComponent(location.href),
    'burkmak',
    'width=420,height=240',
  );
})();
```

(The web app's own origin is the burkmak origin here, since the SPA and the
`/save` page are the same deployment.)

### A3. i18n

New keys in `apps/web/i18n/locales/{en,ru}.ts`:

- `save.*` — saving / saved / failed / retry / viewInLibrary / badUrl.
- `settings.bookmarklet.*` — title, description, dragHint, copy, copied.

(Global `.ts` langDir locales — NOT `<i18n>` SFC blocks, which break the build.)

### A4. Gates (Definition of Done for the slice)

- `pnpm --filter @app/web test` — new unit tests for the `/save` state machine:
  no-session redirect, save success (→ POST called, saved state), save failure
  (→ failed state), bad `?url=` (→ no POST). Cover the Settings snippet builder.
- `pnpm --filter @app/web typecheck` (container) + `lint`.
- Production `nuxt build` (container) — a real gate.
- `pnpm stylelint:fix && pnpm format`.

---

## Slice B — `s3-mobile` (flutter-engineer)

Branch `feat/s3-mobile` off `main`; `--no-ff` merge when green. Start after
`s3-web` merges.

### B1. Native platform scaffold

The app is a **lib-only Dart package** today (no `android/` or `ios/`). Generate
the native projects in place:

```sh
flutter create --platforms=android,ios --org app.burkmak .
```

This produces `android/` (gradle, `MainActivity`, manifest) and `ios/`
(Info.plist) without disturbing `lib/`. Pick the app id/org at plan time
(`app.burkmak` proposed → application id `app.burkmak`); review the generated
diff before committing — `flutter create` may touch `pubspec.yaml` and add
platform boilerplate that should be inspected, not blindly accepted.

### B2. Dependency

Add `receive_sharing_intent` (the standard "receive shared content" plugin) to
`pubspec.yaml`.

### B3. Android share-target manifest

Add an `intent-filter` to `MainActivity` in
`android/app/src/main/AndroidManifest.xml` for `ACTION_SEND` with `text/plain`
(and `text/*`) so burkmak appears in the Android share-sheet when a URL is
shared. Wire `receive_sharing_intent`'s manifest requirements per its README.

### B4. Quick-save flow

- App bootstrap subscribes to **both** the initial shared media (cold start via
  share) and the streamed shared media (warm app).
- A received URL routes to a minimal **`quick-save`** screen (new route constant
  in `lib/app/routes.dart`) that **reuses `AddLinkCubit` + `ItemsRepository`** —
  no new save logic. It auto-fires the save and shows `saving → saved / error`,
  offering **"Open library"** and **dismiss** (return to the sharing app).
- **No bearer token** (signed out) → route to sign-in, **hold the pending shared
  URL**, and complete the save after login.

### B5. i18n

New `quickSave` slang namespace with `{en, el, ru, uk}` locale files in
`lib/i18n/`, then `dart run slang` to regenerate `strings.g.dart`.

### B6. iOS — deferred

A real iOS share target needs a separate **Share Extension** target + an **App
Group**, all configured Xcode-side, which is **unbuildable and untestable in
this sandbox**. Decision: scaffold the `ios/` folder (B1) but ship the
share-sheet **Android-only** now; log the iOS Share Extension as a follow-up.

### B7. Gates (Definition of Done for the slice)

- `flutter analyze` — 0 issues.
- `flutter test` — unit tests for the quick-save cubit/flow: save success, save
  error, signed-out → pending-URL-then-save-after-login. (OS intent registration
  itself is only device-verifiable, out of sandbox — same ceiling as S2-mobile.)
- `dart run slang` committed output.

---

## Verification ceiling (be honest about it)

- **Web** is fully verifiable here: unit tests + container `nuxt build`. The
  bookmarklet popup behaviour (open → save → close) is exercisable in a real
  browser locally.
- **Mobile** OS share registration is **only device-verifiable** — `flutter
analyze` + unit tests cover the Dart logic; the actual share-sheet entry must
  be confirmed on an Android device/emulator outside this sandbox.

## Follow-ups (not blocking, logged here)

- iOS Share Extension (B6).
- Tokenized save URL / persistent save-token (would be a backend slice) if
  session-less desktop saving is ever needed.
- `POST /items` URL dedupe / "already saved" UX for capture surfaces.
