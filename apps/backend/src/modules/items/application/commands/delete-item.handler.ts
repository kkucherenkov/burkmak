import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventsService } from '../../../events/events.service';
import { ItemNotFoundError } from '../../domain/items.errors';
import { ITEM_REPO, type IItemRepo } from '../../domain/items.ports';
import { DeleteItemCommand } from './delete-item.command';

@CommandHandler(DeleteItemCommand)
export class DeleteItemHandler implements ICommandHandler<DeleteItemCommand, void> {
  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    private readonly events: EventsService,
  ) {}

  async execute(cmd: DeleteItemCommand): Promise<void> {
    const ok = await this.repo.delete(cmd.userId, cmd.id);
    if (!ok) throw new ItemNotFoundError(cmd.id);
    this.events.publish(cmd.userId, 'item.deleted', { id: cmd.id });
  }
}
