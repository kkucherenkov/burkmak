import { Injectable } from '@nestjs/common';

import { parseArticle, type ParsedArticle } from '../domain/article';
import type { IArticleExtractor } from '../domain/article.ports';

/** Thin injectable adapter — delegates to the pure `parseArticle` function. */
@Injectable()
export class ReadabilityExtractor implements IArticleExtractor {
  extract(html: string, url: string): ParsedArticle {
    return parseArticle(html, url);
  }
}
