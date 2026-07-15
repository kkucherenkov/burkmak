# Active tasks

> Slice ③a shipped ([#17](https://github.com/kkucherenkov/burkmak/pull/17), `02953b0`). **③b and ③c are unblocked** — see [#11](https://github.com/kkucherenkov/burkmak/issues/11) for the split and the notes each inherits. The tasks below are debt found while building ③a; the user chose to clear them **before** ③b/③c. Each wants its own small PR.

## T-2026-07-16-008 — lint `apps/backend/test/**`

- Created: 2026-07-16
- Owner: —
- Spec: — (found during ③a; see done.md `T-2026-07-15-006`)
- Goal: `apps/backend/package.json`'s lint script is `eslint "src/**/*.ts"` — **test files have zero lint coverage**. Widen to `"{src,test}/**/*.ts"`.
- Why first: every spec written during slices ② and ③a was unlinted. This improves the ground the other tasks stand on, and one ③a implementer had to hand-review a spec because of it.
- Expect: a backlog of findings across existing specs. That is the point — do not narrow the glob to make it quiet. Fix or justify each; no blanket `eslint-disable` without a WHY comment.
- Sub-steps:
  - [ ] widen the glob; capture the full finding list before fixing anything
  - [ ] fix findings (or add narrowly-scoped disables with a WHY)
  - [ ] backend lint 0 errors; suite still 286
- Status: ready
- Blockers: —

## T-2026-07-16-009 — spec examples contradict what the server sends

- Created: 2026-07-16
- Owner: —
- Spec: — (found during ③a)
- Goal: two families of `openapi.yaml` examples document responses the server never sends.
  1. **51 `Problem` examples claim `type: about:blank`** plus a generic title. `HttpExceptionFilter.toProblem` (`apps/backend/src/common/filters/http-exception.filter.ts:65-77`) emits `type: urn:problem-type:${exception.code}` and `title: exception.title` for **any** `DomainError`. So `item-not-found`'s real 404 is `urn:problem-type:item-not-found` / "Item not found", not `about:blank` / "Not Found" — **wrong on two fields**. Verified live against the running server during ③a. Looks like `Problem.type`'s schema `default: about:blank` was copy-pasted.
  2. **32 examples say `detail: "No active session"`**; the real string is `"Authentication required."` (`apps/backend/src/i18n/en/auth.json:2` `sessionRequired`).
- Careful: `about:blank` **is correct** for 401s. `SessionGuard` throws Nest's `UnauthorizedException`, which is not a `DomainError` and takes the filter's `HttpException` branch. Only `DomainError` responses (404/409/…) are wrong. The shelves 409/404 examples added in ③a are already correct and carry a comment saying so — do not "fix" them.
- Consider: this is the **third** instance of a hand-written artifact drifting from the code (after `ListItemsDto` ↔ `openapi.yaml`, which shipped a 400). The drift guard fixed that class for DTOs because a test can _execute_ a DTO. Examples aren't executable — is there anything that could enforce this, or is review the only gate? Worth a paragraph in the PR either way.
- Sub-steps:
  - [ ] correct the DomainError `type`/`title` examples (leave 401s alone)
  - [ ] correct the 401 `detail` to match the i18n string
  - [ ] `pnpm spec:validate` clean; codegen unaffected (examples only)
  - [ ] state in the PR whether this class can be enforced
- Status: ready
- Blockers: —

## T-2026-07-16-010 — isolation specs: prohibited `db push` + hand-copied FTS DDL

- Created: 2026-07-16
- Owner: —
- Spec: — (found during ③a)
- Goal: `apps/backend/test/items.isolation.spec.ts` and `s2.isolation.spec.ts` scaffold via `prisma db push --accept-data-loss`, which `.claude/CLAUDE.md` **prohibits**, and `s2.isolation.spec.ts` hand-copies the FTS5 virtual table + triggers as `FTS_DDL`.
- **Correction to an earlier note — read this before starting:** `migrate deploy` does **not** create `item_fts` either. No migration contains `CREATE VIRTUAL TABLE`; `item_fts` appears in migrations only inside a header _comment_. `FtsBootstrapService` (`apps/backend/src/common/fts/fts.bootstrap.ts:22`) creates them at startup. So swapping the command alone would **break every FTS test**.
- Approach: scaffold from committed migrations (`migrate deploy`, per `auth-sqlite-boot.spec.ts:43-63`, which cites the policy) **and invoke `FtsBootstrapService`** rather than mirroring its DDL. That kills the mirror at its actual source — same class as the DTO↔spec drift.
- Note `shelves.isolation.spec.ts` and `kobo-demotion.spec.ts` already use `migrate deploy` correctly (neither needs FTS).
- Sub-steps:
  - [ ] both specs scaffold via `migrate deploy`
  - [ ] both obtain FTS tables from `FtsBootstrapService`, not `FTS_DDL`
  - [ ] delete `FTS_DDL`; suite still 286; no `db push` remains in `apps/backend/test/`
- Status: ready
- Blockers: —

## T-2026-07-16-011 — FTS rank window is sliced before the `where` applies

- Created: 2026-07-16
- Owner: —
- Spec: — (found during ③a's whole-branch review)
- Goal: `apps/backend/src/modules/items/infra/item.repo.ts:183` slices the FTS-ranked id list to `limit + 1` **before** Prisma applies the `where`:
  ```ts
  const candidateIds = rankedIds.slice(startIndex, startIndex + f.limit + 1);
  ```
  So `?q=` combined with any filter can **under-return and report `nextCursor: null` while matches remain below the cut**.
- Pre-existing and shared by `tag`, `kind`, `favorite`, `readState` — and even `userId`. `?shelf=` only widened the blast radius. **The only live correctness bug in this list**; the rest is hygiene.
- Do this properly: **reproduce it against a real database first** — `s2.isolation.spec.ts` has the FTS harness. A fix without a failing test that proves the under-return is not a fix. (③a's FTS tests use `limit: 50` with 2 items, so they cannot hit it.)
- Sub-steps:
  - [ ] failing real-DB test: `?q=` + a filter under-returns with `nextCursor: null`
  - [ ] fix (apply the `where` before/while windowing, or over-fetch and re-window)
  - [ ] verify pagination still correct for the unfiltered `?q=` path
- Status: ready
- Blockers: —

---

## Deferred (recorded, not scheduled)

- **No Nuxt page-mount harness.** Page template wiring has no test gate — covered only by typecheck, build, and human browser verification. This is the remaining `?kind=`-shaped hole: it is exactly the gap that let `GET /items?kind=` ship as a 400. Neither ③b nor ③c forces the decision (both are backend-only), but the next web slice should settle it.
- **Native `prompt`/`confirm` on `/shelves`** (`apps/web/app/pages/shelves/index.vue`). The message text goes through `t()`, but the browser renders OK/Cancel chrome in **its own locale**, not the app's — an i18n leak in a repo that forbids untranslated user-visible strings. It is the first such usage in the app; `AddLinkModal.vue` is the local modal precedent. Needs a modal pattern designed, not a one-liner.
- **`/shelves/{id}` does not paginate past 20 items** (`api.getItems({ shelf: id })` takes the default with no cursor). Parity, not regression: `library.vue` never calls `loadMore()` either.
- **`addItem`/`removeItem` are not transactional** — the membership write and the `lastModified` touch are two statements, and no repo here uses `$transaction`. Declared and accepted for ③a. `touch` is now gated on the write actually changing something, so the stale window is only a crash between an _effective_ write and its touch. **③b needs a transaction anyway** (shelf-delete + tombstone must be atomic) and will be the first.
- **`AppShelfPicker` renders `labels.add`/`labels.remove` as a per-row hint word** beside a checkbox that already conveys state. Mildly redundant for sighted users; now `aria-hidden` so AT does not announce a stray "Remove". A design call, not a correctness one.
- **404 detail conflates "shelf missing" with "item missing"** — both collapse to `ShelfNotFoundError(shelfId)`. Ownership already scopes both to the caller's own resources, so there is no existence to protect; a distinct message would just be more useful.
