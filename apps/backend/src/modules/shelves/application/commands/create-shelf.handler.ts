import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SHELF_REPO, type IShelfRepo } from '../../domain/shelves.ports';
import { CreateShelfCommand } from './create-shelf.command';

@CommandHandler(CreateShelfCommand)
export class CreateShelfHandler implements ICommandHandler<CreateShelfCommand, { id: string }> {
  constructor(@Inject(SHELF_REPO) private readonly repo: IShelfRepo) {}

  async execute(cmd: CreateShelfCommand): Promise<{ id: string }> {
    // A duplicate name raises ShelfNameConflictError from the repo; the exception
    // filter renders it as a 409 without any mapping here.
    const id = await this.repo.create(cmd.userId, cmd.name);
    return { id };
  }
}
