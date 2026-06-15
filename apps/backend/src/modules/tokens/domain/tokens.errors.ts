import { DomainError } from '../../../common/errors/domain-error';

export class TokenNotFoundError extends DomainError {
  constructor(id: string) {
    super({
      code: 'token-not-found',
      status: 404,
      title: 'Token not found',
      detail: `Personal access token ${id} does not exist or does not belong to this user.`,
    });
  }
}
