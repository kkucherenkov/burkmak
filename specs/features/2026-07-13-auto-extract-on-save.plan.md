# Auto-Extract on Save — Implementation Plan (slice ①)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every saved article is extracted automatically (reader view / OPDS / Kobo get content with no manual button), and the existing library is backfilled once.

**Architecture:** Two additions, no wire change. (1) `FetchMetadataHandler` chains an `extract_article` job after metadata succeeds, guarded by `extractStatus === 'none'` for idempotency. (2) A one-shot `ExtractBackfillService` (`OnApplicationBootstrap`) enqueues extraction for pre-existing `ready` items, marker-guarded by a completed `extract_backfill` Job row.

**Tech Stack:** NestJS 11, Prisma 7 (SQLite), Vitest, existing Job worker (retry ×3 + backoff).

**Spec:** `specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md` (slice ①). Branch: `feat/auto-extract-on-save` (already created; design doc committed at `fc06d60`).

## Global Constraints

- No OpenAPI change in this slice — do NOT touch `packages/specs/`.
- No Prisma schema change — do NOT run any `prisma migrate`/`db push` command.
- Never `prisma db push` (repo-wide prohibition).
- No `any` to escape type errors. Backend tsconfig has `exactOptionalPropertyTypes: true`.
- After editing `.ts`/`.md`: `pnpm --filter @app/backend lint --fix` then `pnpm format`.
- Commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Host `apps/backend/dist/` and `apps/backend/burkmak.db` are root-owned (container artifacts): run tests/build inside the running container `burkmak-backend-1` via `docker exec` (NOT `docker compose run`); lint/format run on host.
- Bash cwd resets between commands — chain with `cd /home/kkucherenkov/projects/petProjects/burkmak && …`.
- The dev stack is normally running (`docker ps` to confirm). Container mounts the repo — edits reach it live, but NestJS dev server needs a restart only when module wiring changes (Task 2's provider registration is picked up by the watcher automatically; bootstrap hooks fire on process start, so backfill verification requires `docker compose -f docker/compose.yml restart backend`).

---

### Task 1: Push task-stack entry

**Files:**
- Modify: `specs/tasks/active.md`

**Interfaces:**
- Consumes: template in `specs/tasks/README.md`.
- Produces: T-2026-07-13-001 entry that later tasks check boxes in.

- [ ] **Step 1: Replace the empty-state body of `specs/tasks/active.md` with the entry**

The file currently contains only the header + "_No tasks in progress…_" line. New content:

```md
# Active tasks

## T-2026-07-13-001 — auto-extract articles on save

- Created: 2026-07-13
- Owner: claude
- Spec: [specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md](../features/2026-07-13-auto-extract-shelves-bookmarks.design.md) (slice ①)
- Goal: saved articles reach reader/OPDS/Kobo without the manual extract button; existing library backfilled once.
- Spec diff: none (no wire change)
- Codegen impact: no
- Sub-steps:
  - [ ] chain extract_article after fetch_metadata success (guard: extractStatus none)
  - [ ] one-shot marker-guarded ExtractBackfillService
  - [ ] gates (lint, format, tests in container)
  - [ ] live verification: backfill log line, fresh save auto-extracts, restart no-op
- Status: in-progress
- Blockers: —
```

- [ ] **Step 2: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add specs/tasks/active.md && git commit -m "chore(tasks): open T-2026-07-13-001 auto-extract on save

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Chain `extract_article` after metadata success

**Files:**
- Modify: `apps/backend/src/modules/items/infra/fetch-metadata.handler.ts`
- Test: `apps/backend/src/modules/items/infra/fetch-metadata.handler.spec.ts`

**Interfaces:**
- Consumes: `IItemRepo.setExtractStatus(itemId: string, status: ExtractStatus): Promise<void>` (exists, unscoped — ownership already proven by the `findById(job.userId, job.itemId)` call above it); `JobsService.enqueue(type: string, input: {userId: string; itemId?: string | null; payload?: unknown}): Promise<Job>` (exists); `ItemDetail.extractStatus: 'none' | 'extracting' | 'ready' | 'failed'`.
- Produces: `FetchMetadataHandler` constructor gains a 4th parameter `jobs: JobsService`. Nest resolves it automatically (JobsService is provided by the global jobs module); only test call sites change.

- [ ] **Step 1: Write the failing tests**

Append to the `describe('FetchMetadataHandler', …)` block in `apps/backend/src/modules/items/infra/fetch-metadata.handler.spec.ts` — and update the two existing tests' constructor calls to pass a `jobs` mock as the 4th argument (`const jobs = { enqueue: vi.fn() };` … `new FetchMetadataHandler(repo as never, fetcher as never, events as never, jobs as never)`). In the first existing test, add `extractStatus: 'ready'` to the `findById` mock's return object so it exercises the skip path explicitly.

```ts
const META = {
  title: 'T',
  siteName: null,
  excerpt: null,
  leadImageUrl: null,
  faviconUrl: null,
  canonicalUrl: null,
};

it('auto-enqueues extract_article when extractStatus is none', async () => {
  const fetcher = { fetch: vi.fn().mockResolvedValue(META) };
  const repo = {
    findById: vi
      .fn()
      .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', extractStatus: 'none' }),
    applyMetadata: vi.fn(),
    setExtractStatus: vi.fn(),
  };
  const events = { publish: vi.fn() };
  const jobs = { enqueue: vi.fn() };
  const h = new FetchMetadataHandler(repo as never, fetcher as never, events as never, jobs as never);
  await h.handle(job);
  expect(repo.setExtractStatus).toHaveBeenCalledWith('itm_1', 'extracting');
  expect(jobs.enqueue).toHaveBeenCalledWith('extract_article', { userId: 'u1', itemId: 'itm_1' });
});

it('does not chain extraction when extractStatus is not none', async () => {
  const fetcher = { fetch: vi.fn().mockResolvedValue(META) };
  const repo = {
    findById: vi
      .fn()
      .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', extractStatus: 'ready' }),
    applyMetadata: vi.fn(),
    setExtractStatus: vi.fn(),
  };
  const events = { publish: vi.fn() };
  const jobs = { enqueue: vi.fn() };
  const h = new FetchMetadataHandler(repo as never, fetcher as never, events as never, jobs as never);
  await h.handle(job);
  expect(repo.setExtractStatus).not.toHaveBeenCalled();
  expect(jobs.enqueue).not.toHaveBeenCalled();
});

it('does not chain extraction when metadata fetch fails', async () => {
  const fetcher = { fetch: vi.fn().mockRejectedValue(new Error('timeout')) };
  const repo = {
    findById: vi
      .fn()
      .mockResolvedValue({ id: 'itm_1', url: 'https://x.com', extractStatus: 'none' }),
    applyMetadata: vi.fn(),
    setExtractStatus: vi.fn(),
  };
  const events = { publish: vi.fn() };
  const jobs = { enqueue: vi.fn() };
  const h = new FetchMetadataHandler(repo as never, fetcher as never, events as never, jobs as never);
  await expect(h.handle(job)).rejects.toThrow('timeout');
  expect(jobs.enqueue).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run tests, verify the new ones fail**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- fetch-metadata
```

Expected: the two chain tests FAIL (`setExtractStatus`/`enqueue` never called — handler doesn't have the code yet); constructor accepts the extra arg silently (JS), so failures are assertion failures, not type errors.

- [ ] **Step 3: Implement the chain**

Replace `apps/backend/src/modules/items/infra/fetch-metadata.handler.ts` content with:

```ts
import { Inject, Injectable } from '@nestjs/common';
import type { Job } from '@prisma/client';

import type { JobHandler } from '../../../common/jobs/job-handler';
import { JobsService } from '../../../common/jobs/jobs.service';
import { EventsService } from '../../events/events.service';
import { ITEM_REPO, type IItemRepo } from '../domain/items.ports';
import { METADATA_FETCHER, type IMetadataFetcher } from './metadata.fetcher';

@Injectable()
export class FetchMetadataHandler implements JobHandler {
  readonly type = 'fetch_metadata';

  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    @Inject(METADATA_FETCHER) private readonly fetcher: IMetadataFetcher,
    private readonly events: EventsService,
    private readonly jobs: JobsService,
  ) {}

  async handle(job: Job): Promise<void> {
    if (!job.itemId) return;
    const item = await this.repo.findById(job.userId, job.itemId);
    if (!item) return; // deleted before fetch ran
    try {
      const meta = await this.fetcher.fetch(item.url);
      await this.repo.applyMetadata(job.itemId, { ...meta, status: 'ready' });
      // Auto-extract: a freshly-ready item goes straight to the extract queue.
      // The `none` guard keeps job retries idempotent — extracting/ready/failed
      // items are never re-enqueued from here.
      if (item.extractStatus === 'none') {
        await this.repo.setExtractStatus(job.itemId, 'extracting');
        await this.jobs.enqueue('extract_article', { userId: job.userId, itemId: job.itemId });
      }
      this.events.publish(job.userId, 'item.updated', { id: job.itemId });
    } catch (error) {
      await this.repo.applyMetadata(job.itemId, { status: 'failed' });
      this.events.publish(job.userId, 'item.updated', { id: job.itemId });
      throw error; // let JobWorker apply retry/backoff
    }
  }
}
```

Note (slice ② forward-reference from the design doc): when `Item.kind` lands, this guard gains `&& item.kind === 'article'`. Do NOT add it now — the field doesn't exist.

- [ ] **Step 4: Run tests, verify all pass**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- fetch-metadata
```

Expected: 5 tests PASS (2 pre-existing + 3 new).

- [ ] **Step 5: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/backend/src/modules/items/infra/fetch-metadata.handler.ts apps/backend/src/modules/items/infra/fetch-metadata.handler.spec.ts && git commit -m "feat(items): auto-enqueue extract_article after metadata fetch succeeds

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: One-shot extract backfill service

**Files:**
- Create: `apps/backend/src/modules/items/infra/extract-backfill.service.ts`
- Test: `apps/backend/src/modules/items/infra/extract-backfill.service.spec.ts`
- Modify: `apps/backend/src/modules/items/items.module.ts` (add provider)

**Interfaces:**
- Consumes: `PrismaService` (`../../../common/prisma/prisma.service`) — `job.findFirst`, `item.findMany`, `item.update`, `job.create`; `JobsService.enqueue` (as in Task 2); `EventsService.publish(userId: string, type: string, payload: unknown): void` (`../../events/events.service`).
- Produces: `ExtractBackfillService` — `OnApplicationBootstrap` provider, no exports; nothing else depends on it.

- [ ] **Step 1: Write the failing tests**

Create `apps/backend/src/modules/items/infra/extract-backfill.service.spec.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { ExtractBackfillService } from './extract-backfill.service';

function makePrisma(overrides: {
  marker?: { id: string } | null;
  candidates?: Array<{ id: string; userId: string }>;
}) {
  return {
    job: {
      findFirst: vi.fn().mockResolvedValue(overrides.marker ?? null),
      create: vi.fn().mockResolvedValue({ id: 'job_marker' }),
    },
    item: {
      findMany: vi.fn().mockResolvedValue(overrides.candidates ?? []),
      update: vi.fn().mockResolvedValue({}),
    },
  };
}

describe('ExtractBackfillService', () => {
  it('no-ops when the marker job exists', async () => {
    const prisma = makePrisma({ marker: { id: 'job_0' } });
    const jobs = { enqueue: vi.fn() };
    const events = { publish: vi.fn() };
    const svc = new ExtractBackfillService(prisma as never, jobs as never, events as never);
    await svc.onApplicationBootstrap();
    expect(prisma.item.findMany).not.toHaveBeenCalled();
    expect(jobs.enqueue).not.toHaveBeenCalled();
    expect(prisma.job.create).not.toHaveBeenCalled();
  });

  it('enqueues candidates, marks them extracting, publishes, then writes the marker', async () => {
    const prisma = makePrisma({
      candidates: [
        { id: 'itm_1', userId: 'u1' },
        { id: 'itm_2', userId: 'u2' },
      ],
    });
    const jobs = { enqueue: vi.fn() };
    const events = { publish: vi.fn() };
    const svc = new ExtractBackfillService(prisma as never, jobs as never, events as never);
    await svc.onApplicationBootstrap();
    expect(prisma.item.findMany).toHaveBeenCalledWith({
      where: { status: 'ready', extractStatus: { in: ['none', 'failed'] } },
      select: { id: true, userId: true },
    });
    expect(prisma.item.update).toHaveBeenCalledWith({
      where: { id: 'itm_1' },
      data: { extractStatus: 'extracting' },
    });
    expect(jobs.enqueue).toHaveBeenCalledWith('extract_article', { userId: 'u1', itemId: 'itm_1' });
    expect(jobs.enqueue).toHaveBeenCalledWith('extract_article', { userId: 'u2', itemId: 'itm_2' });
    expect(events.publish).toHaveBeenCalledWith('u1', 'item.updated', { id: 'itm_1' });
    expect(prisma.job.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: 'extract_backfill', status: 'done' }),
    });
  });

  it('logs and swallows errors instead of failing app bootstrap', async () => {
    const prisma = makePrisma({});
    prisma.job.findFirst.mockRejectedValue(new Error('db locked'));
    const jobs = { enqueue: vi.fn() };
    const events = { publish: vi.fn() };
    const svc = new ExtractBackfillService(prisma as never, jobs as never, events as never);
    await expect(svc.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(jobs.enqueue).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- extract-backfill
```

Expected: FAIL — `Cannot find module './extract-backfill.service'` (or equivalent import error).

- [ ] **Step 3: Implement the service**

Create `apps/backend/src/modules/items/infra/extract-backfill.service.ts`:

```ts
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';

import { JobsService } from '../../../common/jobs/jobs.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EventsService } from '../../events/events.service';

/**
 * One-shot backfill: enqueue extract_article for every item saved before
 * auto-extract-on-save existed (status ready, never successfully extracted).
 *
 * Idempotency marker: a completed Job row of type `extract_backfill` — if it
 * exists the service no-ops, so restarts never re-enqueue. The Job table is
 * this repo's durable "this ran" primitive; no separate flag table.
 *
 * Errors are logged, never thrown — a failed backfill must not block boot
 * (same stance as FtsBootstrapService).
 */
@Injectable()
export class ExtractBackfillService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ExtractBackfillService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
    private readonly events: EventsService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const marker = await this.prisma.job.findFirst({
        where: { type: 'extract_backfill', status: 'done' },
        select: { id: true },
      });
      if (marker) return;

      const candidates = await this.prisma.item.findMany({
        where: { status: 'ready', extractStatus: { in: ['none', 'failed'] } },
        select: { id: true, userId: true },
      });

      for (const item of candidates) {
        await this.prisma.item.update({
          where: { id: item.id },
          data: { extractStatus: 'extracting' },
        });
        await this.jobs.enqueue('extract_article', { userId: item.userId, itemId: item.id });
        this.events.publish(item.userId, 'item.updated', { id: item.id });
      }

      await this.prisma.job.create({
        data: {
          type: 'extract_backfill',
          userId: 'system',
          status: 'done',
          finishedAt: new Date(),
        },
      });
      this.logger.log(`extract backfill: enqueued ${String(candidates.length)} item(s)`);
    } catch (error) {
      this.logger.error('extract backfill failed — will retry on next boot', error);
    }
  }
}
```

- [ ] **Step 4: Register the provider**

In `apps/backend/src/modules/items/items.module.ts`: add the import (alphabetical position — after `ArticleRepo`, before `ExtractArticleHandler`):

```ts
import { ExtractBackfillService } from './infra/extract-backfill.service';
```

and add `ExtractBackfillService,` to the `providers` array (after `ExtractArticleHandler,`). Do NOT register it with the job worker — it is not a `JobHandler`.

- [ ] **Step 5: Run tests, verify they pass**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test -- extract-backfill
```

Expected: 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add apps/backend/src/modules/items/infra/extract-backfill.service.ts apps/backend/src/modules/items/infra/extract-backfill.service.spec.ts apps/backend/src/modules/items/items.module.ts && git commit -m "feat(items): one-shot marker-guarded extract backfill on bootstrap

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Gates

**Files:**
- Modify: none expected (fixer output only).

**Interfaces:** n/a.

- [ ] **Step 1: Fixers (host)**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && pnpm --filter @app/backend lint --fix && pnpm format
```

Expected: exit 0, no remaining errors (warnings acceptable only if pre-existing).

- [ ] **Step 2: Full backend test suite + typecheck (container)**

```bash
docker exec burkmak-backend-1 pnpm --filter @app/backend test
docker exec burkmak-backend-1 pnpm --filter @app/backend typecheck
```

Expected: all tests pass (202 pre-existing + 6 new = 208; count may drift if main moved), typecheck exit 0.

- [ ] **Step 3: Commit if fixers changed anything**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git diff --quiet || git commit -am "style: apply lint/format fixers

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Live verification on the dev stack

**Files:**
- Modify: `specs/tasks/active.md` (check sub-boxes), `specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md` (flip Status line).

**Interfaces:** n/a — observational task.

- [ ] **Step 1: Snapshot pre-backfill DB state**

```bash
docker exec burkmak-backend-1 node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.item.groupBy({ by: ['extractStatus'], _count: true })
  .then((r) => { console.log(JSON.stringify(r)); return p.\$disconnect(); });
"
```

Expected: JSON counts per extractStatus (note the `none`/`failed` totals — the backfill set).

- [ ] **Step 2: Restart backend, watch the backfill fire**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && docker compose -f docker/compose.yml restart backend && sleep 8 && docker compose -f docker/compose.yml logs backend --tail=50 | grep -i -E "backfill|ExtractBackfill"
```

Expected: `extract backfill: enqueued N item(s)` where N = the Step-1 `none`+`failed` count (0 is valid if the dev library was fully extracted already — the marker still gets written).

- [ ] **Step 3: Wait for the queue to drain, re-check counts**

Re-run the Step-1 command after ~30s. Expected: `none` count 0; items moved to `ready` (or `failed` for genuinely unextractable pages — acceptable, matches manual behavior).

- [ ] **Step 4: Verify restart no-op (marker respected)**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && docker compose -f docker/compose.yml restart backend && sleep 8 && docker compose -f docker/compose.yml logs backend --tail=50 | grep -c "extract backfill"
```

Expected: `0` (no backfill log line on second boot). Confirm exactly one marker:

```bash
docker exec burkmak-backend-1 node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.job.count({ where: { type: 'extract_backfill' } })
  .then((n) => { console.log('markers:', n); return p.\$disconnect(); });
"
```

Expected: `markers: 1`.

- [ ] **Step 5: Fresh-save chain end-to-end via API**

```bash
cd /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/cbb5d84e-aad7-4c2d-a5bc-338d49fccac7/scratchpad && curl -s -c cookies.txt -X POST http://localhost:3000/api/v1/auth/sign-up/email -H 'Content-Type: application/json' -d '{"email":"autoextract-verify@example.com","password":"Passw0rd!Passw0rd!","name":"AutoExtract Verify"}' | head -c 200
```

(If the email already exists from a rerun, use `/api/v1/auth/sign-in/email` with the same body minus `name`.) Then save a known-extractable article and poll:

```bash
cd /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/cbb5d84e-aad7-4c2d-a5bc-338d49fccac7/scratchpad && curl -s -b cookies.txt -X POST http://localhost:3000/api/v1/items -H 'Content-Type: application/json' -d '{"url":"http://paulgraham.com/greatwork.html"}' > item.json && cat item.json
```

Note the returned `id`, then poll (repeat up to ~6× with a few seconds between):

```bash
cd /tmp/claude-1000/-home-kkucherenkov-projects-petProjects-burkmak/cbb5d84e-aad7-4c2d-a5bc-338d49fccac7/scratchpad && curl -s -b cookies.txt http://localhost:3000/api/v1/items/<ID> | grep -o '"extractStatus":"[a-z]*"'
```

Expected progression WITHOUT ever calling `/extract`: `"none"` or `"extracting"` → finally `"ready"`. This is the slice's definition of done.

- [ ] **Step 6: Check all sub-boxes in `specs/tasks/active.md`, flip design-doc status**

In `specs/tasks/active.md`: mark all four T-2026-07-13-001 sub-steps `[x]` (Status stays `in-progress` until merge). In `specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md`: change `Status: draft — awaiting user review` to `Status: approved 2026-07-13 — slice ① implemented`.

- [ ] **Step 7: Commit**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak && git add specs/tasks/active.md specs/features/2026-07-13-auto-extract-shelves-bookmarks.design.md && git commit -m "docs(tasks): T-2026-07-13-001 verified — auto-extract chain + backfill live

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Out of scope for this plan

- `kind === 'article'` gate in the chain (slice ②, needs the schema field).
- Merging to `main` / archiving to `done.md` — happens after user review of the finished slice, `--no-ff` per repo convention.
- Any spec/codegen/web/mobile change.
