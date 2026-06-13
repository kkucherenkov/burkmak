# S0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the template into **burkmak** on a simplified stack — SQLite instead of Postgres, no Centrifugo/Redis/Grafana/Sentry/OTel/AsyncAPI — with a DB-backed job worker and an SSE event stream, booting green.

**Architecture:** Keep the template's NestJS 11 + CQRS + Better Auth + Prisma 7 backbone. Swap the Prisma driver adapter from `@prisma/adapter-pg` to `@prisma/adapter-better-sqlite3` (WAL mode). Replace the Centrifugo realtime-token endpoint with a native SSE endpoint backed by an in-process RxJS event bus, filtered per authenticated user. Add a `Job` table + a polling worker with a pluggable handler registry; later phases register handlers (e.g. `fetch_metadata`) without adding infrastructure.

**Tech Stack:** NestJS 11, Prisma 7 (`@prisma/adapter-better-sqlite3`), better-sqlite3, RxJS (SSE), Vitest, Better Auth.

**Scope note:** This is part 1 of the P1 slice (S0). S1 (core library: items/tags/states, async metadata, web/mobile UI) is a separate follow-on plan that builds on the `Job`/SSE primitives created here.

---

## File Structure

**New files**

- `apps/backend/src/common/jobs/jobs.module.ts` — wires worker + service.
- `apps/backend/src/common/jobs/jobs.service.ts` — `enqueue()`.
- `apps/backend/src/common/jobs/job-worker.ts` — polling worker + handler registry.
- `apps/backend/src/common/jobs/job-handler.ts` — `JobHandler` interface + types.
- `apps/backend/src/common/jobs/jobs.service.spec.ts`, `job-worker.spec.ts`.
- `apps/backend/src/modules/events/events.module.ts`
- `apps/backend/src/modules/events/events.service.ts` — per-user RxJS bus.
- `apps/backend/src/modules/events/events.controller.ts` — `@Sse('events')`.
- `apps/backend/src/modules/events/events.service.spec.ts`

**Modified**

- `apps/backend/prisma/schema.prisma` — datasource → sqlite; add `Job` model.
- `apps/backend/src/common/prisma/prisma.service.ts` — better-sqlite3 adapter + WAL.
- `apps/backend/src/common/config/app-config.ts` — drop redis/centrifugo getters; add `jobs` getter.
- `apps/backend/src/app.module.ts` — drop Redis/Centrifugo/Observability(Sentry)/Realtime; add Jobs/Events.
- `apps/backend/src/main.ts` — drop Sentry/OTel init + interceptor.
- `apps/backend/src/modules/health/**` — db-only health.
- `packages/specs/openapi/openapi.yaml` — drop `POST /realtime/token`; add `GET /events`.
- `docker/compose.yml`, `.github/workflows/ci.yml`, `.env.example`, root + backend `package.json`.

**Deleted**

- `apps/backend/src/common/centrifugo/`, `apps/backend/src/common/redis/`,
  `apps/backend/src/modules/realtime/`, `apps/backend/src/instrument.ts`,
  `apps/backend/src/telemetry.ts`, `apps/backend/src/common/observability/sentry.interceptor.ts`,
  `apps/backend/src/modules/health/infra/centrifugo.checker.ts`,
  `apps/backend/src/modules/health/infra/redis.checker.ts`,
  `packages/specs/asyncapi/`, `packages/specs/scripts/codegen-asyncapi.ts`.

---

## Phase A — Rename & SQLite

### Task 1: Run the template rename

**Files:** repo-wide (driven by `scripts/setup.sh`).

- [ ] **Step 1: Run setup substitution**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak
bash scripts/setup.sh --name "burkmak" --slug "burkmak" \
  --description "Self-hosted read-it-later with Kobo sync and Obsidian export"
```

If `setup.sh` is interactive, run it and answer: name `burkmak`, slug `burkmak`, description as above.

- [ ] **Step 2: Verify no template placeholders remain**

Run: `grep -rIn "{{APP_NAME}}\|{{APP_SLUG}}\|{{APP_DESCRIPTION}}\|YourApp" --exclude-dir=node_modules --exclude-dir=.git .`
Expected: no matches (exit 1).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: brand template as burkmak"
```

