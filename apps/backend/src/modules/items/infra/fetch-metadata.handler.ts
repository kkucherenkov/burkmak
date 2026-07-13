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
