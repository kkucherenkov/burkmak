import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { PatService } from '../../../common/auth/pat.service';

import type { Request } from 'express';

/**
 * Request augmented with the userId resolved from the path-embedded PAT.
 * Nickel (the Kobo device firmware) cannot send custom auth headers, so the
 * store mount carries the token in the URL: `/api/v1/kobo/:token/...`.
 */
export interface KoboRequest extends Request {
  userId: string;
}

@Injectable()
export class KoboTokenGuard implements CanActivate {
  constructor(private readonly pat: PatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<KoboRequest>();
    const token = req.params['token'];
    const userId = typeof token === 'string' ? await this.pat.resolveSecret(token) : null;

    if (!userId) {
      throw new UnauthorizedException();
    }

    req.userId = userId;
    return true;
  }
}
