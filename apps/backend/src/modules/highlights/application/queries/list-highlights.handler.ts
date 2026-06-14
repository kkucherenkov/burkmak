import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  HIGHLIGHT_REPO,
  type IHighlightRepo,
  type HighlightDetail,
} from '../../domain/highlights.ports';
import { ListHighlightsQuery } from './list-highlights.query';

@QueryHandler(ListHighlightsQuery)
export class ListHighlightsHandler implements IQueryHandler<
  ListHighlightsQuery,
  { highlights: HighlightDetail[] }
> {
  constructor(@Inject(HIGHLIGHT_REPO) private readonly repo: IHighlightRepo) {}

  async execute(q: ListHighlightsQuery): Promise<{ highlights: HighlightDetail[] }> {
    return { highlights: await this.repo.listForItem(q.userId, q.itemId) };
  }
}
