import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JobsService } from '../../../../common/jobs/jobs.service';
import { EventsService } from '../../../events/events.service';
import { ItemNotFoundError } from '../../domain/items.errors';
import { ITEM_REPO, type IItemRepo } from '../../domain/items.ports';
import { ExtractItemCommand } from './extract-item.command';

@CommandHandler(ExtractItemCommand)
export class ExtractItemHandler implements ICommandHandler<
  ExtractItemCommand,
  { extractStatus: string }
> {
  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    private readonly jobs: JobsService,
    private readonly events: EventsService,
  ) {}

  async execute(cmd: ExtractItemCommand): Promise<{ extractStatus: string }> {
    // Ownership-checked update; throws 404 if item does not exist / not owned
    const ok = await this.repo.applyExtractStatus(cmd.userId, cmd.itemId, 'extracting');
    if (!ok) throw new ItemNotFoundError(cmd.itemId);

    await this.jobs.enqueue('extract_article', { userId: cmd.userId, itemId: cmd.itemId });
    this.events.publish(cmd.userId, 'item.updated', { id: cmd.itemId });

    return { extractStatus: 'extracting' };
  }
}
