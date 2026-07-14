# Item.kind Bookmarks — Implementation Plan (slice ②)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `Item.kind` (`article` | `bookmark`). A bookmark is a reference link that never enters the reading/extraction/sync pipeline and opens at its source URL; saved-for-later items keep today's behaviour. Backend + web get full support; mobile's reading queue stays article-only.

**Architecture:** One nullable-free column (`kind`, default `article`) reused on the existing `Item` table (dormant `readState`/`extractStatus`/article/highlights for bookmarks — no parallel table). `kind` threads through save/update/list at the write layer for UX, and is hard-filtered `kind:'article'` at every sync surface (Kobo sync repo, OPDS query, build-epub, auto-extract chain, backfill) as defence-in-depth. Web gets a save-as-bookmark toggle + a `/bookmarks` page reusing the item-list machinery via a `kind`-scoped `useItems`. `GET /items` with no `?kind=` returns all kinds (backward-compatible); each client opts in.

**Tech Stack:** OpenAPI 3.1 (redocly + hey-api + dart-dio codegen), NestJS 11 + Prisma 7 (SQLite) + CQRS + class-validator, Vitest, Nuxt 4 SPA + `@app/ui` (Vue 3) + `@nuxtjs/i18n`, Flutter 3.41 + built_value + mocktail.

**Spec:** `specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md` (slice ②). Branch: `feat/item-kind-bookmarks`. Build-order table in the design: ② = "schema, spec+codegen, backend filter, web /bookmarks". Mobile `kind=article` filter added per user decision (2026-07-14) to keep the mobile queue clean — a scope addition beyond the design's backend+web wording.

## Global Constraints

- **Spec-first (non-negotiable):** edit `packages/specs/openapi/openapi.yaml` FIRST, then `pnpm spec:validate && pnpm spec:bundle && pnpm spec:codegen`; land codegen artefacts (`packages/api-client-ts/src/generated/`, `packages/api-client-dart/lib/generated/`, `packages/specs/src/openapi-types.ts`, `packages/specs/dist/openapi.json`) in their own commit. NEVER hand-edit generated files.
- **Prisma:** hand-written migration only (FTS5 virtual tables make `prisma migrate dev` demand a reset). NEVER `prisma db push`. Container/CI apply via `prisma migrate deploy`.
- No `any` to escape a type error. Backend tsconfig has `exactOptionalPropertyTypes: true`.
- No `!important`, inline `style=""`, or hard-coded hex brand colours in `.vue`/`.scss`. Every user-visible string via `t()` (web) / `AppLocalizations` (mobile), in **en AND ru** (web) — mobile strings only if new mobile UI (none here).
- Every new/changed `@app/ui` component ships a Storybook story + colocated spec; `pnpm --filter @app/ui audit:components` must exit 0.
- Every new/changed backend handler keeps a `*.handler.spec.ts`.
- **Fixers after editing `.ts`/`.vue`/`.scss`/`.json`/`.md`** (in order): `pnpm --filter <pkg> lint --fix` → `pnpm stylelint:fix` → `pnpm format`. Never hand-fix what a fixer does. No `eslint-disable` without a WHY comment.
- **Where commands run:** backend tests/typecheck/`prisma migrate deploy` run **inside the running container** `burkmak-backend-1` via `docker exec` (host `apps/backend/dist/` + `burkmak.db` are root-owned). Web/`@app/ui` **unit tests + lint run on host**; web **`nuxt typecheck`/`build` run in `burkmak-web-1`** (host `.nuxt` is root-owned). Codegen + spec scripts run on host. Mobile `flutter analyze`/`test` run on host with Flutter on PATH.
- **Codegen toolchain:** `pnpm spec:codegen` regenerates the Dart client via `dart-dio` + `build_runner`, which needs the Flutter/Dart SDK on PATH. Prefix codegen commands with:
  `export PATH="$HOME/projects/petProjects/tools/flutter/bin:$PATH"` (Flutter 3.41.0 — matches CI).
- Bash cwd resets between commands — chain with `cd /home/kkucherenkov/projects/petProjects/burkmak && …`.
- The dev stack is normally running (`docker ps` to confirm). Container mounts the repo — edits reach it live; restart backend only to (a) apply a new migration, (b) re-run bootstrap hooks: `docker compose -f docker/compose.yml restart backend`.
- Commits end with a trailing:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- **Never commit to `main`** — all work on `feat/item-kind-bookmarks`; merge is out of scope (after review).

---

### Task 1: Branch + task-stack entry

**Files:**

- Modify: `specs/tasks/active.md`

**Interfaces:**

- Consumes: template in `specs/tasks/README.md`.
- Produces: T-2026-07-14-005 entry whose sub-boxes later tasks tick.

- [ ] **Step 1: Create the slice branch**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git checkout main && git pull --ff-only && git checkout -b feat/item-kind-bookmarks
```

Expected: `Switched to a new branch 'feat/item-kind-bookmarks'`.

- [ ] **Step 2: Replace the body of `specs/tasks/active.md`**

The file currently contains only `# Active tasks`. New content:

```md
# Active tasks

## T-2026-07-14-005 — bookmarks (Item.kind, slice ②)

- Created: 2026-07-14
- Owner: claude
- Spec: [specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md](../features/2026-07-13-auto-extract-shelves-bookmarks.design.md) (slice ②)
- Plan: [specs/features/2026-07-14-item-kind-bookmarks.plan.md](../features/2026-07-14-item-kind-bookmarks.plan.md)
- Goal: `Item.kind` = article | bookmark; bookmarks never extract/sync, open at source URL; web save-as-bookmark toggle + /bookmarks page; mobile queue article-only.
- Spec diff: yes (Kind enum; Item.kind required; Save/Update/listItems gain kind) — version 0.4.0 → 0.5.0
- Codegen impact: yes (ts + dart clients)
- Sub-steps:
  - [ ] spec: Kind enum + Item/Save/Update/listItems + regen (own commit)
  - [ ] schema + hand-written migration + ports + repo (buildItemWhere)
  - [ ] save/update flows thread kind
  - [ ] extraction pipeline skips bookmarks (chain + backfill)
  - [ ] Kobo sync + OPDS + build-epub exclude bookmarks
  - [ ] web: useApi/useItems + toggle + /bookmarks page + card variant + nav + i18n
  - [ ] mobile: kind=article on list query
  - [ ] gates (fixers, turbo build/lint/test/typecheck, backend container, mobile analyze)
  - [ ] live verification
- Status: in-progress
- Blockers: —
```

- [ ] **Step 3: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add specs/tasks/active.md specs/features/2026-07-14-item-kind-bookmarks.plan.md && git commit -m "chore(tasks): open T-2026-07-14-005 bookmarks (Item.kind, slice 2)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Spec — `Kind` enum + regenerate clients

Spec-first. Two commits: (A) hand-authored spec + bundle; (B) generated artefacts.

**Files:**

- Modify: `packages/specs/openapi/openapi.yaml`
- Regenerate (do NOT hand-edit): `packages/specs/dist/openapi.json`, `packages/specs/src/openapi-types.ts`, `packages/api-client-ts/src/generated/**`, `packages/api-client-dart/lib/generated/**`

**Interfaces:**

- Produces (generated types consumed downstream): `components['schemas']['Kind'] = 'article' | 'bookmark'`; `Item.kind` (required); `SaveItemRequest.kind?`; `UpdateItemRequest.kind?`; `listItems` query param `kind?`. Dart: `Kind` built_value enum (`Kind.article` / `Kind.bookmark`); `ItemsApi.listItems({..., Kind? kind})`.

- [ ] **Step 1: Add the `Kind` enum component**

In `packages/specs/openapi/openapi.yaml`, insert after the `ReadState` schema (immediately after its `description:` line, before `Item:`):

```yaml
    Kind:
      type: string
      enum: [article, bookmark]
      description: Whether the item is a readable article (default) or a reference bookmark
```

- [ ] **Step 2: Add `kind` to `Item` (required)**

Change the `Item` `required` line from:

```yaml
      required: [id, url, status, extractStatus, readState, favorite, savedAt, tags]
```

to:

```yaml
      required: [id, url, kind, status, extractStatus, readState, favorite, savedAt, tags]
```

