import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ItemNotFoundError } from '../../domain/items.errors';
import { ITEM_REPO, type IItemRepo, type ItemDetail } from '../../domain/items.ports';
import { GetItemQuery } from './get-item.query';

@QueryHandler(GetItemQuery)
export class GetItemHandler implements IQueryHandler<GetItemQuery, ItemDetail> {
  constructor(@Inject(ITEM_REPO) private readonly repo: IItemRepo) {}

  async execute(q: GetItemQuery): Promise<ItemDetail> {
    const item = await this.repo.findById(q.userId, q.id);
    if (!item) throw new ItemNotFoundError(q.id);
    return item;
  }
}
