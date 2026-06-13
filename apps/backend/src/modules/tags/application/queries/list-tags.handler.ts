import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TAG_REPO, type ITagRepo, type TagSummary } from '../../domain/tags.ports';
import { ListTagsQuery } from './list-tags.query';

@QueryHandler(ListTagsQuery)
export class ListTagsHandler implements IQueryHandler<ListTagsQuery, { tags: TagSummary[] }> {
  constructor(@Inject(TAG_REPO) private readonly repo: ITagRepo) {}

  async execute(q: ListTagsQuery): Promise<{ tags: TagSummary[] }> {
    return { tags: await this.repo.listForUser(q.userId) };
  }
}
