import { DomainError } from '../../../common/errors/domain-error';

export class TagNotFoundError extends DomainError {
  constructor(id: string) {
    super({
      code: 'tag-not-found',
      status: 404,
      title: 'Tag not found',
      detail: `Tag ${id} does not exist.`,
    });
  }
}
