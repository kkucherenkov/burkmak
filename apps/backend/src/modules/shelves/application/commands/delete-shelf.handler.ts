import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ShelfNotFoundError } from '../../domain/shelves.errors';
import { SHELF_REPO, type IShelfRepo } from '../../domain/shelves.ports';
import { DeleteShelfCommand } from './delete-shelf.command';

@CommandHandler(DeleteShelfCommand)
export class DeleteShelfHandler implements ICommandHandler<DeleteShelfCommand, void> {
  constructor(@Inject(SHELF_REPO) private readonly repo: IShelfRepo) {}

  async execute(cmd: DeleteShelfCommand): Promise<void> {
    const ok = await this.repo.delete(cmd.userId, cmd.id);
    if (!ok) throw new ShelfNotFoundError(cmd.id);
  }
}
