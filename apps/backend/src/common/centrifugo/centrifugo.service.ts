import { Injectable, Logger } from '@nestjs/common';

import { AppConfig } from '../config/app-config';

@Injectable()
export class CentrifugoService {
  private readonly logger = new Logger(CentrifugoService.name);

  constructor(private readonly config: AppConfig) {}

  async publish(channel: string, data: unknown): Promise<void> {
    const { apiUrl, apiKey } = this.config.centrifugo;
    try {
      const res = await fetch(`${apiUrl}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ channel, data }),
      });
      if (!res.ok) {
        this.logger.warn(`Centrifugo publish failed: ${String(res.status)} ${res.statusText}`);
      }
    } catch (error: unknown) {
      this.logger.warn(
        `Centrifugo publish error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
