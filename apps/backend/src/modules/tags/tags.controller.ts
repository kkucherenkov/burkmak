import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IsString, Length } from 'class-validator';

import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { DeleteTagCommand } from './application/commands/delete-tag.command';
import { RenameTagCommand } from './application/commands/rename-tag.command';
import { ListTagsQuery } from './application/queries/list-tags.query';
import type { TagSummary } from './domain/tags.ports';

class RenameTagDto {
  @IsString()
  @Length(1, 40)
  name!: string;
}

@Controller({ path: 'tags', version: '1' })
@UseGuards(SessionGuard)
export class TagsController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Get()
  list(@Req() req: AuthenticatedRequest): Promise<{ tags: TagSummary[] }> {
    return this.queries.execute(new ListTagsQuery(req.userId));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rename(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: RenameTagDto,
  ): Promise<void> {
    await this.commands.execute(new RenameTagCommand(req.userId, id, dto.name));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.commands.execute(new DeleteTagCommand(req.userId, id));
  }
}
