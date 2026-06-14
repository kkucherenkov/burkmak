import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CreateHighlightHandler } from './application/commands/create-highlight.handler';
import { DeleteHighlightHandler } from './application/commands/delete-highlight.handler';
import { UpdateHighlightHandler } from './application/commands/update-highlight.handler';
import { ListHighlightsHandler } from './application/queries/list-highlights.handler';
import { HIGHLIGHT_REPO } from './domain/highlights.ports';
import { HighlightRepo } from './infra/highlight.repo';
import { HighlightsController, ItemHighlightsController } from './highlights.controller';

@Module({
  imports: [CqrsModule],
  controllers: [ItemHighlightsController, HighlightsController],
  providers: [
    CreateHighlightHandler,
    UpdateHighlightHandler,
    DeleteHighlightHandler,
    ListHighlightsHandler,
    { provide: HIGHLIGHT_REPO, useClass: HighlightRepo },
  ],
})
export class HighlightsModule {}
