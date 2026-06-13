/**
 * WHY this file exists:
 * The NestJS module is the composition root for a bounded context. It wires
 * together handlers, the controller, and the infrastructure adapter behind
 * the port token. Nothing outside this module should know about the adapter.
 *
 * This module is NOT registered in AppModule — it is a reference scaffold.
 * To activate a real module: import it in apps/backend/src/app.module.ts.
 *
 * Pattern:
 *  - imports: [CqrsModule] — required for CommandBus / QueryBus injection.
 *  - providers: list every handler + the token-keyed adapter binding.
 *  - controllers: [TemplateController]
 *  - exports: [] — cross-module access goes through events or a facade, not direct imports.
 */
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CreateTemplateHandler } from './application/commands/create-template.handler';
import { GetTemplateHandler } from './application/queries/get-template.handler';
import { TemplateController } from './_template.controller';
import { TEMPLATE_REPO } from './domain/_template.ports';

/**
 * Placeholder adapter — replace with a real Prisma-backed class in `infra/template.repo.ts`
 * that implements ITemplateRepo. Never let Prisma leak into domain or application layers.
 */
class TemplateRepoPlaceholder {
  findById(): Promise<null> {
    return Promise.resolve(null);
  }

  findMany(): Promise<{ items: []; nextCursor: null }> {
    return Promise.resolve({ items: [], nextCursor: null });
  }
}

@Module({
  imports: [CqrsModule],
  controllers: [TemplateController],
  providers: [
    GetTemplateHandler,
    CreateTemplateHandler,
    { provide: TEMPLATE_REPO, useClass: TemplateRepoPlaceholder },
  ],
})
export class TemplateModule {}
