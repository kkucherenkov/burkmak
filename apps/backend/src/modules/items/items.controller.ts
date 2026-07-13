import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';

import { AppConfig } from '../../common/config/app-config';
import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { assertSafeItemId } from '../../common/security/safe-id';
import { AddItemTagCommand } from './application/commands/add-item-tag.command';
import { DeleteItemCommand } from './application/commands/delete-item.command';
import { ExtractItemCommand } from './application/commands/extract-item.command';
import { RemoveItemTagCommand } from './application/commands/remove-item-tag.command';
import { SaveItemCommand } from './application/commands/save-item.command';
import { UpdateItemCommand } from './application/commands/update-item.command';
import { AddTagDto } from './application/dto/add-tag.dto';
import { ListItemsDto } from './application/dto/list-items.dto';
import { SaveItemDto } from './application/dto/save-item.dto';
import { UpdateItemDto } from './application/dto/update-item.dto';
import { GetArticleQuery } from './application/queries/get-article.query';
import { GetItemQuery } from './application/queries/get-item.query';
import { ListItemsQuery } from './application/queries/list-items.query';
import type { ItemArticle } from './domain/article.ports';
import type { ItemDetail } from './domain/items.ports';
import { ITEM_REPO, type IItemRepo } from './domain/items.ports';

/** Strict allowlist: sha1 hex (40 chars) + dot + known raster extension. */
const IMAGE_KEY_RE = /^[a-f0-9]{40}\.[a-z0-9]{2,5}$/;

/** Map of known raster MIME types by extension (must mirror LocalImageCache allowlist). */
const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

@Controller({ path: 'items', version: '1' })
@UseGuards(SessionGuard)
export class ItemsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly config: AppConfig,
    @Inject(ITEM_REPO) private readonly itemRepo: IItemRepo,
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

  /** POST /api/v1/items/:id/extract — trigger article extraction (idempotent, 202) */
  @Post(':id/extract')
  @HttpCode(HttpStatus.ACCEPTED)
  async extract(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ extractStatus: string }> {
    return this.commandBus.execute(new ExtractItemCommand(req.userId, id));
  }

  /** GET /api/v1/items/:id/article — fetch extracted article */
  @Get(':id/article')
  getArticle(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<ItemArticle> {
    return this.queryBus.execute(new GetArticleQuery(req.userId, id));
  }

  /** GET /api/v1/items/:id/image/:key — stream cached image */
  @Get(':id/image/:key')
  async getImage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('key') key: string,
    @Res() res: Response,
  ): Promise<void> {
    // 1. Validate both path segments before they touch the filesystem: the id
    //    must be a cuid (the ownership check below can't sanitize the path —
    //    a traversal id would move `imageDir` itself outside the data dir),
    //    the key sha1 hex + dot + known raster extension.
    assertSafeItemId(id);
    if (!IMAGE_KEY_RE.test(key)) {
      throw new NotFoundException();
    }

    // 2. Verify ownership — don't leak existence to non-owners.
    const item = await this.itemRepo.findById(req.userId, id);
    if (!item) {
      throw new NotFoundException();
    }

    // 3. Resolve absolute path and confirm it stays inside the images ROOT.
    //    The comparison base must be untainted: a per-item dir built from the
    //    id would itself move under a traversal id, making the check
    //    self-referential (defense-in-depth on top of the id/key validation).
    const imagesRoot = path.resolve(this.config.dataDir, 'images');
    const filePath = path.resolve(imagesRoot, id, key);
    if (!filePath.startsWith(imagesRoot + path.sep)) {
      throw new NotFoundException();
    }

    // 4. File must exist.
    if (!existsSync(filePath)) {
      throw new NotFoundException();
    }

    // 5. Determine content-type from extension (only known raster types allowed by the image cache).
    const ext = key.split('.').at(-1) ?? '';
    const contentType = EXT_TO_MIME[ext] ?? 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    createReadStream(filePath).pipe(res);
  }
}
