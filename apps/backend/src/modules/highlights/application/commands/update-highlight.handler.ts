import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  HIGHLIGHT_REPO,
  type IHighlightRepo,
  type HighlightDetail,
} from '../../domain/highlights.ports';
import { UpdateHighlightCommand } from './update-highlight.command';

@CommandHandler(UpdateHighlightCommand)
export class UpdateHighlightHandler implements ICommandHandler<
  UpdateHighlightCommand,
  HighlightDetail
> {
  constructor(@Inject(HIGHLIGHT_REPO) private readonly repo: IHighlightRepo) {}

  async execute(cmd: UpdateHighlightCommand): Promise<HighlightDetail> {
    const input: Record<string, unknown> = {};
    if (cmd.note !== undefined) input['note'] = cmd.note;
    if (cmd.color !== undefined) input['color'] = cmd.color;
    return this.repo.update(cmd.userId, cmd.id, input);
  }
}
