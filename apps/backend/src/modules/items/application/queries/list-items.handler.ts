import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ITEM_REPO, type IItemRepo, type ItemDetail } from '../../domain/items.ports';
import { ListItemsQuery } from './list-items.query';

@QueryHandler(ListItemsQuery)
export class ListItemsHandler implements IQueryHandler<
  ListItemsQuery,
  { items: ItemDetail[]; nextCursor: string | null }
> {
  constructor(@Inject(ITEM_REPO) private readonly repo: IItemRepo) {}

  execute(q: ListItemsQuery): Promise<{ items: ItemDetail[]; nextCursor: string | null }> {
    return this.repo.findMany(q.filter);
  }
}
