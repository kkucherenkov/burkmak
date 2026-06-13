import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JobsService } from '../../../../common/jobs/jobs.service';
import { EventsService } from '../../../events/events.service';
import { ITEM_REPO, type IItemRepo } from '../../domain/items.ports';
import { SaveItemCommand } from './save-item.command';

@CommandHandler(SaveItemCommand)
export class SaveItemHandler implements ICommandHandler<SaveItemCommand, { id: string }> {
  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    private readonly jobs: JobsService,
    private readonly events: EventsService,
  ) {}

  async execute(cmd: SaveItemCommand): Promise<{ id: string }> {
    const id = await this.repo.create({ userId: cmd.userId, url: cmd.url });
    await this.jobs.enqueue('fetch_metadata', { userId: cmd.userId, itemId: id });
    this.events.publish(cmd.userId, 'item.created', { id });
    return { id };
  }
}
