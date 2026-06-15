import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TokenNotFoundError } from '../../domain/tokens.errors';
import { PAT_REPO, type PatRepo } from '../../domain/tokens.ports';
import { RevokeTokenCommand } from './revoke-token.command';

@CommandHandler(RevokeTokenCommand)
export class RevokeTokenHandler implements ICommandHandler<RevokeTokenCommand, void> {
  constructor(@Inject(PAT_REPO) private readonly repo: PatRepo) {}

  async execute(cmd: RevokeTokenCommand): Promise<void> {
    const found = await this.repo.revoke(cmd.userId, cmd.id);
    if (!found) throw new TokenNotFoundError(cmd.id);
  }
}
