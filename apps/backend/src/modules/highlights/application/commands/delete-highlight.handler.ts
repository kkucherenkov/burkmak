import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { HIGHLIGHT_REPO, type IHighlightRepo } from '../../domain/highlights.ports';
import { DeleteHighlightCommand } from './delete-highlight.command';

@CommandHandler(DeleteHighlightCommand)
export class DeleteHighlightHandler implements ICommandHandler<DeleteHighlightCommand, void> {
  constructor(@Inject(HIGHLIGHT_REPO) private readonly repo: IHighlightRepo) {}

  async execute(cmd: DeleteHighlightCommand): Promise<void> {
    await this.repo.remove(cmd.userId, cmd.id);
  }
}
