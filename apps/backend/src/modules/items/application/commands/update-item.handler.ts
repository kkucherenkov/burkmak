import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JobsService } from '../../../../common/jobs/jobs.service';
import { EventsService } from '../../../events/events.service';
import { ItemNotFoundError } from '../../domain/items.errors';
import { ITEM_REPO, type IItemRepo } from '../../domain/items.ports';
import { UpdateItemCommand } from './update-item.command';

@CommandHandler(UpdateItemCommand)
export class UpdateItemHandler implements ICommandHandler<UpdateItemCommand, void> {
  private readonly logger = new Logger(UpdateItemHandler.name);

  constructor(
    @Inject(ITEM_REPO) private readonly repo: IItemRepo,
    private readonly events: EventsService,
    private readonly jobs: JobsService,
  ) {}

  async execute(cmd: UpdateItemCommand): Promise<void> {
    // A promotion needs the BEFORE state to decide whether to extract; every
    // other patch skips the read.
    const before =
      cmd.patch.kind === 'article' ? await this.repo.findById(cmd.userId, cmd.id) : null;

    const ok = await this.repo.update(cmd.userId, cmd.id, cmd.patch);
    if (!ok) throw new ItemNotFoundError(cmd.id);

    // Promoting a bookmark → article: it skipped the fetch_metadata auto-extract
    // chain at save time (kind gate), so it is still at extractStatus 'none' and
    // nothing else would ever extract it — the backfill bootstrap is marker-guarded
    // and the chain only fires from fetch_metadata. Without this the item would sit
    // in the reading queue permanently unreadable.
    // The `none` guard keeps repeated promotions idempotent.
    if (before?.kind === 'bookmark' && before.extractStatus === 'none') {
      await this.enqueueExtraction(cmd.userId, cmd.id);
    }

    this.events.publish(cmd.userId, 'item.updated', { id: cmd.id });
  }

  /** Mirrors the fetch_metadata → extract_article chain, including its best-effort revert. */
  private async enqueueExtraction(userId: string, itemId: string): Promise<void> {
    try {
      await this.repo.setExtractStatus(itemId, 'extracting');
      await this.jobs.enqueue('extract_article', { userId, itemId });
    } catch (chainError) {
      // The kind change already committed — a chain failure must not fail the
      // PATCH. Best-effort revert so the UI shows no perpetual spinner and the
      // manual extract button can re-trigger cleanly.
      await this.repo.setExtractStatus(itemId, 'none').catch((revertError: unknown) => {
        this.logger.warn(`failed to revert extractStatus for item ${itemId}`, revertError);
      });
      this.logger.warn(`promotion extract chain failed for item ${itemId}`, chainError);
    }
  }
}