### Task 2: Switch Prisma datasource + service to SQLite (WAL)

**Files:**

- Modify: `apps/backend/prisma/schema.prisma:9-11`
- Modify: `apps/backend/src/common/prisma/prisma.service.ts`
- Modify: `apps/backend/.env` / `.env.example`
- Modify: `apps/backend/package.json` (deps)

- [ ] **Step 1: Point the datasource at SQLite**

In `apps/backend/prisma/schema.prisma` replace the datasource block:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

- [ ] **Step 2: Swap the driver adapter dependency**

```bash
cd apps/backend
pnpm remove @prisma/adapter-pg
pnpm add @prisma/adapter-better-sqlite3 better-sqlite3
pnpm add -D @types/better-sqlite3
```

- [ ] **Step 3: Rewrite `prisma.service.ts` for better-sqlite3 + WAL**

```ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

import { AppConfig } from '../config/app-config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: AppConfig) {
    super({
      adapter: new PrismaBetterSQLite3({ url: config.databaseUrl }),
      log: ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    // WAL: API + worker both write; WAL allows concurrent readers + one writer.
    await this.$executeRawUnsafe('PRAGMA journal_mode=WAL;');
    await this.$executeRawUnsafe('PRAGMA busy_timeout=5000;');
    this.logger.log('Prisma connected (sqlite, WAL)');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

- [ ] **Step 4: Set `DATABASE_URL`**

In `apps/backend/.env` (create if absent) and `.env.example`:

```
DATABASE_URL="file:./burkmak.db"
```

Remove `REDIS_URL`, `CENTRIFUGO_*`, `SENTRY_DSN`, `OTEL_EXPORTER_OTLP_ENDPOINT` lines from both.

- [ ] **Step 5: Generate the initial migration + client**

```bash
cd apps/backend
pnpm prisma migrate dev --name init_sqlite
```

Expected: a migration is created under `prisma/migrations/`, `burkmak.db` appears, command exits 0.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(db): switch Prisma to SQLite with WAL"
```

---

## Phase B — Strip dropped services

### Task 3: Remove Centrifugo + the realtime-token endpoint

**Files:**

- Delete: `apps/backend/src/common/centrifugo/`, `apps/backend/src/modules/realtime/`, `apps/backend/src/modules/health/infra/centrifugo.checker.ts`
- Modify: `apps/backend/src/app.module.ts`, `apps/backend/src/common/config/app-config.ts`, `docker/compose.yml`, `apps/backend/package.json`

- [ ] **Step 1: Delete Centrifugo + realtime code**

```bash
cd apps/backend/src
rm -rf common/centrifugo modules/realtime modules/health/infra/centrifugo.checker.ts
```

- [ ] **Step 2: Remove imports from `app.module.ts`**

Delete these two import lines and their entries in the `imports: [...]` array:
`import { CentrifugoModule } from './common/centrifugo/centrifugo.module';`
`import { RealtimeModule } from './modules/realtime/realtime.module';`
(Remove `CentrifugoModule,` and `RealtimeModule,` from `imports`.)

- [ ] **Step 3: Remove the `centrifugo` getter + `CentrifugoConfig` from `app-config.ts`**

Delete the `CentrifugoConfig` interface (lines ~4-9) and the `get centrifugo()` getter (lines ~116-123).

- [ ] **Step 4: Remove the centrifugo service from docker compose**

In `docker/compose.yml` delete the `centrifugo:` service block, the `centrifugo/` config volume mounts, and any `depends_on: [centrifugo]` references in the `backend` service.

- [ ] **Step 5: Drop the dependency**

```bash
cd apps/backend && pnpm remove jsonwebtoken @types/jsonwebtoken 2>/dev/null || true
```

(Only if no longer referenced — run `grep -rn jsonwebtoken src` first; keep if Better Auth needs it.)

- [ ] **Step 6: Typecheck + commit**

