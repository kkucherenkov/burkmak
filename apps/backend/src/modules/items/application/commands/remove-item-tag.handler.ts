import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventsService } from '../../../events/events.service';
import { ItemNotFoundError } from '../../domain/items.errors';
import { ITEM_REPO, type IItemRepo } from '../../domain/items.ports';
import { RemoveItemTagCommand } from './remove-item-tag.command';

@CommandHandler(RemoveItemTagCommand)
export class RemoveItemTagHandler implements ICommandHandler<RemoveItemTagCommand, void> {
  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    private readonly events: EventsService,
  ) {}

  async execute(cmd: RemoveItemTagCommand): Promise<void> {
    const ok = await this.repo.removeTag(cmd.userId, cmd.itemId, cmd.tagSlug);
    if (!ok) throw new ItemNotFoundError(cmd.itemId);
    this.events.publish(cmd.userId, 'item.updated', { id: cmd.itemId });
  }
}
