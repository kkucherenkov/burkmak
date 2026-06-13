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
    } catch (error) {
      this.logger.error(`worker tick failed: ${String(error)}`);
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
    } catch (error) {
      await this.onFailure(job, error);
    }
  }

  /** Transactionally flip the oldest due queued job to running. Returns the pre-claim snapshot. */
  private async claim(): Promise<Job | null> {
    return this.prisma.$transaction(async (tx) => {
      const next = await tx.job.findFirst({
        where: { status: 'queued', runAfter: { lte: new Date() } },
        orderBy: { runAfter: 'asc' },
      });
      if (!next) return null;
      await tx.job.update({
        where: { id: next.id },
        data: { status: 'running', startedAt: new Date(), attempts: { increment: 1 } },
      });
      return next;
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
