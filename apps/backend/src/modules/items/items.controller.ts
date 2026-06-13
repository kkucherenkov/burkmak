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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { AddItemTagCommand } from './application/commands/add-item-tag.command';
import { DeleteItemCommand } from './application/commands/delete-item.command';
import { RemoveItemTagCommand } from './application/commands/remove-item-tag.command';
import { SaveItemCommand } from './application/commands/save-item.command';
import { UpdateItemCommand } from './application/commands/update-item.command';
import { AddTagDto } from './application/dto/add-tag.dto';
import { ListItemsDto } from './application/dto/list-items.dto';
import { SaveItemDto } from './application/dto/save-item.dto';
import { UpdateItemDto } from './application/dto/update-item.dto';
import { GetItemQuery } from './application/queries/get-item.query';
import { ListItemsQuery } from './application/queries/list-items.query';
import type { ItemDetail } from './domain/items.ports';

@Controller({ path: 'items', version: '1' })
@UseGuards(SessionGuard)
export class ItemsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** POST /api/v1/items */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async save(@Req() req: AuthenticatedRequest, @Body() dto: SaveItemDto): Promise<ItemDetail> {
    const created: { id: string } = await this.commandBus.execute(
      new SaveItemCommand(req.userId, dto.url, dto.tags ?? []),
    );
    return this.queryBus.execute(new GetItemQuery(req.userId, created.id));
  }

  /** GET /api/v1/items */
  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Query() dto: ListItemsDto,
  ): Promise<{ items: ItemDetail[]; nextCursor: string | null }> {
    const limit = Math.min(Math.max(Number(dto.limit ?? '20') || 20, 1), 100);
    return this.queryBus.execute(
      new ListItemsQuery({
        userId: req.userId,
        limit,
        ...(dto.readState !== undefined && { readState: dto.readState }),
        ...(dto.tag !== undefined && { tag: dto.tag }),
        ...(dto.favorite !== undefined && { favorite: dto.favorite === 'true' }),
        ...(dto.q !== undefined && { q: dto.q }),
        ...(dto.cursor !== undefined && { cursor: dto.cursor }),
      }),
    );
  }

  /** GET /api/v1/items/:id */
  @Get(':id')
  get(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<ItemDetail> {
    return this.queryBus.execute(new GetItemQuery(req.userId, id));
  }

  /** PATCH /api/v1/items/:id */
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ): Promise<ItemDetail> {
    await this.commandBus.execute(new UpdateItemCommand(req.userId, id, dto));
    return this.queryBus.execute(new GetItemQuery(req.userId, id));
  }

  /** DELETE /api/v1/items/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteItemCommand(req.userId, id));
  }

  /** POST /api/v1/items/:id/tags */
  @Post(':id/tags')
  async addTag(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AddTagDto,
  ): Promise<ItemDetail> {
    await this.commandBus.execute(new AddItemTagCommand(req.userId, id, dto.tag));
    return this.queryBus.execute(new GetItemQuery(req.userId, id));
  }

  /** DELETE /api/v1/items/:id/tags/:tagSlug */
  @Delete(':id/tags/:tagSlug')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTag(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('tagSlug') tagSlug: string,
  ): Promise<void> {
    await this.commandBus.execute(new RemoveItemTagCommand(req.userId, id, tagSlug));
  }
}
