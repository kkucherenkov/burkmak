import { describe, expect, it } from 'vitest';

import { rollUp } from './health';

describe('rollUp', () => {
  it('returns ok when all dependencies are ok', () => {
    expect(rollUp(['ok', 'ok', 'ok'])).toBe('ok');
  });

  it('returns degraded when any dependency is degraded', () => {
    expect(rollUp(['ok', 'degraded', 'ok'])).toBe('degraded');
  });

  it('returns down when any dependency is down', () => {
    expect(rollUp(['ok', 'degraded', 'down'])).toBe('down');
  });
});
