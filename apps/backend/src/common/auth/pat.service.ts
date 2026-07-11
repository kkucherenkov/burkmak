import { Inject, Injectable } from '@nestjs/common';

import { PAT_PREFIX, hashToken } from '../../modules/tokens/infra/pat.crypto';
import { PAT_REPO, type PatRepo } from '../../modules/tokens/domain/tokens.ports';

@Injectable()
export class PatService {
  constructor(@Inject(PAT_REPO) private readonly repo: PatRepo) {}

  /** Extract a burk_pat_ secret from Authorization (Bearer or Basic password); null if none. */
  private extract(authHeader?: string): string | null {
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
      const t = authHeader.slice(7).trim();
      return t.startsWith(PAT_PREFIX) ? t : null;
    }
    if (authHeader.startsWith('Basic ')) {
      const decoded = Buffer.from(authHeader.slice(6).trim(), 'base64').toString('utf8');
      const pwd = decoded.slice(decoded.indexOf(':') + 1);
      return pwd.startsWith(PAT_PREFIX) ? pwd : null;
    }
    return null;
  }

  async resolve(req: { headers: Record<string, unknown> }): Promise<string | null> {
    const header = req.headers['authorization'];
    const secret = this.extract(typeof header === 'string' ? header : undefined);
    if (!secret) return null;
    return this.resolveSecret(secret);
  }

  /**
   * Resolve a raw burk_pat_ secret to a userId (null when unknown/revoked).
   * Used where the token can't travel in a header — e.g. the Kobo store mount
   * puts it in the URL path because Nickel can't send auth headers.
   */
  async resolveSecret(secret: string): Promise<string | null> {
    if (!secret.startsWith(PAT_PREFIX)) return null;
    const found = await this.repo.findActiveByHash(hashToken(secret));
    if (!found) return null;
    void this.repo.touch(found.id); // best-effort, non-blocking
    return found.userId;
  }
}
