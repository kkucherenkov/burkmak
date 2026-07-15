import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SHELF_REPO, type IShelfRepo, type ShelfDetail } from '../../domain/shelves.ports';
import { ListShelvesQuery } from './list-shelves.query';

@QueryHandler(ListShelvesQuery)
export class ListShelvesHandler implements IQueryHandler<
  ListShelvesQuery,
  { shelves: ShelfDetail[] }
> {
  constructor(@Inject(SHELF_REPO) private readonly repo: IShelfRepo) {}

  async execute(q: ListShelvesQuery): Promise<{ shelves: ShelfDetail[] }> {
    return { shelves: await this.repo.findMany(q.userId) };
  }
}
