import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { CreateHighlightCommand } from './application/commands/create-highlight.command';
import { DeleteHighlightCommand } from './application/commands/delete-highlight.command';
import { UpdateHighlightCommand } from './application/commands/update-highlight.command';
import { CreateHighlightDto } from './application/dto/create-highlight.dto';
import { UpdateHighlightDto } from './application/dto/update-highlight.dto';
import { ListHighlightsQuery } from './application/queries/list-highlights.query';
import type { HighlightDetail } from './domain/highlights.ports';

/** Handles routes nested under /items/:id/highlights */
@Controller({ path: 'items', version: '1' })
@UseGuards(SessionGuard)
export class ItemHighlightsController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  /** GET /api/v1/items/:id/highlights */
  @Get(':id/highlights')
  list(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ highlights: HighlightDetail[] }> {
    return this.queries.execute(new ListHighlightsQuery(req.userId, id));
  }

  /** POST /api/v1/items/:id/highlights */
  @Post(':id/highlights')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateHighlightDto,
  ): Promise<HighlightDetail> {
    return this.commands.execute(
      new CreateHighlightCommand(
        req.userId,
        id,
        dto.quote,
        dto.prefix ?? '',
        dto.suffix ?? '',
        dto.note,
        dto.color,
      ),
    );
  }
}

/** Handles routes directly under /highlights/:id */
@Controller({ path: 'highlights', version: '1' })
@UseGuards(SessionGuard)
export class HighlightsController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  /** PATCH /api/v1/highlights/:id */
  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateHighlightDto,
  ): Promise<HighlightDetail> {
    return this.commands.execute(new UpdateHighlightCommand(req.userId, id, dto.note, dto.color));
  }

  /** DELETE /api/v1/highlights/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.commands.execute(new DeleteHighlightCommand(req.userId, id));
  }
}
