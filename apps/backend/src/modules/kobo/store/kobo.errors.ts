import { DomainError } from '../../../common/errors/domain-error';

export class KoboEntitlementNotFoundError extends DomainError {
  constructor(uuid: string) {
    super({
      code: 'kobo-entitlement-not-found',
      status: 404,
      title: 'Entitlement not found',
      detail: `Kobo entitlement ${uuid} does not exist.`,
    });
  }
}
