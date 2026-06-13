import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DeleteTagHandler } from './application/commands/delete-tag.handler';
import { RenameTagHandler } from './application/commands/rename-tag.handler';
import { ListTagsHandler } from './application/queries/list-tags.handler';
import { TAG_REPO } from './domain/tags.ports';
import { TagRepo } from './infra/tag.repo';
import { TagsController } from './tags.controller';

@Module({
  imports: [CqrsModule],
  controllers: [TagsController],
  providers: [
    ListTagsHandler,
    RenameTagHandler,
    DeleteTagHandler,
    { provide: TAG_REPO, useClass: TagRepo },
  ],
})
export class TagsModule {}
