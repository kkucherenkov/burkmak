import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ExportItemMarkdownHandler } from './application/queries/export-item-markdown.handler';
import { ExportMarkdownHandler } from './application/queries/export-markdown.handler';
import { EXPORT_REPO } from './domain/export.ports';
import { ExportController } from './export.controller';
import { ExportRepo } from './infra/export.repo';

@Module({
  imports: [CqrsModule],
  controllers: [ExportController],
  providers: [
    ExportMarkdownHandler,
    ExportItemMarkdownHandler,
    { provide: EXPORT_REPO, useClass: ExportRepo },
  ],
})
export class ExportModule {}
