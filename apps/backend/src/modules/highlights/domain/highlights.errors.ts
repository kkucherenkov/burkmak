import { DomainError } from '../../../common/errors/domain-error';

export class HighlightNotFoundError extends DomainError {
  constructor(id: string) {
    super({
      code: 'highlight-not-found',
      status: 404,
      title: 'Highlight not found',
      detail: `Highlight ${id} does not exist.`,
    });
  }
}
