import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';

import { SessionGuard, type AuthenticatedRequest } from '../../common/auth/auth.guard';
import { ExportMarkdownDto } from './application/dto/export-markdown.dto';
import { ExportItemMarkdownQuery } from './application/queries/export-item-markdown.query';
import { ExportMarkdownQuery } from './application/queries/export-markdown.query';
import type { ExportedNote } from './application/queries/export-markdown.handler';

/**
 * Export endpoints — all under /api/v1/.
 *
 * Routes:
 *   GET /api/v1/export/markdown           → bundle of all user notes (JSON)
 *   GET /api/v1/items/:id/export/markdown → single item note (text/markdown)
 */
@Controller({ version: '1' })
@UseGuards(SessionGuard)
export class ExportController {
  constructor(private readonly queryBus: QueryBus) {}

  /** GET /api/v1/export/markdown */
  @Get('export/markdown')
  async exportBundle(
    @Req() req: AuthenticatedRequest,
    @Query() dto: ExportMarkdownDto,
  ): Promise<{ notes: ExportedNote[] }> {
    const includeEmpty = dto.includeEmpty === 'true';
    return this.queryBus.execute(
      new ExportMarkdownQuery(req.userId, {
        ...(dto.readState === undefined ? {} : { readState: dto.readState }),
        ...(dto.since === undefined ? {} : { since: dto.since }),
        includeEmpty,
      }),
    );
  }

  /** GET /api/v1/items/:id/export/markdown */
  @Get('items/:id/export/markdown')
  async exportItem(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const markdown: string = await this.queryBus.execute(
      new ExportItemMarkdownQuery(req.userId, id),
    );
    res.type('text/markdown; charset=utf-8').send(markdown);
  }
}