Run: `pnpm --filter @app/backend typecheck`
Expected: PASS (no references to deleted modules).

```bash
git add -A && git commit -m "refactor: remove Centrifugo and realtime-token endpoint"
```

### Task 4: Remove Redis

**Files:**

- Delete: `apps/backend/src/common/redis/`, `apps/backend/src/modules/health/infra/redis.checker.ts`
- Modify: `apps/backend/src/app.module.ts`, `apps/backend/src/common/config/app-config.ts`, `docker/compose.yml`

- [ ] **Step 1: Confirm Redis isn't load-bearing**

Run: `grep -rn "RedisService\|RedisModule\|redisUrl" apps/backend/src`
Expected: only the files we're about to delete + `app-config.ts` getter. If anything else uses it, stop and report.

- [ ] **Step 2: Delete + unwire**

```bash
cd apps/backend/src && rm -rf common/redis modules/health/infra/redis.checker.ts
```

In `app.module.ts` remove `import { RedisModule } ...` and `RedisModule,` from `imports`.
In `app-config.ts` remove the `get redisUrl()` getter.

- [ ] **Step 3: Remove redis from docker compose**

In `docker/compose.yml` delete the `redis:` service and any `depends_on: [redis]`.

- [ ] **Step 4: Typecheck + commit**

Run: `pnpm --filter @app/backend typecheck` → PASS

```bash
git add -A && git commit -m "refactor: remove Redis (throttler uses in-memory store)"
```

### Task 5: Remove Sentry + OpenTelemetry

**Files:**

- Delete: `apps/backend/src/instrument.ts`, `apps/backend/src/telemetry.ts`, `apps/backend/src/common/observability/sentry.interceptor.ts`
- Modify: `apps/backend/src/main.ts`, `apps/backend/src/common/observability/observability.module.ts`, `apps/backend/src/common/config/app-config.ts`, `docker/compose.yml`, `apps/backend/package.json`

- [ ] **Step 1: Strip Sentry/OTel from `main.ts`**

Remove these imports:
`import { SentryInterceptor } from './common/observability/sentry.interceptor';`
`import { initSentry } from './instrument';`
`import { initTelemetry, shutdownTelemetry } from './telemetry';`
Remove the `initSentry();` and `initTelemetry();` calls (lines ~19-20), the `app.useGlobalInterceptors(new SentryInterceptor());` line, and simplify the SIGTERM handler to:

```ts
process.on('SIGTERM', () => {
  void app.close();
});
```

- [ ] **Step 2: Delete the files + keep request-id**

```bash
cd apps/backend/src && rm -f instrument.ts telemetry.ts common/observability/sentry.interceptor.ts
```

Open `common/observability/observability.module.ts`; remove any provider/export referencing `SentryInterceptor` or OTel, keep `request-id.middleware`. If the module becomes empty of meaningful providers, keep it (it still wires the request-id middleware).

- [ ] **Step 3: Drop sentryDsn/otelEndpoint from `app-config.ts`**

In `get runtime()` remove `sentryDsn` and `otelEndpoint` (the two `const` lines and the two object fields), and remove them from the `AppRuntimeConfig` interface.

- [ ] **Step 4: Remove deps + compose service**

```bash
cd apps/backend && pnpm remove @sentry/node @sentry/nestjs @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node 2>/dev/null || true
```

