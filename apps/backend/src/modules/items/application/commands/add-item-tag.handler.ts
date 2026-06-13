import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventsService } from '../../../events/events.service';
import { ItemNotFoundError } from '../../domain/items.errors';
import { ITEM_REPO, type IItemRepo } from '../../domain/items.ports';
import { AddItemTagCommand } from './add-item-tag.command';

@CommandHandler(AddItemTagCommand)
export class AddItemTagHandler implements ICommandHandler<AddItemTagCommand, void> {
  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    private readonly events: EventsService,
  ) {}

  async execute(cmd: AddItemTagCommand): Promise<void> {
    const ok = await this.repo.addTag(cmd.userId, cmd.itemId, cmd.tag);
    if (!ok) throw new ItemNotFoundError(cmd.itemId);
    this.events.publish(cmd.userId, 'item.updated', { id: cmd.itemId });
  }
}
