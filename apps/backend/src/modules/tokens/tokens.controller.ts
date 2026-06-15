import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { CreateTokenCommand } from './application/commands/create-token.command';
import { RevokeTokenCommand } from './application/commands/revoke-token.command';
import { CreateTokenDto } from './application/dto/create-token.dto';
import { ListTokensQuery } from './application/queries/list-tokens.query';
import type { PatRecord } from './domain/tokens.ports';
import type { CreatedTokenResult } from './application/commands/create-token.handler';

@Controller({ path: 'tokens', version: '1' })
@UseGuards(SessionGuard)
export class TokensController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  /** POST /api/v1/tokens */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTokenDto,
  ): Promise<CreatedTokenResult> {
    return this.commands.execute(new CreateTokenCommand(req.userId, dto.name));
  }

  /** GET /api/v1/tokens */
  @Get()
  list(@Req() req: AuthenticatedRequest): Promise<{ tokens: PatRecord[] }> {
    return this.queries.execute(new ListTokensQuery(req.userId));
  }

  /** DELETE /api/v1/tokens/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.commands.execute(new RevokeTokenCommand(req.userId, id));
  }
}
