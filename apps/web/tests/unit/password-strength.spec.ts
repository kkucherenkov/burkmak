import { describe, expect, it } from 'vitest';

import { passwordStrength } from '../../app/utils/password-strength';

describe('passwordStrength', () => {
  it('scores empty as 0/error', () => {
    expect(passwordStrength('')).toEqual({ score: 0, tone: 'error' });
  });
  it('scores a short weak password low', () => {
    expect(passwordStrength('abc').score).toBeLessThanOrEqual(1);
  });
  it('rewards length + variety', () => {
    expect(passwordStrength('Abcd1234!xyz').score).toBeGreaterThanOrEqual(3);
  });
  it('maps the top score to success', () => {
    expect(passwordStrength('Abcd1234!xyzLMNOP').tone).toBe('success');
  });
});