Add the `kind` property immediately after the `url` property block (after `url:`'s `description: Original URL submitted by the user`):

```yaml
        kind:
          $ref: "#/components/schemas/Kind"
```

- [ ] **Step 3: Add optional `kind` to `SaveItemRequest`**

In `SaveItemRequest.properties`, after the `tags` block, add:

```yaml
        kind:
          $ref: "#/components/schemas/Kind"
          default: article
          description: Save as a readable article (default) or a reference bookmark
```

(3.1 permits sibling keywords next to `$ref`. If `spec:validate` in Step 6 rejects it, inline the schema instead: `type: string`, `enum: [article, bookmark]`, `default: article`, `description: …` — the shared `Kind` is only strictly needed on the query param for the Dart enum.)

- [ ] **Step 4: Add optional `kind` to `UpdateItemRequest`**

Change its `description` line to mention kind, and add the property:

```yaml
    UpdateItemRequest:
      type: object
      minProperties: 1
      description: At least one of `readState`, `favorite`, or `kind` must be provided.
      properties:
        readState:
          $ref: "#/components/schemas/ReadState"
        favorite:
          type: boolean
          description: Set or clear the favourite flag
        kind:
          $ref: "#/components/schemas/Kind"
          description: Promote a bookmark into the reading queue, or demote an article to a bookmark
```

- [ ] **Step 5: Add `?kind=` query param to `listItems`**

Update the operation `description` (line ~126) to end with "…full-text search, and kind." Then insert a new parameter immediately after the `readState` parameter block (after its `description: Filter by read state`), matching the enum-filter pattern:

```yaml
        - name: kind
          in: query
          required: false
          schema:
            $ref: "#/components/schemas/Kind"
          description: Filter by kind (article or bookmark). Omit to return all kinds.
```

- [ ] **Step 6: Bump the API version**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && grep -n "version: 0.4.0" packages/specs/openapi/openapi.yaml
```

Edit that `info.version` line `version: 0.4.0` → `version: 0.5.0` (minor bump — additive feature).

- [ ] **Step 7: Validate, bundle, diff**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm spec:validate && pnpm spec:bundle && pnpm spec:diff
```

Expected: `spec:validate` clean (redocly). `spec:bundle` writes `packages/specs/dist/openapi.json`. `spec:diff` (oasdiff `--fail-on ERR` vs `main`): a **new required property in a response** and **new optional request/query fields** are additive → expected **no ERR**. If oasdiff reports an ERR, read the exact rule ID before acting — do NOT weaken `kind` to optional in responses just to pass the gate (that contradicts the design); if it is a genuine intended-breaking classification on a pre-1.0 API, resolve per repo policy, not by lowering the gate.

- [ ] **Step 8: Commit the hand-authored spec + bundle**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add packages/specs/openapi/openapi.yaml packages/specs/dist/openapi.json && git commit -m "spec(items): add Item.kind (article | bookmark), bump 0.5.0

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 9: Regenerate clients (needs Flutter/Dart on PATH)**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && export PATH="$HOME/projects/petProjects/tools/flutter/bin:$PATH" && pnpm spec:codegen
```

Expected: exit 0. Regenerates openapi-types.ts, hey-api ts client, and the dart client (`dart pub get` + `build_runner` emit `*.g.dart`). Slow (dart step). If Flutter is missing, install per the toolchain note before proceeding — do NOT skip the dart client (CI checks drift).

- [ ] **Step 10: Verify the generated output carries `kind`**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && grep -rl "kind" packages/specs/src/openapi-types.ts packages/api-client-ts/src/generated | head && ls packages/api-client-dart/lib/generated/lib/src/model/kind.dart && grep -n "Kind" packages/api-client-dart/lib/generated/lib/src/api/items_api.dart | head
```

Expected: `openapi-types.ts` + ts generated reference `kind`; `kind.dart` exists; `items_api.dart` `listItems` accepts a `Kind? kind` param.

- [ ] **Step 11: Commit generated artefacts (own commit)**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add packages/specs/src/openapi-types.ts packages/api-client-ts/src/generated packages/api-client-dart/lib/generated && git commit -m "chore(codegen): regenerate clients for Item.kind

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Schema, migration, ports, repo (create + toDetail + extracted `buildItemWhere`)

**Files:**

- Modify: `apps/backend/prisma/schema.prisma`
- Create: `apps/backend/prisma/migrations/20260714120000_item_kind/migration.sql`
- Modify: `apps/backend/src/modules/items/domain/items.ports.ts`
- Modify: `apps/backend/src/modules/items/infra/item.repo.ts`
- Test: `apps/backend/src/modules/items/infra/item.repo.spec.ts`

**Interfaces:**

- Produces: `ItemKind = 'article' | 'bookmark'`; `ItemDetail.kind: ItemKind`; `IItemRepo.create(input: { userId: string; url: string; kind?: ItemKind })`; `ListItemsFilter.kind?: ItemKind`; `IItemRepo.update(userId, id, patch: { readState?; favorite?; kind? })`; **`export function buildItemWhere(f: ListItemsFilter): Record<string, unknown>`** (pure — used by both `findManyPlain` and `findManyFts`).

- [ ] **Step 1: Add the Prisma column + index**

In `apps/backend/prisma/schema.prisma`, in `model Item`, add `kind` right after the `extractStatus` line, and add a composite index alongside the existing ones:

```prisma
  extractStatus String      @default("none") // none | extracting | ready | failed
  kind          String      @default("article") // article | bookmark
```

and in the same model's index block:

```prisma
  @@index([userId, readState])
  @@index([userId, savedAt])
  @@index([userId, kind])
  @@map("item")
```

- [ ] **Step 2: Hand-write the migration**

Create `apps/backend/prisma/migrations/20260714120000_item_kind/migration.sql`:

```sql
-- Hand-written: `prisma migrate dev` refuses to diff this database because the
-- FTS5 virtual tables (item_fts*) live outside schema.prisma (created
-- idempotently by FtsBootstrapService at startup), which its drift detector
-- reads as "reset required". `prisma migrate deploy` applies this file without
-- a drift check, matching how the container applies migrations.

-- AlterTable
ALTER TABLE "item" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'article';

-- CreateIndex
CREATE INDEX "item_userId_kind_idx" ON "item"("userId", "kind");
```

- [ ] **Step 3: Extend the ports**

In `apps/backend/src/modules/items/domain/items.ports.ts`:

Add the type after the other status aliases (after `ExtractStatus`):

```ts
export type ItemKind = 'article' | 'bookmark';
```

Add `kind` to `ItemDetail` (right after `url`):

```ts
export interface ItemDetail {
  id: string;
  url: string;
  kind: ItemKind;
  canonicalUrl: string | null;
```

Widen the `create` input, add `kind` to the list filter, and add `kind` to the update patch:

```ts
  create(input: { userId: string; url: string; kind?: ItemKind }): Promise<string>;
```

```ts
export interface ListItemsFilter {
  userId: string;
  readState?: ReadState;
  tag?: string; // slug
  favorite?: boolean;
  q?: string;
  kind?: ItemKind;
  cursor?: string;
  limit: number;
}
```

```ts
  update(
    userId: string,
    id: string,
    patch: { readState?: ReadState; favorite?: boolean; kind?: ItemKind },
  ): Promise<boolean>; // false = not found/owned
```

- [ ] **Step 4: Write the failing `buildItemWhere` test**

Append to `apps/backend/src/modules/items/infra/item.repo.spec.ts` (add `buildItemWhere` to the existing import from `./item.repo`):

```ts
import { escapeFtsQuery, buildItemWhere } from './item.repo';
```

```ts
describe('buildItemWhere', () => {
  it('always scopes to userId', () => {
    expect(buildItemWhere({ userId: 'u1', limit: 20 })).toEqual({ userId: 'u1' });
  });

  it('adds a kind filter when set (article)', () => {
    expect(buildItemWhere({ userId: 'u1', limit: 20, kind: 'article' })).toEqual({
      userId: 'u1',
      kind: 'article',
    });
  });

  it('adds a kind filter when set (bookmark)', () => {
    expect(buildItemWhere({ userId: 'u1', limit: 20, kind: 'bookmark' })).toEqual({
      userId: 'u1',
      kind: 'bookmark',
    });
  });

  it('omits kind entirely when unfiltered (returns all kinds)', () => {
    expect(buildItemWhere({ userId: 'u1', limit: 20 })).not.toHaveProperty('kind');
  });

  it('combines kind with readState, favorite, and tag', () => {
    expect(
      buildItemWhere({
        userId: 'u1',
        limit: 20,
        kind: 'article',
        readState: 'unread',
        favorite: true,
        tag: 'rust',
      }),
    ).toEqual({
      userId: 'u1',
      kind: 'article',
      readState: 'unread',
      favorite: true,
      tags: { some: { tag: { slug: 'rust', userId: 'u1' } } },
    });
  });
});
```

- [ ] **Step 5: Run it, verify it fails**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- item.repo
```

Expected: FAIL — `buildItemWhere is not a function` (not yet exported).

- [ ] **Step 6: Implement `buildItemWhere`, wire `create`/`toDetail`/both `findMany` branches**

In `apps/backend/src/modules/items/infra/item.repo.ts`:

Add `ItemKind` to the type import from `../domain/items.ports`. Map `kind` in `toDetail` (right after `url`):

```ts
function toDetail(row: Item & { tags?: { tag: { slug: string } }[] }): ItemDetail {
  return {
    id: row.id,
    url: row.url,
    kind: row.kind as ItemDetail['kind'],
    canonicalUrl: row.canonicalUrl,
```

Extract the pure where-builder just above the `@Injectable()` class (mirrors the exported `escapeFtsQuery` seam):

```ts
/**
 * Build the Prisma `where` for item queries, shared by the plain and FTS paths.
 * A missing `kind` means "all kinds" — the list endpoint stays backward-compatible.
 */
export function buildItemWhere(f: ListItemsFilter): Record<string, unknown> {
  const where: Record<string, unknown> = { userId: f.userId };
  if (f.readState) where['readState'] = f.readState;
  if (f.favorite !== undefined) where['favorite'] = f.favorite;
  if (f.tag) where['tags'] = { some: { tag: { slug: f.tag, userId: f.userId } } };
  if (f.kind) where['kind'] = f.kind;
  return where;
}
```

Thread `kind` into `create`:

```ts
  async create(input: { userId: string; url: string; kind?: ItemKind }): Promise<string> {
    const item = await this.prisma.item.create({
      data: {
        userId: input.userId,
        url: input.url,
        ...(input.kind !== undefined && { kind: input.kind }),
      },
    });
    return item.id;
  }
```

Replace the inline `where` block in `findManyPlain` (the `const where … if (f.tag) …` lines) with:

```ts
    const where = buildItemWhere(f);
```

Replace the inline `where` block in `findManyFts` (the `const where … if (f.tag) …` lines, including the `id: { in: candidateIds }`) with:

```ts
    const where = { ...buildItemWhere(f), id: { in: candidateIds } };
```

- [ ] **Step 7: Run tests, verify pass**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- item.repo
```

Expected: PASS (existing `escapeFtsQuery` + 5 new `buildItemWhere`).

- [ ] **Step 8: Apply the migration + typecheck in the container**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && docker exec burkmak-backend-1 sh -c 'cd apps/backend && DATABASE_URL=file:./burkmak.db pnpm exec prisma migrate deploy' && docker exec burkmak-backend-1 pnpm --filter @app/backend exec prisma generate && docker exec burkmak-backend-1 pnpm --filter @app/backend typecheck
```

Expected: migration `20260714120000_item_kind` applied; `prisma generate` refreshes the client with `kind`; typecheck exit 0. (If the container's `DATABASE_URL` differs, use the value from `apps/backend/.env` — SQLite at `apps/backend/burkmak.db`.)

- [ ] **Step 9: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/backend/prisma/schema.prisma apps/backend/prisma/migrations/20260714120000_item_kind apps/backend/src/modules/items/domain/items.ports.ts apps/backend/src/modules/items/infra/item.repo.ts apps/backend/src/modules/items/infra/item.repo.spec.ts && git commit -m "feat(items): add Item.kind column, migration, and buildItemWhere kind filter

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Save flow threads `kind`

**Files:**

- Modify: `apps/backend/src/modules/items/application/dto/save-item.dto.ts`
- Modify: `apps/backend/src/modules/items/application/commands/save-item.command.ts`
- Modify: `apps/backend/src/modules/items/items.controller.ts` (save site, lines 69-74)
- Modify: `apps/backend/src/modules/items/application/commands/save-item.handler.ts`
- Test: `apps/backend/src/modules/items/application/commands/save-item.handler.spec.ts`

**Interfaces:**

- Consumes: `IItemRepo.create({ userId, url, kind? })` (Task 3).
- Produces: `SaveItemCommand(userId, url, tags?, kind = 'article')`.

- [ ] **Step 1: Update the failing tests**

In `apps/backend/src/modules/items/application/commands/save-item.handler.spec.ts`: update the first test's `repo.create` assertion to include `kind`, and add a bookmark test. Change:

```ts
    expect(repo.create).toHaveBeenCalledWith({ userId: 'u1', url: 'https://x.com' });
```

to:

```ts
    expect(repo.create).toHaveBeenCalledWith({ userId: 'u1', url: 'https://x.com', kind: 'article' });
```

and append inside the `describe`:

```ts
  it('creates a bookmark when kind=bookmark, still fetching metadata', async () => {
    const repo = { create: vi.fn().mockResolvedValue('itm_3'), addTag: vi.fn() };
    const jobs = { enqueue: vi.fn().mockResolvedValue({ id: 'job_3' }) };
    const events = { publish: vi.fn() };
    const handler = new SaveItemHandler(repo as never, jobs as never, events as never);

    const res = await handler.execute(new SaveItemCommand('u1', 'https://tool.dev', [], 'bookmark'));

    expect(res).toEqual({ id: 'itm_3' });
    expect(repo.create).toHaveBeenCalledWith({ userId: 'u1', url: 'https://tool.dev', kind: 'bookmark' });
    // metadata still runs (title/favicon); the auto-extract chain skips it by kind.
    expect(jobs.enqueue).toHaveBeenCalledWith('fetch_metadata', { userId: 'u1', itemId: 'itm_3' });
  });
```

- [ ] **Step 2: Run tests, verify the new/changed ones fail**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- save-item.handler
```

Expected: FAIL (`create` called without `kind`; bookmark test's `create` arg mismatch).

- [ ] **Step 3: Add `kind` to the DTO**

`apps/backend/src/modules/items/application/dto/save-item.dto.ts`:

```ts
import { IsArray, IsIn, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class SaveItemDto {
  @IsUrl({ require_protocol: true })
  url!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 40, { each: true })
  tags?: string[];

  @IsOptional()
  @IsIn(['article', 'bookmark'])
  kind?: 'article' | 'bookmark';
}
```

- [ ] **Step 4: Add `kind` to the command**

`apps/backend/src/modules/items/application/commands/save-item.command.ts`:

```ts
export class SaveItemCommand {
  constructor(
    public readonly userId: string,
    public readonly url: string,
    public readonly tags: readonly string[] = [],
    public readonly kind: 'article' | 'bookmark' = 'article',
  ) {}
}
```

- [ ] **Step 5: Pass `kind` at the controller + handler**

In `apps/backend/src/modules/items/items.controller.ts`, the `save` method:

```ts
    const created: { id: string } = await this.commandBus.execute(
      new SaveItemCommand(req.userId, dto.url, dto.tags ?? [], dto.kind ?? 'article'),
    );
```

In `apps/backend/src/modules/items/application/commands/save-item.handler.ts`, the create call:

```ts
    const id = await this.repo.create({ userId: cmd.userId, url: cmd.url, kind: cmd.kind });
```

- [ ] **Step 6: Run tests, verify pass**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- save-item.handler
```

Expected: 3 tests PASS.

- [ ] **Step 7: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/backend/src/modules/items/application/dto/save-item.dto.ts apps/backend/src/modules/items/application/commands/save-item.command.ts apps/backend/src/modules/items/application/commands/save-item.handler.ts apps/backend/src/modules/items/items.controller.ts apps/backend/src/modules/items/application/commands/save-item.handler.spec.ts && git commit -m "feat(items): thread kind through the save flow

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Update flow threads `kind` (bookmark ⇄ article promotion)

**Files:**

- Modify: `apps/backend/src/modules/items/application/dto/update-item.dto.ts`
- Modify: `apps/backend/src/modules/items/application/commands/update-item.command.ts`
- Test: `apps/backend/src/modules/items/application/commands/update-item.handler.spec.ts`

(The handler forwards `cmd.patch` unchanged; `repo.update` already spreads `patch` into `data`, and its port signature gained `kind` in Task 3. The controller passes the whole `dto` as the patch, so no controller change is needed once the DTO carries `kind`.)

**Interfaces:**

- Consumes: `IItemRepo.update(userId, id, { readState?; favorite?; kind? })` (Task 3).
- Produces: `UpdateItemCommand(userId, id, { readState?; favorite?; kind? })`.

- [ ] **Step 1: Write the failing test**

Append to `apps/backend/src/modules/items/application/commands/update-item.handler.spec.ts`:

```ts
  it('forwards a kind change to the repo and emits item.updated', async () => {
    const repo = { update: vi.fn().mockResolvedValue(true) };
    const events = { publish: vi.fn() };
    const handler = new UpdateItemHandler(repo as never, events as never);
    await handler.execute(new UpdateItemCommand('u1', 'itm_1', { kind: 'article' }));
    expect(repo.update).toHaveBeenCalledWith('u1', 'itm_1', { kind: 'article' });
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });
```

- [ ] **Step 2: Run it, verify it fails**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- update-item.handler
```

Expected: FAIL — TS rejects `{ kind: 'article' }` in `UpdateItemCommand`'s patch type (kind not yet allowed).

- [ ] **Step 3: Add `kind` to the DTO**

`apps/backend/src/modules/items/application/dto/update-item.dto.ts`:

```ts
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsIn(['unread', 'read', 'archived'])
  readState?: 'unread' | 'read' | 'archived';

  @IsOptional()
  @IsBoolean()
  favorite?: boolean;

  @IsOptional()
  @IsIn(['article', 'bookmark'])
  kind?: 'article' | 'bookmark';
}
```

- [ ] **Step 4: Add `kind` to the command patch type**

`apps/backend/src/modules/items/application/commands/update-item.command.ts`:

```ts
export class UpdateItemCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly patch: {
      readState?: 'unread' | 'read' | 'archived';
      favorite?: boolean;
      kind?: 'article' | 'bookmark';
    },
  ) {}
}
```

- [ ] **Step 5: Run tests, verify pass**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- update-item.handler
```

Expected: 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/backend/src/modules/items/application/dto/update-item.dto.ts apps/backend/src/modules/items/application/commands/update-item.command.ts apps/backend/src/modules/items/application/commands/update-item.handler.spec.ts && git commit -m "feat(items): allow promoting a bookmark to an article via PATCH kind

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Extraction pipeline skips bookmarks (chain + backfill)

**Files:**

- Modify: `apps/backend/src/modules/items/infra/fetch-metadata.handler.ts` (gate at line 34)
- Test: `apps/backend/src/modules/items/infra/fetch-metadata.handler.spec.ts`
- Modify: `apps/backend/src/modules/items/infra/extract-backfill.bootstrap.ts` (where at line 37)
- Test: `apps/backend/src/modules/items/infra/extract-backfill.bootstrap.spec.ts`

**Interfaces:**

- Consumes: `ItemDetail.kind` (Task 3) — `findById` returns it.

- [ ] **Step 1: Update the chain tests**

In `fetch-metadata.handler.spec.ts`, add `kind: 'article'` to the two `findById` mocks that currently reach the enqueue path (the `auto-enqueues extract_article…` test and the `keeps metadata ready and reverts…` test), so the new gate passes them. Example — the `auto-enqueues` test's repo mock:

```ts
      findById: vi
        .fn()
        .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', kind: 'article', extractStatus: 'none' }),
```

(do the same in the `keeps metadata ready and reverts extractStatus when chain enqueue fails` test). Then append a bookmark test:

```ts
  it('does not auto-extract a bookmark even when extractStatus is none', async () => {
    const fetcher = { fetch: vi.fn().mockResolvedValue(META) };
    const repo = {
      findById: vi
        .fn()
        .mockResolvedValue({ id: 'itm_1', url: 'https://tool.dev', kind: 'bookmark', extractStatus: 'none' }),
      applyMetadata: vi.fn(),
      setExtractStatus: vi.fn(),
    };
    const events = { publish: vi.fn() };
    const jobs = { enqueue: vi.fn() };
    const h = new FetchMetadataHandler(repo as never, fetcher as never, events as never, jobs as never);
    await h.handle(job);
    // metadata still written…
    expect(repo.applyMetadata).toHaveBeenCalledWith('itm_1', expect.objectContaining({ status: 'ready' }));
    // …but no extract chain for a bookmark.
    expect(repo.setExtractStatus).not.toHaveBeenCalled();
    expect(jobs.enqueue).not.toHaveBeenCalled();
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
  });
```

- [ ] **Step 2: Update the backfill test**

In `extract-backfill.bootstrap.spec.ts`, the `enqueues candidates…` test asserts the exact `findMany` where. Change it to include `kind: 'article'`:

```ts
    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: { status: 'ready', extractStatus: { in: ['none', 'failed'] }, kind: 'article' },
      select: { id: true, userId: true },
    });
```

- [ ] **Step 3: Run both specs, verify failures**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- "fetch-metadata|extract-backfill"
```

Expected: FAIL — bookmark test still enqueues (no gate yet); backfill where mismatch.

- [ ] **Step 4: Add the chain gate**

In `apps/backend/src/modules/items/infra/fetch-metadata.handler.ts`, change line 34 from:

```ts
      if (item.extractStatus === 'none') {
```

to:

```ts
      // Bookmarks never enter the extraction queue — only articles auto-extract.
      if (item.kind === 'article' && item.extractStatus === 'none') {
```

- [ ] **Step 5: Add the backfill gate**

In `apps/backend/src/modules/items/infra/extract-backfill.bootstrap.ts`, change the `findMany` where (line 37) to:

```ts
        // kind:'article' is defensive — the marker means this never re-runs on
        // existing installs, and a fresh install has no bookmarks at first boot,
        // but the pipeline must never enqueue extraction for a bookmark.
        where: { status: 'ready', extractStatus: { in: ['none', 'failed'] }, kind: 'article' },
```

- [ ] **Step 6: Run both specs, verify pass**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- "fetch-metadata|extract-backfill"
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/backend/src/modules/items/infra/fetch-metadata.handler.ts apps/backend/src/modules/items/infra/fetch-metadata.handler.spec.ts apps/backend/src/modules/items/infra/extract-backfill.bootstrap.ts apps/backend/src/modules/items/infra/extract-backfill.bootstrap.spec.ts && git commit -m "feat(items): skip bookmarks in the auto-extract chain and backfill

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Kobo sync + OPDS + build-epub exclude bookmarks (defence in depth)

**Files:**

- Modify: `apps/backend/src/modules/kobo/store/kobo-sync.repo.ts` (`findUnsyncedReadyItems` where, line 86-91)
- Modify: `apps/backend/src/modules/kobo/kobo.controller.ts` (`getOpds` findMany filter, lines 94-99)
- Modify: `apps/backend/src/modules/kobo/application/build-epub.service.ts` (`getEpub` guard, after ownership check ~line 54)

**Interfaces:**

- Consumes: `ItemDetail.kind`; `ListItemsFilter.kind` + `buildItemWhere` (Task 3). OPDS bookmark-exclusion rides the Task-3 `buildItemWhere` unit test (article-only case).

- [ ] **Step 1: Kobo sync repo — never entitle a bookmark**

In `apps/backend/src/modules/kobo/store/kobo-sync.repo.ts`, `findUnsyncedReadyItems`, add `kind: 'article'` to the where:

```ts
      where: {
        userId,
        kind: 'article',
        extractStatus: 'ready',
        readState: { not: 'archived' },
        koboEntitlement: { is: null },
      },
```

- [ ] **Step 2: OPDS — filter at the query (covered by buildItemWhere)**

In `apps/backend/src/modules/kobo/kobo.controller.ts`, `getOpds`, add `kind: 'article'` to the `itemRepo.findMany` call so bookmarks never enter the acquisition feed (this flows through the unit-tested `buildItemWhere`):

```ts
    const { items, nextCursor } = await this.itemRepo.findMany({
      userId: req.userId,
      limit: OPDS_PAGE_SIZE,
      kind: 'article',
      ...(cursor === undefined ? {} : { cursor }),
      ...(q === undefined ? {} : { q }),
    });
```

(Leave the existing post-query `extractStatus === 'ready' && readState !== 'archived'` filter as-is — those two dimensions aren't in `buildItemWhere`.)

- [ ] **Step 3: build-epub — a bookmark is never a Kobo book**

In `apps/backend/src/modules/kobo/application/build-epub.service.ts`, `getEpub`, add a guard right after the ownership check (`if (!item) { return { error: 'not_found' }; }`):

```ts
    // 1b. Bookmarks carry no extracted article and must never reach a device,
    //     even if one was manually extracted. Kobo entitlements are only ever
    //     created for articles (kobo-sync.repo), so this is belt-and-suspenders.
    if (item.kind !== 'article') {
      return { error: 'not_found' };
    }
```

- [ ] **Step 4: Typecheck + regression-run the Kobo suite**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend typecheck && docker exec burkmak-backend-1 pnpm --filter @app/backend test -- kobo
```

Expected: typecheck exit 0; existing Kobo specs still green (the service spec mocks the repo, so the added where-clause needs live verification in Task 14 — noted). No new unit spec here: `kobo-sync.repo`/`build-epub.service` have no DB-level spec in this repo; the OPDS exclusion is covered by `buildItemWhere` (Task 3), and end-to-end exclusion is verified live in Task 14.

- [ ] **Step 5: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/backend/src/modules/kobo/store/kobo-sync.repo.ts apps/backend/src/modules/kobo/kobo.controller.ts apps/backend/src/modules/kobo/application/build-epub.service.ts && git commit -m "feat(kobo): exclude bookmarks from sync, OPDS, and epub build

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Web plumbing — `kind` in `useApi` + `useItems` (kind-scoped, namespaced)

**Files:**

- Modify: `apps/web/app/composables/useApi.ts`
- Modify: `apps/web/app/composables/useItems.ts`
- Modify: `apps/web/app/pages/library.vue` (scope the store to articles)
- Test: `apps/web/tests/unit/items-query.spec.ts` (new)

**Interfaces:**

- Produces: `ItemsQuery.kind?: Kind`; `useItems(kind: Kind = 'article')` (state keyed by kind); exported `Filters` and `buildItemsQuery(f: Filters, kind: Kind): ItemsQuery`; `UseItemsReturn.save(url: string, kind?: Kind)`.

- [ ] **Step 1: Add `kind` to `ItemsQuery`**

In `apps/web/app/composables/useApi.ts`, add a `Kind` alias near the other schema aliases and the field:

```ts
type Kind = components['schemas']['Kind'];
```

```ts
export interface ItemsQuery {
  readState?: ReadState;
  tag?: string;
  favorite?: boolean;
  q?: string;
  kind?: Kind;
  cursor?: string;
  limit?: number;
}
```

(`getItems` already passes the query object straight through as params — no impl change.)

- [ ] **Step 2: Write the failing `buildItemsQuery` test**

Create `apps/web/tests/unit/items-query.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { buildItemsQuery, type Filters } from '~/composables/useItems';

const base: Filters = { segment: 'unread', q: '', tag: null };

describe('buildItemsQuery', () => {
  it('defaults an article query to the read-state segment', () => {
    expect(buildItemsQuery(base, 'article')).toEqual({
      kind: 'article',
      q: undefined,
      tag: undefined,
      limit: 20,
      readState: 'unread',
    });
  });

  it('maps the favorite segment to a favorite flag, not a readState', () => {
    const q = buildItemsQuery({ ...base, segment: 'favorite' }, 'article');
    expect(q.favorite).toBe(true);
    expect(q.readState).toBeUndefined();
  });

  it('passes the search term through', () => {
    expect(buildItemsQuery({ ...base, q: 'rust' }, 'article').q).toBe('rust');
  });

  it('a bookmark query carries kind but no read-state segmentation', () => {
    const q = buildItemsQuery({ ...base, segment: 'read' }, 'bookmark');
    expect(q).toEqual({ kind: 'bookmark', q: undefined, tag: undefined, limit: 20 });
    expect(q.readState).toBeUndefined();
    expect(q.favorite).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run it, verify it fails**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm --filter @app/web test -- items-query
```

Expected: FAIL — `buildItemsQuery` / `Filters` not exported.

- [ ] **Step 4: Parameterise `useItems` by kind**

Rewrite `apps/web/app/composables/useItems.ts` — export `Filters`, replace module-level `toQuery` with exported `buildItemsQuery(f, kind)`, key the four `useState`s by `kind`, and make `save` kind-aware. Full file:

```ts
import type { Ref } from 'vue';

import type { AppFilterSegment } from '@app/ui';

import type { components } from '@app/specs';
import type { ItemsQuery } from './useApi';
import { removeItemById, upsertItem } from '~/utils/items-store';

type Item = components['schemas']['Item'];
type ReadState = components['schemas']['ReadState'];
type Kind = components['schemas']['Kind'];

export interface Filters {
  segment: AppFilterSegment;
  q: string;
  tag: string | null;
}

export interface UseItemsReturn {
  items: Ref<Item[]>;
  nextCursor: Ref<string | null>;
  loading: Ref<boolean>;
  filters: Ref<Filters>;
  load(): Promise<void>;
  loadMore(): Promise<void>;
  refetchOne(id: string): Promise<void>;
  removeLocal(id: string): void;
  save(url: string, kind?: Kind): Promise<void>;
  toggleFavorite(item: Item): Promise<void>;
  setReadState(item: Item, readState: Item['readState']): Promise<void>;
  addTag(item: Item, tag: string): Promise<void>;
  removeTag(item: Item, slug: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export function buildItemsQuery(f: Filters, kind: Kind): ItemsQuery {
  const base: ItemsQuery = { kind, q: f.q || undefined, tag: f.tag ?? undefined, limit: 20 };
  // Bookmarks are never segmented by read-state — they're all a flat list.
  if (kind === 'bookmark') return base;
  return f.segment === 'favorite'
    ? { ...base, favorite: true }
    : { ...base, readState: f.segment as ReadState };
}

export function useItems(kind: Kind = 'article'): UseItemsReturn {
  const api = useApi();
  // State is namespaced by kind so the library (articles) and /bookmarks keep
  // independent lists despite sharing this composable.
  const items = useState<Item[]>(`items:list:${kind}`, () => []);
  const nextCursor = useState<string | null>(`items:cursor:${kind}`, () => null);
  const loading = useState<boolean>(`items:loading:${kind}`, () => false);
  const filters = useState<Filters>(`items:filters:${kind}`, () => ({
    segment: 'unread',
    q: '',
    tag: null,
  }));

  async function load(): Promise<void> {
    loading.value = true;
    try {
      const page = await api.getItems(buildItemsQuery(filters.value, kind));
      items.value = [...page.items];
      nextCursor.value = page.nextCursor;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!nextCursor.value) return;
    const page = await api.getItems({
      ...buildItemsQuery(filters.value, kind),
      cursor: nextCursor.value,
    });
    items.value = [...items.value, ...page.items];
    nextCursor.value = page.nextCursor;
  }

  async function refetchOne(id: string): Promise<void> {
    try {
      items.value = upsertItem(items.value, await api.getItem(id));
    } catch {
      // item may have been deleted between event and fetch — ignore
    }
  }

  function removeLocal(id: string): void {
    items.value = removeItemById(items.value, id);
  }

  async function save(url: string, saveKind: Kind = 'article'): Promise<void> {
    const saved = await api.saveItem({ url, kind: saveKind });
    // Only surface it in this scope's list when the kind matches — saving a
    // bookmark from the library must not inject it into the article list.
    if (saved.kind === kind) items.value = upsertItem(items.value, saved);
  }

  async function toggleFavorite(item: Item): Promise<void> {
    items.value = upsertItem(items.value, { ...item, favorite: !item.favorite });
    await api.updateItem(item.id, { favorite: !item.favorite });
  }

  async function setReadState(item: Item, readState: Item['readState']): Promise<void> {
    items.value = upsertItem(items.value, { ...item, readState });
    await api.updateItem(item.id, { readState });
  }

  async function addTag(item: Item, tag: string): Promise<void> {
    items.value = upsertItem(items.value, { ...item, tags: [...item.tags, tag] });
    items.value = upsertItem(items.value, await api.addItemTag(item.id, tag));
  }

  async function removeTag(item: Item, slug: string): Promise<void> {
    items.value = upsertItem(items.value, { ...item, tags: item.tags.filter((t) => t !== slug) });
    await api.removeItemTag(item.id, slug);
  }

  async function remove(id: string): Promise<void> {
    removeLocal(id);
    await api.deleteItem(id);
  }

  return {
    items,
    nextCursor,
    loading,
    filters,
    load,
    loadMore,
    refetchOne,
    removeLocal,
    save,
    toggleFavorite,
    setReadState,
    addTag,
    removeTag,
    remove,
  };
}
```

- [ ] **Step 5: Scope the library store to articles**

In `apps/web/app/pages/library.vue`, change:

```ts
  const store = useItems();
```

to:

```ts
  const store = useItems('article');
```

(The `@save="store.save($event)"` bindings keep working — `$event` is the URL, and `save` defaults `kind='article'`. Task 9 upgrades them to pass the toggle's kind.)

- [ ] **Step 6: Run the unit test, verify pass**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm --filter @app/web test -- items-query
```

Expected: 4 tests PASS.

- [ ] **Step 7: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/web/app/composables/useApi.ts apps/web/app/composables/useItems.ts apps/web/app/pages/library.vue apps/web/tests/unit/items-query.spec.ts && git commit -m "feat(web): kind-scoped useItems + kind on the items query

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Web save-as-bookmark toggle + i18n

**Files:**

- Modify: `apps/web/app/components/library/AppAddBar.vue`
- Modify: `apps/web/app/components/library/AddLinkModal.vue`
- Modify: `apps/web/app/pages/library.vue` (bind both emit args)
- Modify: `apps/web/app/pages/save.vue` (honour `?kind=`)
- Modify: `apps/web/i18n/locales/en.ts`, `apps/web/i18n/locales/ru.ts`

**Interfaces:**

- Consumes: `useItems().save(url, kind)` (Task 8); `AppSwitch` (`@app/ui`, `v-model:modelValue`).
- Produces: add-affordance emit `save: [url: string, kind: 'article' | 'bookmark']`.

- [ ] **Step 1: Toggle in `AppAddBar`**

Replace `apps/web/app/components/library/AppAddBar.vue`:

```vue
<script setup lang="ts">
  import { AppInput, AppButton, AppSwitch } from '@app/ui';
  import { ref, computed } from 'vue';

  const emit = defineEmits<{ save: [url: string, kind: 'article' | 'bookmark'] }>();
  const { t } = useI18n();
  const url = ref('');
  const asBookmark = ref(false);
  const saving = ref(false);
  const looksValid = computed(() => /^https?:\/\/.+\..+/.test(url.value.trim()));
  function onSave(): void {
    if (!looksValid.value) return;
    saving.value = true;
    try {
      emit('save', url.value.trim(), asBookmark.value ? 'bookmark' : 'article');
      url.value = '';
      asBookmark.value = false;
    } finally {
      saving.value = false;
    }
  }
</script>

<template>
  <form class="app-add-bar" @submit.prevent="onSave">
    <AppInput v-model="url" type="url" :placeholder="t('addBar.placeholder')" />
    <AppSwitch v-model="asBookmark" :label="t('addBar.asBookmark')" size="sm" />
    <AppButton type="submit" :loading="saving" :disabled="!looksValid" :label="t('addBar.save')" />
  </form>
</template>

<style scoped lang="scss">
  .app-add-bar {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }
</style>
```

- [ ] **Step 2: Toggle in `AddLinkModal`**

In `apps/web/app/components/library/AddLinkModal.vue`: import `AppSwitch`, add `const asBookmark = ref(false);`, change the emit type to `save: [url: string, kind: 'article' | 'bookmark']`, update `onSave` to `emit('save', url.value.trim(), asBookmark.value ? 'bookmark' : 'article');` then reset `asBookmark.value = false;` before `emit('close')`. Add the switch inside `add-link-modal__form`, after the `<AppInput>`:

```vue
        <AppInput
          ref="inputRef"
          v-model="url"
          type="url"
          :placeholder="t('addModal.placeholder')"
        />
        <AppSwitch v-model="asBookmark" :label="t('addModal.asBookmark')" size="sm" />
```

Update the import line to `import { AppInput, AppButton, AppSwitch } from '@app/ui';`.

- [ ] **Step 3: Bind both emit args in `library.vue`**

Change both call sites from `@save="store.save($event)"` to `@save="store.save"` (binds `url` and `kind` positionally):

```vue
    <AppAddBar @save="store.save" />
```

```vue
    <AddLinkModal :open="modalOpen" @save="store.save" @close="modalOpen = false" />
```

- [ ] **Step 4: Honour `?kind=` in the share target**

In `apps/web/app/pages/save.vue`, thread a kind through `doSave`:

```ts
  type SaveKind = 'article' | 'bookmark';
  let pendingUrl = '';
  let pendingKind: SaveKind = 'article';

  async function doSave(url: string, kind: SaveKind): Promise<void> {
    view.value = 'saving';
    try {
      await api.saveItem({ url, kind });
      view.value = 'saved';
      globalThis.setTimeout(() => {
        globalThis.window.close();
      }, 1200);
    } catch {
      view.value = 'failed';
    }
  }

  function retry(): void {
    if (pendingUrl) void doSave(pendingUrl, pendingKind);
  }
```

In `onMounted`, after resolving the save action:

```ts
    pendingUrl = action.url;
    pendingKind = route.query.kind === 'bookmark' ? 'bookmark' : 'article';
    await doSave(action.url, pendingKind);
```

- [ ] **Step 5: i18n keys (en + ru)**

`apps/web/i18n/locales/en.ts` — add to `addBar` and `addModal`, plus a `nav.navBookmarks` (used in Task 11) and a `bookmarks` group (used in Task 11):

```ts
  addBar: {
    placeholder: 'https://example.com/article',
    save: 'Save',
    asBookmark: 'Bookmark',
  },

  addModal: {
    title: 'Save a link',
    placeholder: 'https://example.com/article',
    cancel: 'Cancel',
    save: 'Save',
    asBookmark: 'Save as bookmark',
  },

  bookmarks: {
    title: 'Bookmarks',
    empty: 'No bookmarks yet',
    emptyHint: 'Save a link as a bookmark to keep it here for reference.',
    search: 'Search bookmarks',
    error: "Couldn't load your bookmarks.",
    retry: 'Retry',
    act: {
      favorite: 'Favorite',
      delete: 'Delete',
    },
  },

  nav: {
    appName: 'burkmak',
    navHome: 'Home',
    navBookmarks: 'Bookmarks',
    navLogin: 'Login',
    navSettings: 'Settings',
    navSignOut: 'Sign out',
    toggleTheme: 'Toggle theme',
  },
```

`apps/web/i18n/locales/ru.ts` — mirror:

```ts
  addBar: {
    placeholder: 'https://example.com/article',
    save: 'Сохранить',
    asBookmark: 'Закладка',
  },

  addModal: {
    title: 'Сохранить ссылку',
    placeholder: 'https://example.com/article',
    cancel: 'Отмена',
    save: 'Сохранить',
    asBookmark: 'Сохранить как закладку',
  },

  bookmarks: {
    title: 'Закладки',
    empty: 'Закладок пока нет',
    emptyHint: 'Сохраните ссылку как закладку, чтобы держать её под рукой.',
    search: 'Поиск закладок',
    error: 'Не удалось загрузить закладки.',
    retry: 'Повторить',
    act: {
      favorite: 'В избранное',
      delete: 'Удалить',
    },
  },

  nav: {
    appName: 'burkmak',
    navHome: 'Главная',
    navBookmarks: 'Закладки',
    navLogin: 'Войти',
    navSettings: 'Настройки',
    navSignOut: 'Выйти',
    toggleTheme: 'Переключить тему',
  },
```

- [ ] **Step 6: Lint + typecheck (typecheck in container)**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm --filter @app/web lint --fix && pnpm stylelint:fix && pnpm format && docker exec burkmak-web-1 pnpm --filter @app/web typecheck
```

Expected: fixers exit 0; `nuxt typecheck` exit 0.

- [ ] **Step 7: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/web/app/components/library/AppAddBar.vue apps/web/app/components/library/AddLinkModal.vue apps/web/app/pages/library.vue apps/web/app/pages/save.vue apps/web/i18n/locales/en.ts apps/web/i18n/locales/ru.ts && git commit -m "feat(web): save-as-bookmark toggle on add bar, modal, and /save

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: `@app/ui` — `AppItemCard` bookmark variant

**Files:**

- Modify: `packages/ui/src/components/AppItemCard/AppItemCard.vue`
- Modify: `packages/ui/src/components/AppItemCard/AppItemCard.stories.ts`
- Test: `packages/ui/src/components/AppItemCard/AppItemCard.spec.ts`

**Interfaces:**

- Produces: `AppItemCard` prop `variant?: 'article' | 'bookmark'` (default `'article'`). In `bookmark` variant the archive action (`data-testid="arc"`) is not rendered; favourite, delete, tags, and `open` are unchanged (the consuming page decides that `open` navigates to the external URL).

- [ ] **Step 1: Write the failing spec**

Append to `packages/ui/src/components/AppItemCard/AppItemCard.spec.ts`:

```ts
  it('hides the archive action in the bookmark variant', () => {
    const w = mount(AppItemCard, {
      global,
      props: { item: base, labels, variant: 'bookmark' },
    });
    expect(w.find('[data-testid="arc"]').exists()).toBe(false);
    expect(w.find('[data-testid="fav"]').exists()).toBe(true);
    expect(w.find('[data-testid="del"]').exists()).toBe(true);
  });

  it('still emits open in the bookmark variant', async () => {
    const w = mount(AppItemCard, {
      global,
      props: { item: base, labels, variant: 'bookmark' },
    });
    await w.find('.app-item-card__title').trigger('click');
    expect(w.emitted('open')?.[0]).toEqual(['itm_1']);
  });

  it('renders the archive action in the default (article) variant', () => {
    expect(mountCard().find('[data-testid="arc"]').exists()).toBe(true);
  });
```

- [ ] **Step 2: Run it, verify it fails**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm --filter @app/ui test -- AppItemCard
```

Expected: FAIL — archive button is unconditionally rendered, so `arc` still exists in the bookmark variant.

- [ ] **Step 3: Add the `variant` prop + conditional archive**

In `packages/ui/src/components/AppItemCard/AppItemCard.vue`, extend the props:

```ts
  const props = withDefaults(
    defineProps<{
      item: AppItemCardData;
      labels: { status: string; favorite: string; archive: string; delete: string };
      fresh?: boolean;
      variant?: 'article' | 'bookmark';
    }>(),
    { fresh: false, variant: 'article' },
  );
```

Gate the archive button with `v-if` (a bookmark has no read-state, so no archive):

```vue
        <AppButton
          v-if="props.variant === 'article'"
          variant="ghost"
          size="sm"
          icon="i-lucide-archive"
          :label="labels.archive"
          data-testid="arc"
          @click="emit('archive', item.id)"
        />
```

- [ ] **Step 4: Add a Bookmark story**

Append to `packages/ui/src/components/AppItemCard/AppItemCard.stories.ts`:

```ts
export const Bookmark: Story = {
  args: {
    item: {
      ...baseItem,
      id: 'itm_6',
      title: 'A handy CLI reference',
      excerpt: 'Reference link — opens at its source, never enters the reading queue.',
      tags: ['tool'],
    },
    labels,
    variant: 'bookmark',
  },
};
```

- [ ] **Step 5: Run spec + build + audit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm --filter @app/ui test -- AppItemCard && pnpm --filter @app/ui build && pnpm --filter @app/ui audit:components
```

Expected: specs PASS; `build` compiles SCSS clean; `audit:components` exit 0 (story + spec present).

- [ ] **Step 6: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add packages/ui/src/components/AppItemCard && git commit -m "feat(ui): AppItemCard bookmark variant (no archive action)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Web `/bookmarks` page + nav link

**Files:**

- Create: `apps/web/app/pages/bookmarks.vue`
- Modify: `apps/web/app/layouts/default.vue` (nav link)

(i18n keys `bookmarks.*` + `nav.navBookmarks` already landed in Task 9.)

**Interfaces:**

- Consumes: `useItems('bookmark')` (Task 8), `AppItemCard` `variant="bookmark"` (Task 10), `toCardData` (existing), `t('bookmarks.*')` / `t('nav.navBookmarks')`.

- [ ] **Step 1: Create the page**

`apps/web/app/pages/bookmarks.vue` — mirrors `library.vue`'s structure, handles loading/error/empty, opens each bookmark at its source URL:

```vue
<script setup lang="ts">
  import { AppItemCard, AppEmptyState, AppSkeleton, AppButton } from '@app/ui';
  import { computed, onMounted, ref, watch } from 'vue';

  import { toCardData } from '~/utils/to-card-data';

  definePageMeta({ middleware: 'auth' });
  const { t } = useI18n();

  const store = useItems('bookmark');
  useEvents();

  const errored = ref(false);

  async function load(): Promise<void> {
    errored.value = false;
    try {
      await store.load();
    } catch {
      errored.value = true;
    }
  }

  onMounted(load);

  // Re-load when the search term changes (bookmarks have no segment/tag bar).
  watch(
    () => store.filters.value.q,
    () => {
      void load();
    },
  );

  const cardLabels = computed(() => ({
    status: t('library.status'),
    favorite: t('bookmarks.act.favorite'),
    archive: t('library.act.archive'),
    delete: t('bookmarks.act.delete'),
  }));

  function openBookmark(id: string): void {
    const item = store.items.value.find((it) => it.id === id);
    if (item) globalThis.window.open(item.url, '_blank', 'noopener');
  }
</script>

<template>
  <div class="page-bookmarks">
    <header class="page-bookmarks__head">
      <h1 class="page-bookmarks__title">
        {{ t('bookmarks.title') }}
      </h1>
    </header>

    <div v-if="store.loading.value" class="page-bookmarks__list">
      <AppSkeleton v-for="n in 5" :key="n" variant="image" />
    </div>

    <div v-else-if="errored" class="page-bookmarks__state">
      <AppEmptyState icon="i-lucide-triangle-alert" :title="t('bookmarks.error')" />
      <AppButton variant="solid" color="primary" :label="t('bookmarks.retry')" @click="load" />
    </div>

    <div v-else-if="store.items.value.length > 0" class="page-bookmarks__list">
      <AppItemCard
        v-for="it in store.items.value"
        :key="it.id"
        :item="toCardData(it)"
        :labels="cardLabels"
        variant="bookmark"
        @open="openBookmark($event)"
        @toggle-favorite="store.toggleFavorite(it)"
        @delete="store.remove($event)"
        @tag-click="store.filters.value.tag = $event"
      />
    </div>

    <AppEmptyState
      v-else
      icon="i-lucide-bookmark"
      :title="t('bookmarks.empty')"
      :description="t('bookmarks.emptyHint')"
    />
  </div>
</template>

<style scoped lang="scss">
  .page-bookmarks {
    max-width: 48rem;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &__title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--fw-bold);
      color: var(--text-fg);
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    &__state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }
  }
</style>
```

- [ ] **Step 2: Add the nav link**

In `apps/web/app/layouts/default.vue`, add a `<li>` immediately after the Settings item (before the Sign-out `<li>`):

```vue
          <li v-if="isAuthenticated" class="default-layout__nav-item">
            <NuxtLink
              to="/bookmarks"
              class="default-layout__nav-link"
              :class="{ 'default-layout__nav-link--active': route.path === '/bookmarks' }"
            >
              {{ t('nav.navBookmarks') }}
            </NuxtLink>
          </li>
```

- [ ] **Step 3: Lint + typecheck (typecheck in container)**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm --filter @app/web lint --fix && pnpm stylelint:fix && pnpm format && docker exec burkmak-web-1 pnpm --filter @app/web typecheck
```

Expected: exit 0 both.

- [ ] **Step 4: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/web/app/pages/bookmarks.vue apps/web/app/layouts/default.vue && git commit -m "feat(web): /bookmarks page + nav link

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Mobile — keep the reading queue article-only

**Files:**

- Modify: `apps/mobile/lib/features/library/data/items_repository.dart`
- Test: `apps/mobile/test/features/library/items_repository_test.dart` (new)

**Interfaces:**

- Consumes: generated `ItemsApi.listItems({..., Kind? kind})` + `Kind.article` (Task 2 dart client).

- [ ] **Step 1: Write the failing repository test**

Create `apps/mobile/test/features/library/items_repository_test.dart`:

```dart
import 'package:app_api_client/app_api_client.dart';
import 'package:app_mobile/features/library/data/items_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class _MockItemsApi extends Mock implements ItemsApi {}

class _MockTagsApi extends Mock implements TagsApi {}

void main() {
  test('listItems only ever requests articles (never bookmarks)', () async {
    final items = _MockItemsApi();
    final repo = ItemsRepository(items, _MockTagsApi());

    when(
      () => items.listItems(
        readState: any(named: 'readState'),
        favorite: any(named: 'favorite'),
        tag: any(named: 'tag'),
        q: any(named: 'q'),
        cursor: any(named: 'cursor'),
        limit: any(named: 'limit'),
        kind: any(named: 'kind'),
      ),
    ).thenAnswer(
      (_) async => Response(
        requestOptions: RequestOptions(path: '/items'),
        data: ItemList((b) => b..nextCursor = null),
      ),
    );

    await repo.listItems();

    verify(
      () => items.listItems(
        readState: null,
        favorite: null,
        tag: null,
        q: null,
        cursor: null,
        limit: 20,
        kind: Kind.article,
      ),
    ).called(1);
  });
}
```

- [ ] **Step 2: Run it, verify it fails**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak/apps/mobile && export PATH="$HOME/projects/petProjects/tools/flutter/bin:$PATH" && flutter test test/features/library/items_repository_test.dart
```

Expected: FAIL — repo does not pass `kind` yet (verify mismatch).

- [ ] **Step 3: Pass `kind: Kind.article`**

In `apps/mobile/lib/features/library/data/items_repository.dart`, add `kind: Kind.article` to the `_items.listItems(...)` call inside `listItems`:

```dart
    final res = await _items.listItems(
      readState: readState,
      favorite: favorite,
      tag: tag,
      q: q,
      cursor: cursor,
      limit: 20,
      kind: Kind.article,
    );
```

- [ ] **Step 4: Run test + analyze**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak/apps/mobile && export PATH="$HOME/projects/petProjects/tools/flutter/bin:$PATH" && flutter test test/features/library/items_repository_test.dart && flutter analyze
```

Expected: test PASS; `flutter analyze` clean.

- [ ] **Step 5: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/mobile/lib/features/library/data/items_repository.dart apps/mobile/test/features/library/items_repository_test.dart && git commit -m "feat(mobile): list only articles — bookmarks stay out of the queue

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: Gates (all packages)

**Files:** none expected (fixer output only).

- [ ] **Step 1: Fixers (host)**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm --filter @app/backend lint --fix && pnpm --filter @app/web lint --fix && pnpm --filter @app/ui lint --fix && pnpm stylelint:fix && pnpm format
```

Expected: exit 0; only pre-existing warnings, if any.

- [ ] **Step 2: Build-first + lint/test/typecheck for the TS packages**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && turbo run build lint --filter=@app/ui --filter=@app/specs && pnpm --filter @app/ui test && pnpm --filter @app/web test
```

Expected: `@app/ui` build compiles SCSS; ui + web unit suites green (incl. new `buildItemsQuery` + `AppItemCard` bookmark tests).

- [ ] **Step 3: Backend full suite + typecheck (container)**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test && docker exec burkmak-backend-1 pnpm --filter @app/backend typecheck
```

Expected: all backend specs pass (prior baseline + new save/update/chain/backfill/buildItemWhere tests); coverage thresholds hold; typecheck exit 0.

- [ ] **Step 4: Web typecheck + build (container)**

```bash
docker exec burkmak-web-1 pnpm --filter @app/web typecheck && docker exec burkmak-web-1 pnpm --filter @app/web build
```

Expected: exit 0 both.

- [ ] **Step 5: Mobile analyze + test (host, Flutter on PATH)**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak/apps/mobile && export PATH="$HOME/projects/petProjects/tools/flutter/bin:$PATH" && flutter analyze && flutter test
```

Expected: analyze clean; all mobile tests pass (existing bloc tests + new repository test).

- [ ] **Step 6: Commit any fixer churn**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git diff --quiet || git commit -am "style: apply lint/format fixers

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 14: Live verification + design-status flip + task boxes

**Files:**

- Modify: `specs/tasks/active.md` (tick sub-boxes), `specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md` (status line)

**Interfaces:** n/a — observational.

- [ ] **Step 1: Apply the migration on the running stack**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && docker compose -f docker/compose.yml restart backend && sleep 8 && docker compose -f docker/compose.yml logs backend --tail=40 | grep -iE "migrat|kind|error" | head
```

Expected: backend boots; `20260714120000_item_kind` applied (or already applied in Task 3 Step 8); no boot error.

- [ ] **Step 2: Auth + save one article and one bookmark**

```bash
cd /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/f7d94d6c-c707-4456-bbbf-f33efda6c80e/scratchpad && curl -s -c cookies.txt -X POST http://localhost:3000/api/v1/auth/sign-up/email -H 'Content-Type: application/json' -d '{"email":"kind-verify@example.com","password":"Passw0rd!Passw0rd!","name":"Kind Verify"}' | head -c 120
# (if the user exists from a rerun, sign-in instead: /api/v1/auth/sign-in/email with the same body minus name)
curl -s -b cookies.txt -X POST http://localhost:3000/api/v1/items -H 'Content-Type: application/json' -d '{"url":"http://paulgraham.com/greatwork.html"}' | grep -o '"kind":"[a-z]*"'
curl -s -b cookies.txt -X POST http://localhost:3000/api/v1/items -H 'Content-Type: application/json' -d '{"url":"https://developer.mozilla.org/en-US/docs/Web/HTTP","kind":"bookmark"}' | grep -o '"kind":"[a-z]*"'
```

Expected: first response `"kind":"article"`, second `"kind":"bookmark"`.

- [ ] **Step 3: Filter round-trip**

```bash
cd /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/f7d94d6c-c707-4456-bbbf-f33efda6c80e/scratchpad && echo "articles:" && curl -s -b cookies.txt "http://localhost:3000/api/v1/items?kind=article" | grep -o '"kind":"[a-z]*"' | sort | uniq -c && echo "bookmarks:" && curl -s -b cookies.txt "http://localhost:3000/api/v1/items?kind=bookmark" | grep -o '"kind":"[a-z]*"' | sort | uniq -c && echo "all:" && curl -s -b cookies.txt "http://localhost:3000/api/v1/items" | grep -o '"kind":"[a-z]*"' | sort | uniq -c
```

Expected: `?kind=article` → only `article`; `?kind=bookmark` → only `bookmark`; no filter → both kinds present.

- [ ] **Step 4: Bookmark never auto-extracts; promote it back**

```bash
cd /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/f7d94d6c-c707-4456-bbbf-f33efda6c80e/scratchpad && BID=$(curl -s -b cookies.txt "http://localhost:3000/api/v1/items?kind=bookmark" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4) && echo "bookmark $BID extractStatus:" && curl -s -b cookies.txt "http://localhost:3000/api/v1/items/$BID" | grep -o '"extractStatus":"[a-z]*"' && curl -s -b cookies.txt -X PATCH "http://localhost:3000/api/v1/items/$BID" -H 'Content-Type: application/json' -d '{"kind":"article"}' | grep -o '"kind":"[a-z]*"'
```

Expected: bookmark `extractStatus` stays `none` (never `extracting`/`ready`); PATCH flips it to `"kind":"article"`.

- [ ] **Step 5: Kobo/OPDS exclude bookmarks**

Save a bookmark, force-extract it (permissive), then confirm it never reaches OPDS. Using a PAT-authenticated OPDS URL if available, or via the session cookie against the OPDS controller. Minimum check — the OPDS feed's acquisition entries must not include the bookmark's title:

```bash
cd /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/f7d94d6c-c707-4456-bbbf-f33efda6c80e/scratchpad && curl -s -b cookies.txt "http://localhost:3000/api/v1/opds" | grep -ci "MDN\|HTTP | Web" || echo "0 (bookmark absent from OPDS — correct)"
```

Expected: `0` — the manually-extracted bookmark does not appear in the OPDS acquisition feed. (Physical-device Kobo collection confirmation is a known ceiling, per done.md T-003 — sandbox/OPDS check stands in.)

- [ ] **Step 6: Web end-to-end via the chromium recipe**

Use the `verify` skill (Nuxt SPA on :3001, chromium at `/usr/bin/chromium`). Confirm:
1. Library add bar shows the Bookmark switch; saving with it ON does **not** add a card to the library list.
2. `/bookmarks` nav link appears; the page lists the bookmark; its card has **no** archive action; clicking the title opens the source URL in a new tab.
3. Library (articles) does not show the bookmark; `/bookmarks` does not show articles.
4. Light + dark render cleanly; no console errors.

- [ ] **Step 7: Tick sub-boxes + flip design status**

In `specs/tasks/active.md`, mark all T-2026-07-14-005 sub-steps `[x]` (Status stays `in-progress` until merge). In `specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md`, change the `Status:` line to:

```
Status: approved 2026-07-13 — slices ①② implemented
```

- [ ] **Step 8: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add specs/tasks/active.md specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md && git commit -m "docs(tasks): T-2026-07-14-005 verified — Item.kind bookmarks live

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Out of scope for this plan

- Slice ③ (shelves + Kobo collections + OPDS nav feed) — separate branch `feat/shelves`, separate plan.
- Merging to `main` / archiving to `done.md` — after user review of the finished slice, `--no-ff` per repo convention.
- Mobile bookmark-viewing UI (a mobile `/bookmarks` equivalent) — mobile only gains the article-only list filter here.
- Two-way Kobo collection sync, shelving bookmarks, per-user auto-extract toggle, hierarchical shelves — design non-goals.

## Self-review notes

- **Spec coverage vs design slice ②:** data model (Task 3) ✓; spec+codegen incl. Item.kind required / Save / Update / listItems (Task 2) ✓; backend save/list/update thread (Tasks 3–5) ✓; Kobo + OPDS `kind:'article'` (Task 7) ✓; auto-extract chain gate (Task 6) ✓; manual extract stays permissive (unchanged — verified in Task 14 Step 5) ✓; web toggle + library filter + /bookmarks + useItems kind + i18n en/ru + @app/ui story/spec (Tasks 8–11) ✓; dormant fields (no code — reused columns) ✓; tests: repo/list kind filter (Task 3 `buildItemWhere`), update kind flip (Task 5), chain/backfill exclusion (Task 6), OPDS exclusion (Task 3 path + Task 14), web toggle/page (Tasks 8–11 + live) ✓.
- **Testing-seam honesty:** `kobo-sync.repo` + `build-epub.service` have no DB-level unit spec in this repo (the Kobo service spec mocks the repo); their `kind` gates are typechecked + verified live (Task 14). OPDS exclusion is unit-covered via `buildItemWhere`. Web SFC pages have no existing mount-test pattern; page behaviour is unit-covered where logic is extractable (`buildItemsQuery`) and otherwise verified live via the chromium recipe — matching how `library.vue` is covered today.
- **Type consistency:** `ItemKind` (backend ports) / `Kind` (generated TS+Dart schema) / `'article' | 'bookmark'` literals (DTOs, commands, Vue emits) are the same value set; `buildItemWhere` (backend) and `buildItemsQuery` (web) are distinct helpers with distinct names.
