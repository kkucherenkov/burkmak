import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ShelfNotFoundError } from '../../domain/shelves.errors';
import { SHELF_REPO, type IShelfRepo, type ShelfDetail } from '../../domain/shelves.ports';
import { GetShelfQuery } from './get-shelf.query';

@QueryHandler(GetShelfQuery)
export class GetShelfHandler implements IQueryHandler<GetShelfQuery, ShelfDetail> {
  constructor(@Inject(SHELF_REPO) private readonly repo: IShelfRepo) {}

  async execute(q: GetShelfQuery): Promise<ShelfDetail> {
    const shelf = await this.repo.findById(q.userId, q.id);
    if (!shelf) throw new ShelfNotFoundError(q.id);
    return shelf;
  }
}
