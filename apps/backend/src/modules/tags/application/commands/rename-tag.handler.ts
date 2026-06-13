import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TagNotFoundError } from '../../domain/tags.errors';
import { TAG_REPO, type ITagRepo } from '../../domain/tags.ports';
import { RenameTagCommand } from './rename-tag.command';

@CommandHandler(RenameTagCommand)
export class RenameTagHandler implements ICommandHandler<RenameTagCommand, void> {
  constructor(@Inject(TAG_REPO) private readonly repo: ITagRepo) {}

  async execute(cmd: RenameTagCommand): Promise<void> {
    if (!(await this.repo.rename(cmd.userId, cmd.id, cmd.name))) throw new TagNotFoundError(cmd.id);
  }
}
