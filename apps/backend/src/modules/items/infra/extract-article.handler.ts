import { Inject, Injectable } from '@nestjs/common';
import type { Job } from '@prisma/client';

import type { JobHandler } from '../../../common/jobs/job-handler';
import { safeFetch } from '../../../common/net/safe-fetch';
import { EventsService } from '../../events/events.service';
import {
  ARTICLE_EXTRACTOR,
  ARTICLE_REPO,
  IMAGE_CACHE,
  type IArticleExtractor,
  type IArticleRepo,
  type IImageCache,
} from '../domain/article.ports';
import { ITEM_REPO, type IItemRepo } from '../domain/items.ports';
import { firstCachedImageKey } from './image-cache';

/** Fetch timeout for article HTML — slightly longer than metadata (page bodies are larger). */
const FETCH_TIMEOUT_MS = 15_000;
/** Cap raw HTML at 4 MB to bound Readability parse time. */
const HTML_SIZE_CAP = 4_000_000;

@Injectable()
export class ExtractArticleHandler implements JobHandler {
  readonly type = 'extract_article';

  constructor(
    @Inject(ITEM_REPO) private readonly itemRepo: IItemRepo,
    @Inject(ARTICLE_EXTRACTOR) private readonly extractor: IArticleExtractor,
    @Inject(IMAGE_CACHE) private readonly imageCache: IImageCache,
    @Inject(ARTICLE_REPO) private readonly articleRepo: IArticleRepo,
    private readonly events: EventsService,
  ) {}

  async handle(job: Job): Promise<void> {
    if (!job.itemId) return;

    const item = await this.itemRepo.findById(job.userId, job.itemId);
    if (!item) return; // deleted before job ran

    try {
      const html = await this.fetchHtml(item.url);
      const parsed = this.extractor.extract(html, item.url);
      const rewrittenHtml = await this.imageCache.cache(job.itemId, parsed.contentHtml, item.url);

      await this.articleRepo.upsert(job.itemId, {
        contentHtml: rewrittenHtml,
        contentText: parsed.contentText,
        wordCount: parsed.wordCount,
        readingTimeMin: parsed.readingTimeMin,
        coverImageKey: firstCachedImageKey(rewrittenHtml, job.itemId),
      });

      await this.itemRepo.setExtractStatus(job.itemId, 'ready');
      this.events.publish(job.userId, 'item.updated', { id: job.itemId });
    } catch (error) {
      await this.itemRepo.setExtractStatus(job.itemId, 'failed');
      this.events.publish(job.userId, 'item.updated', { id: job.itemId });
      throw error; // let JobWorker apply retry/backoff
    }
  }

  /** Fetch raw HTML with SSRF guard, timeout, and size cap. */
  private async fetchHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    try {
      const res = await safeFetch(url, {
        signal: controller.signal,
        headers: { 'user-agent': 'burkmak/1.0 (+self-hosted read-it-later)' },
      });
      const text = await res.text();
      return text.slice(0, HTML_SIZE_CAP);
    } finally {
      clearTimeout(timer);
    }
  }
}
