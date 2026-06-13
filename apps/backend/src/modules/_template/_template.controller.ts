/**
 * WHY this file exists:
 * Controllers are the HTTP entry point. Their only jobs are:
 *  1. Receive the validated DTO (class-validator pipe runs before the method body).
 *  2. Dispatch a Command or Query via the bus.
 *  3. Return the result — no mapping, no Prisma, no business logic.
 *
 * CQRS pattern for mutations that return data:
 *   Commands return only { id: string }. If the HTTP response needs the full
 *   resource, the controller issues a follow-up query:
 *
 *     const { id } = await this.commandBus.execute(new CreateXCommand(...));
 *     return this.queryBus.execute(new GetXQuery(id));
 *
 *   This keeps write and read models cleanly separated.
 *
 * URL conventions:
 *  - @Controller({ path: '<resource>', version: '1' }) — setGlobalPrefix('api') + URI
 *    versioning makes the full path /api/v1/<resource>.
 *  - Do NOT hand-write '/api/v1/...' in decorators.
 *
 * Auth: add @UseGuards(SessionGuard) at class level for protected resources.
 * Every public route must be consciously opted-in (omit the guard).
 */
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateTemplateCommand } from './application/commands/create-template.command';
import { GetTemplateQuery } from './application/queries/get-template.query';

import type { TemplateDetail } from './domain/_template.ports';

@Controller({ path: 'templates', version: '1' })
export class TemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** GET /api/v1/templates/:id */
  @Get(':id')
  async getTemplate(@Param('id') id: string): Promise<TemplateDetail> {
    return this.queryBus.execute(new GetTemplateQuery(id));
  }

  /**
   * POST /api/v1/templates — body validated by CreateTemplateDto (class-validator).
   *
   * Pattern: command returns { id }, controller fetches the full record via query.
   * This keeps the write path free of read-model concerns.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(
    @Body() body: { name: string; description?: string },
  ): Promise<TemplateDetail> {
    const created: { id: string } = await this.commandBus.execute(
      new CreateTemplateCommand(body.name, body.description),
    );
    const { id } = created;
    return this.queryBus.execute(new GetTemplateQuery(id));
  }
}
