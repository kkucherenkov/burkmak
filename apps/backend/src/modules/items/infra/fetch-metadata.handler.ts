import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Job } from '@prisma/client';

import type { JobHandler } from '../../../common/jobs/job-handler';
import { JobsService } from '../../../common/jobs/jobs.service';
import { EventsService } from '../../events/events.service';
import { ITEM_REPO, type IItemRepo } from '../domain/items.ports';
import { METADATA_FETCHER, type IMetadataFetcher } from './metadata.fetcher';

@Injectable()
export class FetchMetadataHandler implements JobHandler {
  readonly type = 'fetch_metadata';

  private readonly logger = new Logger(FetchMetadataHandler.name);

  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    @Inject(METADATA_FETCHER) private readonly fetcher: IMetadataFetcher,
    private readonly events: EventsService,
    private readonly jobs: JobsService,
  ) {}

  async handle(job: Job): Promise<void> {
    if (!job.itemId) return;
    const itemId = job.itemId;
    const item = await this.repo.findById(job.userId, itemId);
    if (!item) return; // deleted before fetch ran
    try {
      const meta = await this.fetcher.fetch(item.url);
      await this.repo.applyMetadata(itemId, { ...meta, status: 'ready' });
      // Auto-extract: a freshly-ready item goes straight to the extract queue.
      // The `none` guard keeps job retries idempotent — extracting/ready/failed
      // items are never re-enqueued from here.
      // Bookmarks never enter the extraction queue — only articles auto-extract.
      if (item.kind === 'article' && item.extractStatus === 'none') {
        try {
          await this.repo.setExtractStatus(itemId, 'extracting');
          await this.jobs.enqueue('extract_article', { userId: job.userId, itemId });
        } catch (chainError) {
          // Metadata succeeded — a chain failure must not mark the item failed.
          // Best-effort revert so the UI shows no perpetual spinner and the
          // manual extract button can re-trigger cleanly.
          await this.repo.setExtractStatus(itemId, 'none').catch((revertError: unknown) => {
            this.logger.warn(`failed to revert extractStatus for item ${itemId}`, revertError);
          });
          this.logger.warn(`auto-extract chain failed for item ${itemId}`, chainError);
        }
      }
      this.events.publish(job.userId, 'item.updated', { id: itemId });
    } catch (error) {
      await this.repo.applyMetadata(itemId, { status: 'failed' });
      this.events.publish(job.userId, 'item.updated', { id: itemId });
      throw error; // let JobWorker apply retry/backoff
    }
  }
}
