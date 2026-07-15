import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AddShelfItemHandler } from './application/commands/add-shelf-item.handler';
import { CreateShelfHandler } from './application/commands/create-shelf.handler';
import { DeleteShelfHandler } from './application/commands/delete-shelf.handler';
import { RemoveShelfItemHandler } from './application/commands/remove-shelf-item.handler';
import { RenameShelfHandler } from './application/commands/rename-shelf.handler';
import { GetShelfHandler } from './application/queries/get-shelf.handler';
import { ListShelvesHandler } from './application/queries/list-shelves.handler';
import { SHELF_REPO } from './domain/shelves.ports';
import { ShelfRepo } from './infra/shelf.repo';
import { ShelvesController } from './shelves.controller';

@Module({
  imports: [CqrsModule],
  controllers: [ShelvesController],
  providers: [
    CreateShelfHandler,
    RenameShelfHandler,
    DeleteShelfHandler,
    AddShelfItemHandler,
    RemoveShelfItemHandler,
    ListShelvesHandler,
    GetShelfHandler,
    { provide: SHELF_REPO, useClass: ShelfRepo },
  ],
  exports: [SHELF_REPO],
})
export class ShelvesModule {}
