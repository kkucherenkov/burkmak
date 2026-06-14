import type { ParsedArticle } from './article';

// ── Symbols ──────────────────────────────────────────────────────────────────

export const ARTICLE_REPO = Symbol('ARTICLE_REPO');
export const ARTICLE_EXTRACTOR = Symbol('ARTICLE_EXTRACTOR');
export const IMAGE_CACHE = Symbol('IMAGE_CACHE');

// ── Read models ──────────────────────────────────────────────────────────────

/** Article read model (mirrors Prisma Article; all dates as ISO strings). */
export interface ItemArticle {
  itemId: string;
  contentHtml: string;
  contentText: string;
  wordCount: number;
  readingTimeMin: number;
  extractedAt: string; // ISO 8601
}

/** Patch applied when upserting an extracted article. */
export interface ArticleUpsertData {
  contentHtml: string;
  contentText: string;
  wordCount: number;
  readingTimeMin: number;
}

// ── Port interfaces ───────────────────────────────────────────────────────────

export interface IArticleRepo {
  /** Upsert the article for the given item. */
  upsert(itemId: string, data: ArticleUpsertData): Promise<void>;
  /**
   * Return the article owned by userId→itemId, or null if not found / not
   * owned by that user.
   */
  findByItem(userId: string, itemId: string): Promise<ItemArticle | null>;
}

export interface IArticleExtractor {
  /** Extract readable article content from raw HTML at the given URL. */
  extract(html: string, url: string): ParsedArticle;
}

export interface IImageCache {
  /**
   * Download images referenced in contentHtml, store locally, and return
   * contentHtml with src attributes rewritten to local API paths.
   * Idempotent — safe to call multiple times for the same itemId.
   */
  cache(itemId: string, contentHtml: string, baseUrl: string): Promise<string>;
}
