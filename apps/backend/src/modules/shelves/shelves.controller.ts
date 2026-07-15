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
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { AddShelfItemCommand } from './application/commands/add-shelf-item.command';
import { CreateShelfCommand } from './application/commands/create-shelf.command';
import { DeleteShelfCommand } from './application/commands/delete-shelf.command';
import { RemoveShelfItemCommand } from './application/commands/remove-shelf-item.command';
import { RenameShelfCommand } from './application/commands/rename-shelf.command';
import { CreateShelfDto } from './application/dto/create-shelf.dto';
import { RenameShelfDto } from './application/dto/rename-shelf.dto';
import { GetShelfQuery } from './application/queries/get-shelf.query';
import { ListShelvesQuery } from './application/queries/list-shelves.query';
import type { ShelfDetail } from './domain/shelves.ports';

@Controller({ path: 'shelves', version: '1' })
@UseGuards(SessionGuard)
export class ShelvesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** GET /api/v1/shelves */
  @Get()
  list(@Req() req: AuthenticatedRequest): Promise<{ shelves: ShelfDetail[] }> {
    return this.queryBus.execute(new ListShelvesQuery(req.userId));
  }

  /** POST /api/v1/shelves */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateShelfDto,
  ): Promise<ShelfDetail> {
    const created: { id: string } = await this.commandBus.execute(
      new CreateShelfCommand(req.userId, dto.name),
    );
    return this.queryBus.execute(new GetShelfQuery(req.userId, created.id));
  }

  /** PATCH /api/v1/shelves/:id */
  @Patch(':id')
  async rename(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: RenameShelfDto,
  ): Promise<ShelfDetail> {
    await this.commandBus.execute(new RenameShelfCommand(req.userId, id, dto.name));
    return this.queryBus.execute(new GetShelfQuery(req.userId, id));
  }

  /** DELETE /api/v1/shelves/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteShelfCommand(req.userId, id));
  }

  /** PUT /api/v1/shelves/:id/items/:itemId — idempotent */
  @Put(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addItem(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    await this.commandBus.execute(new AddShelfItemCommand(req.userId, id, itemId));
  }

  /** DELETE /api/v1/shelves/:id/items/:itemId */
  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    await this.commandBus.execute(new RemoveShelfItemCommand(req.userId, id, itemId));
  }
}
