import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ArticleNotExtractedError } from '../../domain/items.errors';
import { ARTICLE_REPO, type IArticleRepo, type ItemArticle } from '../../domain/article.ports';
import { GetArticleQuery } from './get-article.query';

@QueryHandler(GetArticleQuery)
export class GetArticleHandler implements IQueryHandler<GetArticleQuery, ItemArticle> {
  constructor(@Inject(ARTICLE_REPO) private readonly articleRepo: IArticleRepo) {}

  async execute(q: GetArticleQuery): Promise<ItemArticle> {
    const article = await this.articleRepo.findByItem(q.userId, q.itemId);
    if (!article) throw new ArticleNotExtractedError(q.itemId);
    return article;
  }
}
