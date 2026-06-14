import { DomainError } from '../../../common/errors/domain-error';

export class ItemNotFoundError extends DomainError {
  constructor(id: string) {
    super({
      code: 'item-not-found',
      status: 404,
      title: 'Item not found',
      detail: `Item ${id} does not exist.`,
    });
  }
}

export class ArticleNotExtractedError extends DomainError {
  constructor(itemId: string) {
    super({
      code: 'article-not-found',
      status: 404,
      title: 'Article not found',
      detail: `Article for item ${itemId} is not available`,
    });
  }
}
