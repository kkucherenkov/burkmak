import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';

import { JobsService } from '../../../common/jobs/jobs.service';
// eslint-disable-next-line no-restricted-syntax -- system bootstrap service, direct Prisma access required (similar to FtsBootstrapService)
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
