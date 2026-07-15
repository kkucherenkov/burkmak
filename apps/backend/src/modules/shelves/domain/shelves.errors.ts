import { DomainError } from '../../../common/errors/domain-error';

export class ShelfNotFoundError extends DomainError {
  constructor(id: string) {
    super({
      code: 'shelf-not-found',
      status: 404,
      title: 'Shelf not found',
      detail: `Shelf ${id} does not exist.`,
    });
  }
}

export class ShelfNameConflictError extends DomainError {
  constructor(name: string) {
    super({
      code: 'shelf-name-conflict',
      status: 409,
      title: 'Shelf name already in use',
      detail: `You already have a shelf named "${name}".`,
    });
  }
}
