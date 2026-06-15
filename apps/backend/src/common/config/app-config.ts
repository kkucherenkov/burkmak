import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BetterAuthConfig {
  readonly secret: string;
  /** Public base URL (scheme + host + port). Used by Better Auth to sign cookies and build callback URLs. */
  readonly baseUrl: string;
  /** URL path where the Better Auth handler is mounted. `/api/v1/auth` sits inside URI versioning. */
  readonly basePath: string;
}

export interface SmsConfig {
  readonly configured: boolean;
  readonly accountSid: string;
  readonly authToken: string;
  readonly fromNumber: string;
}

export interface AppRuntimeConfig {
  readonly port: number;
  readonly nodeEnv: 'development' | 'production' | 'test';
  readonly corsOrigins: string[];
  readonly version: string;
}

export interface FirebaseConfig {
  /** JSON-encoded service account credentials. Empty string = Firebase disabled. */
  readonly serviceAccountJson: string;
  readonly configured: boolean;
}

export type ProviderMode = 'mock' | 'real';

export interface ProvidersConfig {
  /** Which SMS backend to use. Defaults to 'mock'. */
  readonly sms: ProviderMode;
  /** Which email backend to use. Defaults to 'mock'. */
  readonly email: ProviderMode;
  /** Which push backend to use. Defaults to 'mock'. */
  readonly push: ProviderMode;
  /** Which storage backend to use. Defaults to 'mock'. */
  readonly storage: ProviderMode;
}

@Injectable()
export class AppConfig {
  constructor(private readonly config: ConfigService) {}

  get runtime(): AppRuntimeConfig {
    return {
      port: this.numberOrDefault('PORT', 3000),
      nodeEnv: this.stringOrDefault('NODE_ENV', 'development') as AppRuntimeConfig['nodeEnv'],
      corsOrigins: this.stringOrDefault('CORS_ORIGINS', 'http://localhost:3001')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      version: this.stringOrDefault('APP_VERSION', '0.0.0-dev'),
    };
  }

  get firebase(): FirebaseConfig {
    const serviceAccountJson = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON') ?? '';
    return {
      serviceAccountJson,
      configured: serviceAccountJson.length > 0,
    };
  }

  get databaseUrl(): string {
    return this.requireString('DATABASE_URL');
  }

  get betterAuth(): BetterAuthConfig {
    return {
      secret: this.requireString('BETTER_AUTH_SECRET'),
      baseUrl: this.requireString('BETTER_AUTH_URL'),
      basePath: this.stringOrDefault('BETTER_AUTH_BASE_PATH', '/api/v1/auth'),
    };
  }

  get sms(): SmsConfig {
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID') ?? '';
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN') ?? '';
    const fromNumber = this.config.get<string>('TWILIO_FROM') ?? '';
    const configured = Boolean(accountSid && authToken && fromNumber);
    return { configured, accountSid, authToken, fromNumber };
  }

  /**
   * Base directory for local data storage (images, etc.).
   * Defaults to `./data` relative to the process cwd.
   */
  get dataDir(): string {
    return this.stringOrDefault('DATA_DIR', './data');
  }

  /**
   * Public base URL for the API, e.g. `https://example.com/api/v1`.
   * Used in OPDS catalog links and EPUB download hrefs.
   * Falls back to `http://localhost:<port>/api/v1` when PUBLIC_API_BASE_URL is unset.
   */
  get publicApiBaseUrl(): string {
    const explicit = this.config.get<string>('PUBLIC_API_BASE_URL');
    if (explicit) return explicit.replace(/\/+$/, '');
    const port = this.runtime.port;
    return `http://localhost:${port.toString()}/api/v1`;
  }

  get jobs(): { pollIntervalMs: number; backoffBaseMs: number } {
    return {
      pollIntervalMs: this.numberOrDefault('JOBS_POLL_INTERVAL_MS', 1000),
      backoffBaseMs: this.numberOrDefault('JOBS_BACKOFF_BASE_MS', 2000),
    };
  }

  /** Integration provider selection. All default to 'mock' — no env vars needed. */
  get providers(): ProvidersConfig {
    return {
      sms: 'mock',
      email: 'mock',
      push: 'mock',
      storage: 'mock',
    };
  }

  private requireString(key: string): string {
    const value = this.config.get<string>(key);
    if (value === undefined || value === '') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private stringOrDefault(key: string, fallback: string): string {
    const value = this.config.get<string>(key);
    return value === undefined || value === '' ? fallback : value;
  }

  private numberOrDefault(key: string, fallback: number): number {
    const value = this.config.get<string>(key);
    if (value === undefined || value === '') return fallback;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new TypeError(`Environment variable ${key} must be numeric, got: ${value}`);
    }
    return parsed;
  }
}
