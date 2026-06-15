import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { AppConfig } from '../../../common/config/app-config';
import { ARTICLE_REPO, type IArticleRepo } from '../../items/domain/article.ports';
import { ITEM_REPO, type IItemRepo } from '../../items/domain/items.ports';
import { buildEpub } from '../infra/epub.builder';
import { type EpubVariant, EpubCache } from '../infra/epub.cache';
import { toKepubXhtml } from '../infra/kepub.transform';

/** Map of known raster MIME types by extension (mirrors the image cache). */
const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

@Injectable()
export class BuildEpubService {
  private readonly logger = new Logger(BuildEpubService.name);

  constructor(
    private readonly config: AppConfig,
    private readonly epubCache: EpubCache,
    @Inject(ITEM_REPO) private readonly itemRepo: IItemRepo,
    @Inject(ARTICLE_REPO) private readonly articleRepo: IArticleRepo,
  ) {}

  /**
   * Get or build an EPUB/KEPUB for the given item.
   * Returns the on-disk cache path on success, or an error discriminant.
   */
  async getEpub(
    userId: string,
    itemId: string,
    variant: EpubVariant,
  ): Promise<{ path: string } | { error: 'not_found' | 'not_ready' }> {
    // 1. Ownership check
    const item = await this.itemRepo.findById(userId, itemId);
    if (!item) {
      return { error: 'not_found' };
    }

    // 2. Require extractStatus === 'ready'
    if (item.extractStatus !== 'ready') {
      return { error: 'not_ready' };
    }

    // 3. Load article
    const article = await this.articleRepo.findByItem(userId, itemId);
    if (!article) {
      return { error: 'not_ready' };
    }

    // 4. Cache hit?
    const cachePath = this.epubCache.cachePath(itemId, variant, article.extractedAt);
    if (this.epubCache.exists(cachePath)) {
      return { path: cachePath };
    }

    // 5. Build: load images from disk, build EPUB, optionally inject KEPUB spans
    const images = await this.loadImages(itemId);

    // For KEPUB, inject koboSpan into chapter HTML before packaging
    const contentHtml =
      variant === 'kepub' ? toKepubXhtml(article.contentHtml) : article.contentHtml;

    const bytes = await buildEpub({
      item: {
        id: itemId,
        title: item.title ?? 'Untitled',
        url: item.url,
        siteName: item.siteName ?? '',
        lang: 'en',
      },
      article: { contentHtml },
      images,
      modified: article.extractedAt,
    });

    // 6. Write to cache
    await this.epubCache.write(cachePath, bytes);
    return { path: cachePath };
  }

  /** Load all cached images for an item from disk. Skips files that cannot be read. */
  private async loadImages(
    itemId: string,
  ): Promise<{ name: string; mediaType: string; data: Uint8Array }[]> {
    const imageDir = path.join(this.config.dataDir, 'images', itemId);
    let files: string[];
    try {
      files = await readdir(imageDir);
    } catch {
      // No image dir = no images (article had none or hasn't been extracted yet)
      return [];
    }

    const results: { name: string; mediaType: string; data: Uint8Array }[] = [];
    for (const file of files) {
      const ext = file.split('.').at(-1) ?? '';
      const mediaType = EXT_TO_MIME[ext];
      if (!mediaType) continue; // skip unknown/non-image files

      try {
        const buf = await readFile(path.join(imageDir, file));
        results.push({ name: file, mediaType, data: new Uint8Array(buf) });
      } catch (err) {
        this.logger.warn(`BuildEpubService: skipped image ${file} for item ${itemId}: ${String(err)}`);
      }
    }
    return results;
  }
}
