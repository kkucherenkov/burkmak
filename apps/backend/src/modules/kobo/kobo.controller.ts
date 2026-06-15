import { createReadStream } from 'node:fs';

import {
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { AppConfig } from '../../common/config/app-config';
import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { ITEM_REPO, type IItemRepo } from '../items/domain/items.ports';
import { Inject } from '@nestjs/common';
import { BuildEpubService } from './application/build-epub.service';
import { buildOpdsFeed } from './infra/opds.feed';

/** Convert a title to a URL/filename-safe slug. */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 80) || 'article';
}

@Controller({ version: '1' })
@UseGuards(SessionGuard)
export class KoboController {
  constructor(
    private readonly config: AppConfig,
    private readonly buildEpubService: BuildEpubService,
    @Inject(ITEM_REPO) private readonly itemRepo: IItemRepo,
  ) {}

  /** GET /api/v1/items/:id/epub?format=epub|kepub — build/stream an EPUB or KEPUB */
  @Get('items/:id/epub')
  async getEpub(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('format') format: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const variant = format === 'epub' ? 'epub' : 'kepub';

    const result = await this.buildEpubService.getEpub(req.userId, id, variant);

    if ('error' in result) {
      if (result.error === 'not_found') {
        throw new NotFoundException();
      }
      throw new ConflictException('Article not ready for packaging');
    }

    // Build a safe filename for the download
    // We need to get the item title — re-fetch is cheap (1 query, already in cache after service)
    const item = await this.itemRepo.findById(req.userId, id);
    const slug = slugify(item?.title ?? 'article');
    const filename = variant === 'kepub' ? `${slug}.kepub.epub` : `${slug}.epub`;

    res.setHeader('Content-Type', 'application/epub+zip');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    createReadStream(result.path).pipe(res);
  }

  /** GET /api/v1/opds — OPDS 1.2 acquisition feed of extracted articles */
  @Get('opds')
  async getOpds(@Req() req: AuthenticatedRequest, @Res() res: Response): Promise<void> {
    const { items } = await this.itemRepo.findMany({
      userId: req.userId,
      limit: 100,
    });

    // Filter: only ready extractions, exclude archived
    const readyItems = items.filter(
      (it) => it.extractStatus === 'ready' && it.readState !== 'archived',
    );

    const feed = buildOpdsFeed({
      baseUrl: this.config.publicApiBaseUrl,
      updated: new Date().toISOString(),
      items: readyItems.map((it) => ({
        id: it.id,
        title: it.title ?? 'Untitled',
        siteName: it.siteName,
        excerpt: it.excerpt,
        savedAt: it.savedAt,
      })),
    });

    res.setHeader('Content-Type', 'application/atom+xml;profile=opds-catalog;kind=acquisition');
    res.send(feed);
  }
}
