import { randomBytes, randomUUID } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';

import {
  All,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { AppConfig } from '../../../common/config/app-config';
import { ITEM_REPO, type IItemRepo } from '../../items/domain/items.ports';
import { BuildEpubService } from '../application/build-epub.service';
import { EpubCache } from '../infra/epub.cache';
import {
  buildBookMetadata,
  type BookMetadata,
  type ReadingStatePayload,
} from './entitlement.builder';
import { buildResources, type InitializationResources } from './initialization.resources';
import { KoboReadingStateService, type PutStateResponse } from './kobo-reading-state.service';
import {
  buildDownloadUrl,
  epubSizeBytes,
  KoboSyncService,
  type SyncResult,
} from './kobo-sync.service';
import { KoboSyncRepo } from './kobo-sync.repo';
import { KoboTokenGuard, type KoboRequest } from './kobo-token.guard';

/** Map of known raster MIME types by extension (mirrors items.controller's image route). */
const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

const DOWNLOAD_SUFFIX = '.kepub.epub';

interface DeviceAuthResponse {
  AccessToken: string;
  RefreshToken: string;
  TokenType: 'Bearer';
  TrackingId: string;
  UserKey: string;
}

function randomDeviceToken(): string {
  return randomBytes(24).toString('base64');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Kobo store-API emulation. Auth is a PAT embedded in the URL path (Nickel
 * cannot send custom auth headers) — see `KoboTokenGuard`. This mount is a
 * device wire protocol, not part of the JSON API contract: it is excluded
 * from `express-openapi-validator` (see `ignorePaths`) and has no DTOs.
 *
 * Route order matters — the catch-all (`{*rest}`) must stay last so it
 * doesn't shadow the specific routes above it.
 */
@Controller({ path: 'kobo/:token', version: '1' })
@UseGuards(KoboTokenGuard)
export class KoboStoreController {
  constructor(
    private readonly config: AppConfig,
    private readonly repo: KoboSyncRepo,
    private readonly syncService: KoboSyncService,
    private readonly readingStateService: KoboReadingStateService,
    private readonly buildEpubService: BuildEpubService,
    private readonly epubCache: EpubCache,
    @Inject(ITEM_REPO) private readonly itemRepo: IItemRepo,
  ) {}

  private mountBase(token: string): string {
    return `${this.config.publicApiBaseUrl}/kobo/${token}`;
  }

  /** POST v1/auth/device, v1/auth/refresh — stub tokens; no store proxy, no real device registry. */
  @Post(['v1/auth/device', 'v1/auth/refresh'])
  authDevice(@Body() body: unknown): DeviceAuthResponse {
    const userKey = isRecord(body) && typeof body['UserKey'] === 'string' ? body['UserKey'] : '';
    return {
      AccessToken: randomDeviceToken(),
      RefreshToken: randomDeviceToken(),
      TokenType: 'Bearer',
      TrackingId: randomUUID(),
      UserKey: userKey,
    };
  }

  /** GET v1/initialization — Resources map rewritten to this mount. */
  @Get('v1/initialization')
  initialization(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): InitializationResources {
    res.setHeader('x-kobo-apitoken', 'e30=');
    return buildResources(this.mountBase(token));
  }

  /** GET v1/library/sync — delta sync; token/continuation carried in response headers. */
  @Get('v1/library/sync')
  async librarySync(
    @Req() req: KoboRequest,
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown[]> {
    const tokenHeader = req.header('x-kobo-synctoken');
    const result: SyncResult = await this.syncService.sync(
      req.userId,
      tokenHeader,
      this.mountBase(token),
    );

    res.setHeader('x-kobo-synctoken', result.syncToken);
    if (result.continue) {
      res.setHeader('x-kobo-sync', 'continue');
    }
    return result.body;
  }

  /** GET v1/library/:uuid/metadata — [BookMetadata] for one entitlement. */
  @Get('v1/library/:uuid/metadata')
  async getMetadata(
    @Req() req: KoboRequest,
    @Param('uuid') uuid: string,
    @Param('token') token: string,
  ): Promise<BookMetadata[]> {
    const entitlement = await this.repo.findEntitlementByUuid(req.userId, uuid);
    if (!entitlement?.item) {
      throw new NotFoundException();
    }

    const metadata = buildBookMetadata({
      uuid: entitlement.uuid,
      title: entitlement.item.title ?? 'Untitled',
      publicationDate: entitlement.item.savedAt.toISOString(),
      excerpt: entitlement.item.excerpt,
      siteName: entitlement.item.siteName,
      downloadUrl: buildDownloadUrl(this.mountBase(token), entitlement.uuid),
      sizeBytes: epubSizeBytes(this.epubCache, entitlement.item.id, entitlement.articleExtractedAt),
    });
    return [metadata];
  }

  /** GET v1/library/:uuid/state */
  @Get('v1/library/:uuid/state')
  getState(@Req() req: KoboRequest, @Param('uuid') uuid: string): Promise<ReadingStatePayload[]> {
    return this.readingStateService.getState(req.userId, uuid);
  }

  /** PUT v1/library/:uuid/state */
  @Put('v1/library/:uuid/state')
  putState(
    @Req() req: KoboRequest,
    @Param('uuid') uuid: string,
    @Body() body: unknown,
  ): Promise<PutStateResponse> {
    return this.readingStateService.putState(req.userId, uuid, body);
  }

  /** DELETE v1/library/:uuid — device-initiated removal; archives the item, doesn't delete it. */
  @Delete('v1/library/:uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEntitlement(@Req() req: KoboRequest, @Param('uuid') uuid: string): Promise<void> {
    const entitlement = await this.repo.findEntitlementByUuid(req.userId, uuid);
    if (entitlement?.itemId == null) {
      throw new NotFoundException();
    }
    await this.itemRepo.update(req.userId, entitlement.itemId, { readState: 'archived' });
  }

  /** GET v1/download/:filename — stream the KEPUB (filename is `<entitlement-uuid>.kepub.epub`). */
  @Get('v1/download/:filename')
  async download(
    @Req() req: KoboRequest,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!filename.endsWith(DOWNLOAD_SUFFIX)) {
      throw new NotFoundException();
    }
    const uuid = filename.slice(0, -DOWNLOAD_SUFFIX.length);

    const entitlement = await this.repo.findEntitlementByUuid(req.userId, uuid);
    if (entitlement?.itemId == null) {
      throw new NotFoundException();
    }

    const result = await this.buildEpubService.getEpub(req.userId, entitlement.itemId, 'kepub');
    if ('error' in result) {
      if (result.error === 'not_found') throw new NotFoundException();
      throw new ConflictException('Article not ready for packaging');
    }

    res.setHeader('Content-Type', 'application/epub+zip');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    createReadStream(result.path).pipe(res);
  }

  /** GET :imageId/:width/:height/:grey/image.jpg — cover, size params ignored. */
  @Get(':imageId/:width/:height/:grey/image.jpg')
  async getCoverImage(
    @Req() req: KoboRequest,
    @Param('imageId') imageId: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.streamCover(req.userId, imageId, res);
  }

  /** GET :imageId/:width/:height/:quality/:grey/image.jpg — cover with quality param, still ignored. */
  @Get(':imageId/:width/:height/:quality/:grey/image.jpg')
  async getCoverImageWithQuality(
    @Req() req: KoboRequest,
    @Param('imageId') imageId: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.streamCover(req.userId, imageId, res);
  }

  private async streamCover(userId: string, imageId: string, res: Response): Promise<void> {
    const entitlement = await this.repo.findEntitlementByUuid(userId, imageId);
    if (entitlement?.itemId == null || entitlement.coverImageKey == null) {
      throw new NotFoundException();
    }

    // Defense-in-depth containment check (mirrors items.controller's image route) even though
    // coverImageKey is server-controlled (validated by the image cache when it was written).
    const imageDir = path.resolve(this.config.dataDir, 'images', entitlement.itemId);
    const filePath = path.resolve(imageDir, entitlement.coverImageKey);
    if (!filePath.startsWith(imageDir + path.sep) && filePath !== imageDir) {
      throw new NotFoundException();
    }
    if (!existsSync(filePath)) {
      throw new NotFoundException();
    }

    const ext = entitlement.coverImageKey.split('.').at(-1) ?? '';
    const contentType = EXT_TO_MIME[ext] ?? 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    createReadStream(filePath).pipe(res);
  }

  /** Anything else under the mount (unproxied store endpoints) — Calibre-Web's dummy-response mode. */
  @All('{*rest}')
  catchAll(): Record<string, never> {
    return {};
  }
}
