import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TagNotFoundError } from '../../domain/tags.errors';
import { TAG_REPO, type ITagRepo } from '../../domain/tags.ports';
import { DeleteTagCommand } from './delete-tag.command';

@CommandHandler(DeleteTagCommand)
export class DeleteTagHandler implements ICommandHandler<DeleteTagCommand, void> {
  constructor(@Inject(TAG_REPO) private readonly repo: ITagRepo) {}

  async execute(cmd: DeleteTagCommand): Promise<void> {
    if (!(await this.repo.remove(cmd.userId, cmd.id))) throw new TagNotFoundError(cmd.id);
  }
}
