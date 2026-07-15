import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ShelfNotFoundError } from '../../domain/shelves.errors';
import { SHELF_REPO, type IShelfRepo } from '../../domain/shelves.ports';
import { RenameShelfCommand } from './rename-shelf.command';

@CommandHandler(RenameShelfCommand)
export class RenameShelfHandler implements ICommandHandler<RenameShelfCommand, void> {
  constructor(@Inject(SHELF_REPO) private readonly repo: IShelfRepo) {}

  async execute(cmd: RenameShelfCommand): Promise<void> {
    const ok = await this.repo.rename(cmd.userId, cmd.id, cmd.name);
    if (!ok) throw new ShelfNotFoundError(cmd.id);
  }
}
