import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ShelfNotFoundError } from '../../domain/shelves.errors';
import { SHELF_REPO, type IShelfRepo } from '../../domain/shelves.ports';
import { AddShelfItemCommand } from './add-shelf-item.command';

@CommandHandler(AddShelfItemCommand)
export class AddShelfItemHandler implements ICommandHandler<AddShelfItemCommand, void> {
  constructor(@Inject(SHELF_REPO) private readonly repo: IShelfRepo) {}

  async execute(cmd: AddShelfItemCommand): Promise<void> {
    const ok = await this.repo.addItem(cmd.userId, cmd.shelfId, cmd.itemId);
    if (!ok) throw new ShelfNotFoundError(cmd.shelfId);
  }
}
