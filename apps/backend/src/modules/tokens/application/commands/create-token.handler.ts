import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { generateToken } from '../../infra/pat.crypto';
import { PAT_REPO, type PatRepo, type PatRecord } from '../../domain/tokens.ports';
import { CreateTokenCommand } from './create-token.command';

export interface CreatedTokenResult extends PatRecord {
  token: string; // plaintext secret — returned ONCE, never stored
}

@CommandHandler(CreateTokenCommand)
export class CreateTokenHandler implements ICommandHandler<CreateTokenCommand, CreatedTokenResult> {
  constructor(@Inject(PAT_REPO) private readonly repo: PatRepo) {}

  async execute(cmd: CreateTokenCommand): Promise<CreatedTokenResult> {
    const { secret, hash, prefix } = generateToken();
    const rec = await this.repo.create({
      userId: cmd.userId,
      name: cmd.name,
      tokenHash: hash,
      prefix,
    });
    return { ...rec, token: secret };
  }
}
