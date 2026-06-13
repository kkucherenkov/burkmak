/**
 * WHY this file exists:
 * Command handlers contain write-side business logic. They receive a Command
 * (a plain data object), validate invariants, call domain methods or repo
 * write operations, and return ONLY a minimal confirmation — never a full read model.
 *
 * CQRS rule: commands return void, { id: string }, or a simple side-effect
 * confirmation (e.g. { requestedAt: string }). Never return a full entity or DTO.
 * If the caller needs the created record, they issue a separate query:
 *
 *   // Controller — correct pattern
 *   const { id } = await this.commandBus.execute(new CreateTemplateCommand(...));
 *   return this.queryBus.execute(new GetTemplateQuery(id));
 *
 * Rules enforced here:
 *  - Constructor only injects ports via @Inject(TOKEN). Never Prisma directly.
 *  - No HTTP concepts (Request, Response, status codes). Those belong in the controller.
 *  - Throws DomainError subclasses — never NestJS HTTP exceptions.
 *  - `execute` has an explicit return type.
 */
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TEMPLATE_REPO } from '../../domain/_template.ports';

import { CreateTemplateCommand } from './create-template.command';

import type { ITemplateRepo } from '../../domain/_template.ports';

@CommandHandler(CreateTemplateCommand)
export class CreateTemplateHandler implements ICommandHandler<
  CreateTemplateCommand,
  { id: string }
> {
  constructor(@Inject(TEMPLATE_REPO) private readonly repo: ITemplateRepo) {}

  async execute(command: CreateTemplateCommand): Promise<{ id: string }> {
    // Validate invariants here (e.g. uniqueness checks via repo methods).
    // Then persist and return only the new resource's ID.
    const payload: { name: string; description?: string } = { name: command.name };
    if (command.description !== undefined) payload.description = command.description;
    const id = await this.repo.create(payload);
    return { id };
  }
}
