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
import { ARTICLE_REPO, type IArticleRepo } from '../items/domain/article.ports';
import { ITEM_REPO, type IItemRepo } from '../items/domain/items.ports';
import { Inject } from '@nestjs/common';
import { BuildEpubService } from './application/build-epub.service';
import { buildOpdsFeed, buildOpenSearchDescription } from './infra/opds.feed';

/** OPDS feed page size. */
const OPDS_PAGE_SIZE = 50;

/** Convert a title to a URL/filename-safe slug. */
function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/^-|-$/g, '')
      .slice(0, 80) || 'article'
  );
}

@Controller({ version: '1' })
@UseGuards(SessionGuard)
export class KoboController {
  constructor(
    private readonly config: AppConfig,
    private readonly buildEpubService: BuildEpubService,
    @Inject(ITEM_REPO) private readonly itemRepo: IItemRepo,
    @Inject(ARTICLE_REPO) private readonly articleRepo: IArticleRepo,
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
  async getOpds(
    @Req() req: AuthenticatedRequest,
    @Query('cursor') cursor: string | undefined,
    @Query('q') q: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const baseUrl = this.config.publicApiBaseUrl;

    const { items, nextCursor } = await this.itemRepo.findMany({
      userId: req.userId,
      limit: OPDS_PAGE_SIZE,
      ...(cursor === undefined ? {} : { cursor }),
      ...(q === undefined ? {} : { q }),
    });

    // Filter: only ready extractions, exclude archived. Post-query, so a page
    // may run short of OPDS_PAGE_SIZE — valid OPDS; clients just follow `next`.
    const readyItems = items.filter(
      (it) => it.extractStatus === 'ready' && it.readState !== 'archived',
    );

    const coverKeys = await this.articleRepo.findCoverKeys(
      req.userId,
      readyItems.map((it) => it.id),
    );

    const feed = buildOpdsFeed({
      baseUrl,
      updated: new Date().toISOString(),
      selfHref: opdsHref(baseUrl, { cursor, q }),
      nextHref: nextCursor === null ? null : opdsHref(baseUrl, { cursor: nextCursor, q }),
      items: readyItems.map((it) => {
        const coverKey = coverKeys.get(it.id);
        return {
          id: it.id,
          title: it.title ?? 'Untitled',
          siteName: it.siteName,
          excerpt: it.excerpt,
          savedAt: it.savedAt,
          // Cached content image first; remote lead image (og:image) as the
          // fallback for imageless/pre-migration articles.
          coverHref:
            coverKey === undefined
              ? it.leadImageUrl
              : `${baseUrl}/items/${it.id}/image/${coverKey}`,
        };
      }),
    });

    res.setHeader('Content-Type', 'application/atom+xml;profile=opds-catalog;kind=acquisition');
    res.send(feed);
  }

  /** GET /api/v1/opds/opensearch.xml — OpenSearch description for catalog search */
  @Get('opds/opensearch.xml')
  getOpenSearch(@Res() res: Response): void {
    res.setHeader('Content-Type', 'application/opensearchdescription+xml');
    res.send(buildOpenSearchDescription(this.config.publicApiBaseUrl));
  }
}

/** Build an /opds URL with the given query params (omitting empty ones). */
function opdsHref(
  baseUrl: string,
  params: { cursor?: string | undefined; q?: string | undefined },
): string {
  const search = new URLSearchParams();
  if (params.cursor !== undefined && params.cursor !== '') search.set('cursor', params.cursor);
  if (params.q !== undefined && params.q !== '') search.set('q', params.q);
  const qs = search.toString();
  return qs === '' ? `${baseUrl}/opds` : `${baseUrl}/opds?${qs}`;
}