(Run `grep -rn "@sentry\|@opentelemetry" package.json` and remove exactly what's listed.)
In `docker/compose.yml` delete the `otel-lgtm` (grafana) service.

- [ ] **Step 5: Typecheck + commit**

Run: `pnpm --filter @app/backend typecheck` → PASS

```bash
git add -A && git commit -m "refactor: remove Sentry and OpenTelemetry"
```

### Task 6: Remove AsyncAPI from packages/specs

**Files:**

- Delete: `packages/specs/asyncapi/`, `packages/specs/scripts/codegen-asyncapi.ts`, generated `packages/api-client-ts/src/realtime/`
- Modify: `packages/specs/package.json`, `packages/specs/scripts/codegen.ts`, `.github/workflows/ci.yml`

- [ ] **Step 1: Delete AsyncAPI sources + generated channels**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak
rm -rf packages/specs/asyncapi packages/specs/scripts/codegen-asyncapi.ts
rm -rf packages/api-client-ts/src/realtime
```

- [ ] **Step 2: Remove AsyncAPI from spec scripts**

In `packages/specs/package.json` remove any `validate`/`codegen` script segment that invokes the AsyncAPI CLI or `codegen-asyncapi.ts`. In `packages/specs/scripts/codegen.ts` remove the import/call of the asyncapi codegen step.

- [ ] **Step 3: Verify spec pipeline still runs**

Run: `pnpm spec:validate && pnpm spec:bundle && pnpm spec:codegen`
Expected: all succeed (OpenAPI only). If `codegen.ts` errors on a missing realtime import, remove that import.

- [ ] **Step 4: Drop AsyncAPI CI steps**

In `.github/workflows/ci.yml` remove the AsyncAPI validation step and the realtime-channel codegen drift step (keep the OpenAPI validate + codegen drift jobs).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor: drop AsyncAPI half of packages/specs (SSE replaces Centrifugo)"
```

---

## Phase C — Health is db-only

### Task 7: Reduce health to a single DB dependency

**Files:**

- Modify: `apps/backend/src/modules/health/domain/health.ts`, `apps/backend/src/modules/health/domain/health.spec.ts`, the health query handler, `apps/backend/src/modules/health/health.module.ts`

- [ ] **Step 1: Update the failing spec first**

In `apps/backend/src/modules/health/domain/health.spec.ts`, change the expectation so a healthy snapshot reports only `{ db: 'ok' }` (remove `redis` and `centrifugo` from the expected `dependencies`).

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm --filter @app/backend test -- health.spec`
Expected: FAIL (snapshot still includes redis/centrifugo).

- [ ] **Step 3: Make the domain produce db-only**

In `apps/backend/src/modules/health/domain/health.ts` reduce the `HealthSnapshot['dependencies']` type and the build logic to `db` only. In the health query handler (`application/queries/get-health.handler.ts`) remove the redis + centrifugo checker injections/calls, keep `prisma-db.checker`. Remove the now-unused checker providers from `health.module.ts`.

- [ ] **Step 4: Run tests to confirm green**

Run: `pnpm --filter @app/backend test -- health.spec`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor(health): report db dependency only"
```

---

## Phase D — Jobs spine

### Task 8: Add the `Job` model + migration

**Files:** Modify `apps/backend/prisma/schema.prisma`

- [ ] **Step 1: Append the model under `// ----- Domain -----`**

```prisma
model Job {
  id          String    @id @default(cuid())
  userId      String
  type        String
  itemId      String?
  status      String    @default("queued") // queued | running | done | failed
  attempts    Int       @default(0)
  maxAttempts Int       @default(3)
  runAfter    DateTime  @default(now())
  error       String?
  payload     String? // JSON-encoded
  createdAt   DateTime  @default(now())
  startedAt   DateTime?
  finishedAt  DateTime?

  @@index([status, runAfter])
  @@map("job")
}
```

- [ ] **Step 2: Migrate**

```bash
cd apps/backend && pnpm prisma migrate dev --name add_job
```

Expected: migration created, exit 0.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(jobs): add Job model"
```

### Task 9: `JobHandler` interface + `JobsService.enqueue`

**Files:**

- Create: `apps/backend/src/common/jobs/job-handler.ts`, `jobs.service.ts`, `jobs.service.spec.ts`

- [ ] **Step 1: Define the handler contract**

`apps/backend/src/common/jobs/job-handler.ts`:

```ts
import type { Job } from '@prisma/client';

/** A unit of background work, keyed by Job.type. Implemented in feature modules. */
export interface JobHandler {
  readonly type: string;
  handle(job: Job): Promise<void>;
}

export const JOB_HANDLERS = Symbol('JOB_HANDLERS');
```

- [ ] **Step 2: Write the failing service spec**

`apps/backend/src/common/jobs/jobs.service.spec.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { JobsService } from './jobs.service';

function prismaMock() {
  return { job: { create: vi.fn().mockImplementation(({ data }) => ({ id: 'j1', ...data })) } };
}

describe('JobsService', () => {
  it('enqueues a queued job with serialized payload', async () => {
    const prisma = prismaMock();
    const svc = new JobsService(prisma as never);
    const job = await svc.enqueue('fetch_metadata', {
      itemId: 'i1',
      userId: 'u1',
      payload: { url: 'x' },
    });
    expect(prisma.job.create).toHaveBeenCalledWith({
      data: {
        type: 'fetch_metadata',
        userId: 'u1',
        itemId: 'i1',
        payload: JSON.stringify({ url: 'x' }),
        status: 'queued',
      },
    });
    expect(job.id).toBe('j1');
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `pnpm --filter @app/backend test -- jobs.service.spec`
Expected: FAIL ("Cannot find module './jobs.service'").

- [ ] **Step 4: Implement the service**

`apps/backend/src/common/jobs/jobs.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import type { Job } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export interface EnqueueInput {
  userId: string;
  itemId?: string | null;
  payload?: unknown;
}

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(type: string, input: EnqueueInput): Promise<Job> {
    return this.prisma.job.create({
      data: {
        type,
        userId: input.userId,
        itemId: input.itemId ?? null,
        payload: input.payload === undefined ? null : JSON.stringify(input.payload),
        status: 'queued',
      },
    });
  }
}
```

- [ ] **Step 5: Run tests → PASS, then commit**

Run: `pnpm --filter @app/backend test -- jobs.service.spec` → PASS

```bash
git add -A && git commit -m "feat(jobs): JobsService.enqueue"
```

### Task 10: `JobWorker` — claim, run, retry with backoff

**Files:**

- Create: `apps/backend/src/common/jobs/job-worker.ts`, `job-worker.spec.ts`
- Modify: `apps/backend/src/common/config/app-config.ts` (add `jobs` getter)

- [ ] **Step 1: Add a `jobs` config getter**

In `app-config.ts` add (mirroring the existing getter style):

```ts
  get jobs(): { pollIntervalMs: number; backoffBaseMs: number } {
    return {
      pollIntervalMs: this.numberOrDefault('JOBS_POLL_INTERVAL_MS', 1000),
      backoffBaseMs: this.numberOrDefault('JOBS_BACKOFF_BASE_MS', 2000),
    };
  }
```

- [ ] **Step 2: Write the failing worker spec**

`apps/backend/src/common/jobs/job-worker.spec.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { JobWorker } from './job-worker';

function makeDeps(job: Record<string, unknown> | null) {
  const updates: Array<Record<string, unknown>> = [];
  const prisma = {
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
    job: {
      findFirst: vi.fn().mockResolvedValue(job),
      update: vi.fn().mockImplementation(({ data }) => {
        updates.push(data);
        return { ...job, ...data };
      }),
    },
  };
  const config = { jobs: { pollIntervalMs: 1000, backoffBaseMs: 1000 } };
  return { prisma, config, updates };
}

describe('JobWorker.runOnce', () => {
  it('marks a job done when its handler succeeds', async () => {
    const { prisma, config, updates } = makeDeps({
      id: 'j1',
      type: 't',
      attempts: 0,
      maxAttempts: 3,
    });
    const worker = new JobWorker(prisma as never, config as never);
    const handle = vi.fn().mockResolvedValue(undefined);
    worker.register({ type: 't', handle });
    await worker.runOnce();
    expect(handle).toHaveBeenCalledOnce();
    expect(updates.at(-1)).toMatchObject({ status: 'done' });
  });

  it('requeues with backoff on failure until maxAttempts, then fails', async () => {
    const { prisma, config, updates } = makeDeps({
      id: 'j1',
      type: 't',
      attempts: 2,
      maxAttempts: 3,
    });
    const worker = new JobWorker(prisma as never, config as never);
    worker.register({ type: 't', handle: vi.fn().mockRejectedValue(new Error('boom')) });
    await worker.runOnce();
    expect(updates.at(-1)).toMatchObject({ status: 'failed' });
  });

  it('does nothing when no job is claimable', async () => {
    const { prisma, config } = makeDeps(null);
    const worker = new JobWorker(prisma as never, config as never);
    await worker.runOnce();
    expect(prisma.job.update).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `pnpm --filter @app/backend test -- job-worker.spec`
Expected: FAIL ("Cannot find module './job-worker'").

- [ ] **Step 4: Implement the worker**

`apps/backend/src/common/jobs/job-worker.ts`:

```ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Job } from '@prisma/client';

import { AppConfig } from '../config/app-config';
import { PrismaService } from '../prisma/prisma.service';
import type { JobHandler } from './job-handler';

@Injectable()
export class JobWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobWorker.name);
  private readonly handlers = new Map<string, JobHandler>();
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfig,
  ) {}

  /** Feature modules call this in their onModuleInit to register a job type. */
  register(handler: JobHandler): void {
    this.handlers.set(handler.type, handler);
  }

  onModuleInit(): void {
    const { pollIntervalMs } = this.config.jobs;
    this.timer = setInterval(() => {
      void this.tick();
    }, pollIntervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.running) return; // single-flight; one job per tick
    this.running = true;
    try {
      await this.runOnce();
    } catch (err) {
      this.logger.error(`worker tick failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }

  /** Claim at most one due job and run it. Exposed for tests. */
  async runOnce(): Promise<void> {
    const job = await this.claim();
    if (!job) return;
    const handler = this.handlers.get(job.type);
    if (!handler) {
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: `no handler for type ${job.type}`,
          finishedAt: new Date(),
        },
      });
      return;
    }
    try {
      await handler.handle(job);
      await this.prisma.job.update({
        where: { id: job.id },
        data: { status: 'done', finishedAt: new Date() },
      });
    } catch (err) {
      await this.onFailure(job, err);
    }
  }

  /** Transactionally flip the oldest due queued job to running. */
  private async claim(): Promise<Job | null> {
    return this.prisma.$transaction(async (tx) => {
      const next = await tx.job.findFirst({
        where: { status: 'queued', runAfter: { lte: new Date() } },
        orderBy: { runAfter: 'asc' },
      });
      if (!next) return null;
      return tx.job.update({
        where: { id: next.id },
        data: { status: 'running', startedAt: new Date(), attempts: { increment: 1 } },
      });
    });
  }

  private async onFailure(job: Job, err: unknown): Promise<void> {
    const message = err instanceof Error ? err.message : String(err);
    const attempts = job.attempts + 1; // claim() already incremented in DB
    if (attempts >= job.maxAttempts) {
      await this.prisma.job.update({
        where: { id: job.id },
        data: { status: 'failed', error: message, finishedAt: new Date() },
      });
      return;
    }
    const backoff = this.config.jobs.backoffBaseMs * 2 ** (attempts - 1);
    await this.prisma.job.update({
      where: { id: job.id },
      data: { status: 'queued', error: message, runAfter: new Date(Date.now() + backoff) },
    });
  }
}
```

> Note: `claim()` increments `attempts`; in `runOnce` tests the claimed job's
> `attempts` is the pre-increment value, so `onFailure` recomputes `attempts + 1`.
> The spec mocks return the job as-is from `findFirst`, so `job.attempts` there is
> the seed value — matching this arithmetic.

- [ ] **Step 5: Run tests → PASS**

Run: `pnpm --filter @app/backend test -- job-worker.spec`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(jobs): polling JobWorker with retry/backoff + handler registry"
```

### Task 11: `JobsModule` + wire into the app

**Files:**

- Create: `apps/backend/src/common/jobs/jobs.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create the module**

`apps/backend/src/common/jobs/jobs.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';

import { JobWorker } from './job-worker';
import { JobsService } from './jobs.service';

@Global()
@Module({
  providers: [JobsService, JobWorker],
  exports: [JobsService, JobWorker],
})
export class JobsModule {}
```

- [ ] **Step 2: Register it**

In `app.module.ts` add `import { JobsModule } from './common/jobs/jobs.module';` and add `JobsModule,` to `imports` (after `PrismaModule`).

- [ ] **Step 3: Typecheck + commit**

Run: `pnpm --filter @app/backend typecheck` → PASS

```bash
git add -A && git commit -m "feat(jobs): JobsModule (global)"
```

---

## Phase E — SSE spine

### Task 12: `EventsService` — per-user RxJS bus

**Files:**

- Create: `apps/backend/src/modules/events/events.service.ts`, `events.service.spec.ts`

- [ ] **Step 1: Write the failing spec**

`apps/backend/src/modules/events/events.service.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { EventsService } from './events.service';

describe('EventsService', () => {
  it('delivers an event only to the matching user', async () => {
    const svc = new EventsService();
    const got = firstValueFrom(svc.stream('u1').pipe(take(1), toArray()));
    svc.publish('u2', 'item.updated', { id: 'x' }); // ignored
    svc.publish('u1', 'item.updated', { id: 'a' }); // delivered
    const events = await got;
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ data: { type: 'item.updated', data: { id: 'a' } } });
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm --filter @app/backend test -- events.service.spec`
Expected: FAIL ("Cannot find module './events.service'").

- [ ] **Step 3: Implement the service**

`apps/backend/src/modules/events/events.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { Subject, type Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface UserEvent {
  userId: string;
  type: string;
  data: unknown;
}

/** Shape NestJS @Sse serializes to `data: <json>` lines. */
export interface SseMessage {
  data: { type: string; data: unknown };
}

@Injectable()
export class EventsService {
  private readonly bus = new Subject<UserEvent>();

  publish(userId: string, type: string, data: unknown): void {
    this.bus.next({ userId, type, data });
  }

  stream(userId: string): Observable<SseMessage> {
    return this.bus.asObservable().pipe(
      filter((e) => e.userId === userId),
      map((e) => ({ data: { type: e.type, data: e.data } })),
    );
  }
}
```

- [ ] **Step 4: Run tests → PASS, then commit**

Run: `pnpm --filter @app/backend test -- events.service.spec` → PASS

```bash
git add -A && git commit -m "feat(events): per-user EventsService bus"
```

### Task 13: `EventsController` (`@Sse`) + `EventsModule`

**Files:**

- Create: `apps/backend/src/modules/events/events.controller.ts`, `events.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Controller**

`apps/backend/src/modules/events/events.controller.ts`:

```ts
import { Controller, Req, Sse, UseGuards } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { merge, interval } from 'rxjs';
import { map } from 'rxjs/operators';

import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { EventsService, type SseMessage } from './events.service';

@Controller({ path: 'events', version: '1' })
@UseGuards(SessionGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Sse()
  stream(@Req() req: AuthenticatedRequest): Observable<SseMessage> {
    // 25s heartbeat keeps proxies from closing idle connections.
    const heartbeat = interval(25_000).pipe(
      map((): SseMessage => ({ data: { type: 'ping', data: null } })),
    );
    return merge(this.events.stream(req.userId), heartbeat);
  }
}
```

- [ ] **Step 2: Module**

`apps/backend/src/modules/events/events.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
```

- [ ] **Step 3: Register in `app.module.ts`**

Add `import { EventsModule } from './modules/events/events.module';` and `EventsModule,` to `imports`.

- [ ] **Step 4: Typecheck + commit**

Run: `pnpm --filter @app/backend typecheck` → PASS

```bash
git add -A && git commit -m "feat(events): SSE /api/v1/events endpoint (per-user, heartbeat)"
```

---

## Phase F — OpenAPI + codegen

### Task 14: Spec the SSE endpoint, drop the realtime path, regenerate

**Files:** Modify `packages/specs/openapi/openapi.yaml`

- [ ] **Step 1: Remove `POST /realtime/token`**

Delete the `/realtime/token` path block and any now-unused realtime schemas/`operationId: issueRealtimeToken`.

- [ ] **Step 2: Add `GET /events`**

Under `paths:` add (keep paths alphabetised within their group):

```yaml
/events:
  get:
    operationId: streamEvents
    summary: Server-Sent Events stream of the caller's item/job updates.
    tags: [events]
    security:
      - sessionCookie: []
    responses:
      '200':
        description: An event stream.
        content:
          text/event-stream:
            schema:
              type: string
            example: |
              data: {"type":"item.updated","data":{"id":"itm_1","status":"ready"}}
      '401':
        $ref: '#/components/responses/Unauthorized'
```

(If `sessionCookie`/`Unauthorized` differ in this spec, reuse the existing names from the auth paths.)

- [ ] **Step 2b: Validate, bundle, codegen**

Run: `pnpm spec:validate && pnpm spec:bundle && pnpm spec:codegen`
Expected: all succeed; `git status` shows regenerated `packages/api-client-{ts,dart}` changes.

- [ ] **Step 3: Commit (spec + generated client in one commit)**

```bash
git add packages/specs packages/api-client-ts packages/api-client-dart
git commit -m "feat(spec): add GET /events, remove realtime token; regen clients"
```

---

## Phase G — CI + boot verification

### Task 15: Update docker compose + CI to the slim stack

**Files:** Modify `docker/compose.yml`, `.github/workflows/ci.yml`, `.env.example`

- [ ] **Step 1: Compose = backend (+ web) on a SQLite volume**

Ensure `docker/compose.yml` no longer references postgres/redis/centrifugo/otel-lgtm. The `backend` service mounts the repo and persists `apps/backend/burkmak.db` via the repo volume; remove `depends_on` entries for the deleted services. Delete `docker/postgres/`, `docker/centrifugo/` config dirs.

- [ ] **Step 2: Prune CI**

In `.github/workflows/ci.yml` remove jobs/steps that start postgres/redis/centrifugo services or run AsyncAPI checks. Keep: backend lint/typecheck/test, web lint/typecheck/test, OpenAPI validate + codegen drift, UI audit, security.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "ci: slim stack (sqlite, no centrifugo/redis/grafana/asyncapi)"
```

### Task 16: Boot the stack green

- [ ] **Step 1: Full local check**

```bash
cd /home/kkucherenkov/projects/petProjects/burkmak
pnpm install
pnpm --filter @app/backend test
pnpm --filter @app/backend typecheck
docker compose -f docker/compose.yml up -d --build
```

- [ ] **Step 2: Verify health is db-only and green**

```bash
curl -s localhost:3000/api/v1/health
```

Expected: `{"status":"ok","dependencies":{"db":"ok"}}`

- [ ] **Step 3: Verify the SSE endpoint authenticates**

```bash
curl -s -i localhost:3000/api/v1/events | head -1
```

Expected: `HTTP/1.1 401` (no session) — proves the guard is active. (A logged-in client receives `text/event-stream`.)

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "chore(s0): foundation boots green on the slim stack"
```

---

## Self-Review

**Spec coverage (against `specs/features/2026-06-13-foundation-and-core.md` Part A):**

- A1 rename → Task 1 ✓ · A2 SQLite/WAL → Task 2 ✓ · A3 strip services → Tasks 3-6 ✓ ·
  A4 jobs worker → Tasks 8-11 ✓ · A5 SSE → Tasks 12-14 ✓ · health db-only → Task 7 ✓ ·
  CI/compose → Task 15 ✓ · boot green → Task 16 ✓.
- S1 (items/tags/metadata/UI) is intentionally **out of scope** — follow-on plan.

**Type consistency:** `JobHandler { type; handle(job) }` is defined in Task 9 and consumed unchanged in Tasks 10-11. `EventsService.publish(userId,type,data)` / `stream(userId)` and `SseMessage` defined in Task 12, consumed in Task 13. `AuthenticatedRequest.userId` comes from the real `auth.guard.ts`.

**Assumptions to verify during execution (don't fabricate):** exact `setup.sh` flags (Task 1); the health query handler filename under `application/queries/` (Task 7); `observability.module.ts` provider list (Task 5); existing `sessionCookie`/`Unauthorized` names in `openapi.yaml` (Task 14). Each task says to grep/open before editing.
