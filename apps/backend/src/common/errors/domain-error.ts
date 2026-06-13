export interface DomainErrorOptions {
  readonly code: string;
  readonly status: number;
  readonly title: string;
  readonly detail?: string;
  readonly cause?: unknown;
}

export class DomainError extends Error {
  readonly code: string;
  readonly status: number;
  readonly title: string;
  readonly detail: string | undefined;

  constructor(options: DomainErrorOptions) {
    super(options.detail ?? options.title, { cause: options.cause });
    this.name = 'DomainError';
    this.code = options.code;
    this.status = options.status;
    this.title = options.title;
    this.detail = options.detail;
  }
}
