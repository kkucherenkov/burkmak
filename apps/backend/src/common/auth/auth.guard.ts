import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  mixin,
  UnauthorizedException,
  type Type,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

import { PrismaService } from '../prisma/prisma.service';

import { AuthService } from './auth.service';
import { PatService } from './pat.service';

import type { Request } from 'express';

/** Attach the authenticated userId to the request so downstream code can read it. */
export interface AuthenticatedRequest extends Request {
  userId: string;
}

@Injectable()
export class SessionGuard implements CanActivate {
  private readonly logger = new Logger(SessionGuard.name);

  constructor(
    private readonly auth: AuthService,
    private readonly i18n: I18nService,
    private readonly pat: PatService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // 1. Try Better Auth session (cookie or bearer token from Better Auth plugin)
    const session = await this.auth.getSession(req);
    if (session?.user) {
      req.userId = session.user.id;
      return true;
    }

    // 2. Try Personal Access Token (Bearer burk_pat_… or Basic password burk_pat_…)
    const userId = await this.pat.resolve(req);
    if (userId) {
      req.userId = userId;
      return true;
    }

    const lang = I18nContext.current()?.lang;
    throw new UnauthorizedException(
      this.i18n.t('auth.sessionRequired', lang ? { lang } : undefined),
    );
  }
}

/**
 * Factory guard that additionally checks the caller's role.
 * Includes session resolution so it can be used as the sole guard on a route.
 *
 * Replace `role: string` with your domain role enum when you add one.
 */
export function RoleGuard(requiredRole: string): Type<CanActivate> {
  @Injectable()
  class MixinRoleGuard implements CanActivate {
    readonly logger: Logger;
    readonly auth: AuthService;
    readonly prisma: PrismaService;
    readonly i18n: I18nService;
    readonly pat: PatService;

    constructor(auth: AuthService, prisma: PrismaService, i18n: I18nService, pat: PatService) {
      this.auth = auth;
      this.prisma = prisma;
      this.i18n = i18n;
      this.pat = pat;
      this.logger = new Logger(MixinRoleGuard.name);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

      // 1. Resolve session (Better Auth first)
      const session = await this.auth.getSession(req);
      if (session?.user) {
        req.userId = session.user.id;
      } else {
        // 2. Fall back to PAT
        const userId = await this.pat.resolve(req);
        if (userId) {
          req.userId = userId;
        } else {
          const lang = I18nContext.current()?.lang;
          throw new UnauthorizedException(
            this.i18n.t('auth.sessionRequired', lang ? { lang } : undefined),
          );
        }
      }

      // TODO: Implement role check using your domain UserProfile model.
      // Example:
      // const profile = await this.prisma.userProfile.findUnique({
      //   where: { userId: req.userId },
      //   select: { role: true },
      // });
      // if (profile?.role !== requiredRole) { ... }

      void requiredRole; // placeholder — remove when implementing

      const lang = I18nContext.current()?.lang;
      throw new ForbiddenException(this.i18n.t('auth.forbidden', lang ? { lang } : undefined));
    }
  }

  return mixin(MixinRoleGuard);
}
