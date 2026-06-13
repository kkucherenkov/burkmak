import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventsService } from '../../../events/events.service';
import { ItemNotFoundError } from '../../domain/items.errors';
import { ITEM_REPO, type IItemRepo } from '../../domain/items.ports';
import { UpdateItemCommand } from './update-item.command';

@CommandHandler(UpdateItemCommand)
export class UpdateItemHandler implements ICommandHandler<UpdateItemCommand, void> {
  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    private readonly events: EventsService,
  ) {}

  async execute(cmd: UpdateItemCommand): Promise<void> {
    const ok = await this.repo.update(cmd.userId, cmd.id, cmd.patch);
    if (!ok) throw new ItemNotFoundError(cmd.id);
    this.events.publish(cmd.userId, 'item.updated', { id: cmd.id });
  }
}
