import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppConfig } from '../../../../common/config/app-config';
import type { DependencyChecker, DependencyStatus } from '../../domain/health';
import { GetHealthHandler } from './get-health.handler';
import { GetHealthQuery } from './get-health.query';

function makeChecker(status: DependencyStatus = 'ok'): DependencyChecker {
  return { check: vi.fn().mockResolvedValue(status) };
}

function makeConfig(version = '1.2.3'): AppConfig {
  return {
    runtime: { version },
  } as unknown as AppConfig;
}

describe('GetHealthHandler', () => {
  let db: DependencyChecker;
  let config: AppConfig;
  let handler: GetHealthHandler;

  beforeEach(() => {
    db = makeChecker('ok');
    config = makeConfig();
    handler = new GetHealthHandler(db, config);
  });

  it('returns ok status when db is healthy', async () => {
    const result = await handler.execute(new GetHealthQuery());

    expect(result.status).toBe('ok');
    expect(result.dependencies.db).toBe('ok');
    expect(Object.keys(result.dependencies)).toEqual(['db']);
  });

  it('includes the version from config', async () => {
    const result = await handler.execute(new GetHealthQuery());

    expect(result.version).toBe('1.2.3');
  });

  it('includes a non-negative uptimeSeconds', async () => {
    const result = await handler.execute(new GetHealthQuery());

    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('returns degraded status when db is degraded', async () => {
    vi.mocked(db.check).mockResolvedValue('degraded');
    handler = new GetHealthHandler(db, config);

    const result = await handler.execute(new GetHealthQuery());

    expect(result.status).toBe('degraded');
    expect(result.dependencies.db).toBe('degraded');
  });

  it('returns down status when db is down', async () => {
    vi.mocked(db.check).mockResolvedValue('down');
    handler = new GetHealthHandler(db, config);

    const result = await handler.execute(new GetHealthQuery());

    expect(result.status).toBe('down');
    expect(result.dependencies.db).toBe('down');
  });

  it('calls the db checker', async () => {
    await handler.execute(new GetHealthQuery());

    expect(db.check).toHaveBeenCalledOnce();
  });
});
