import { Injectable, Logger } from '@nestjs/common';

import { AppConfig } from '../../../common/config/app-config';

import type { DependencyChecker, DependencyStatus } from '../domain/health';

@Injectable()
export class CentrifugoChecker implements DependencyChecker {
  private readonly logger = new Logger(CentrifugoChecker.name);

  constructor(private readonly config: AppConfig) {}

  async check(): Promise<DependencyStatus> {
    const { apiUrl, apiKey } = this.config.centrifugo;
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: '{}',
        signal: AbortSignal.timeout(2000),
      });
      if (!response.ok) return 'degraded';
      return 'ok';
    } catch (error) {
      this.logger.warn(`Centrifugo healthcheck failed: ${String(error)}`);
      return 'down';
    }
  }
}
