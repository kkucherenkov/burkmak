import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { I18nService } from 'nestjs-i18n';

import { AuthService } from '../../common/auth/auth.service';
import { AppConfig } from '../../common/config/app-config';
import { RealtimeAuthError } from './domain/realtime.errors';

import type { Request } from 'express';

export interface RealtimeToken {
  token: string;
  expiresAt: string;
}

@Injectable()
export class RealtimeService {
  constructor(
    private readonly config: AppConfig,
    private readonly auth: AuthService,
    private readonly i18n: I18nService,
  ) {}

  async issueToken(request: Request): Promise<RealtimeToken> {
    const session = await this.auth.getSession(request);
    if (!session?.user) {
      throw new RealtimeAuthError();
    }

    const { tokenHmacSecret, tokenTtlSeconds } = this.config.centrifugo;
    const expSeconds = Math.floor(Date.now() / 1000) + tokenTtlSeconds;
    const token = jwt.sign({ sub: session.user.id, exp: expSeconds }, tokenHmacSecret, {
      algorithm: 'HS256',
    });

    return { token, expiresAt: new Date(expSeconds * 1000).toISOString() };
  }
}
