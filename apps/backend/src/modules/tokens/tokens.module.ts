import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CreateTokenHandler } from './application/commands/create-token.handler';
import { RevokeTokenHandler } from './application/commands/revoke-token.handler';
import { ListTokensHandler } from './application/queries/list-tokens.handler';
import { PAT_REPO } from './domain/tokens.ports';
import { PrismaTokensRepo } from './infra/prisma-tokens.repo';
import { TokensController } from './tokens.controller';

@Module({
  imports: [CqrsModule],
  controllers: [TokensController],
  providers: [
    CreateTokenHandler,
    RevokeTokenHandler,
    ListTokensHandler,
    { provide: PAT_REPO, useClass: PrismaTokensRepo },
  ],
  exports: [PAT_REPO],
})
export class TokensModule {}
