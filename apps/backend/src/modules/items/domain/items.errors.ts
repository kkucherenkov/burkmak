import { DomainError } from '../../../common/errors/domain-error';

export class ItemNotFoundError extends DomainError {
  constructor(id: string) {
    super({
      code: 'item-not-found',
      status: 404,
      title: 'Item not found',
      detail: `Item ${id} does not exist.`,
    });
  }
}
