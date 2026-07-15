import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ShelfNotFoundError } from '../../domain/shelves.errors';
import { SHELF_REPO, type IShelfRepo } from '../../domain/shelves.ports';
import { RemoveShelfItemCommand } from './remove-shelf-item.command';

@CommandHandler(RemoveShelfItemCommand)
export class RemoveShelfItemHandler implements ICommandHandler<RemoveShelfItemCommand, void> {
  constructor(@Inject(SHELF_REPO) private readonly repo: IShelfRepo) {}

  async execute(cmd: RemoveShelfItemCommand): Promise<void> {
    const ok = await this.repo.removeItem(cmd.userId, cmd.shelfId, cmd.itemId);
    if (!ok) throw new ShelfNotFoundError(cmd.shelfId);
  }
}
