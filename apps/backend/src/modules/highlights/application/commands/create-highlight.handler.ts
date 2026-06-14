import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  HIGHLIGHT_REPO,
  type IHighlightRepo,
  type HighlightDetail,
} from '../../domain/highlights.ports';
import { CreateHighlightCommand } from './create-highlight.command';

@CommandHandler(CreateHighlightCommand)
export class CreateHighlightHandler implements ICommandHandler<
  CreateHighlightCommand,
  HighlightDetail
> {
  constructor(@Inject(HIGHLIGHT_REPO) private readonly repo: IHighlightRepo) {}

  async execute(cmd: CreateHighlightCommand): Promise<HighlightDetail> {
    return this.repo.create(cmd.userId, cmd.itemId, {
      quote: cmd.quote,
      prefix: cmd.prefix,
      suffix: cmd.suffix,
      ...(cmd.note !== undefined && { note: cmd.note }),
      ...(cmd.color !== undefined && { color: cmd.color }),
    });
  }
}
