import { describe, expect, it } from 'vitest';

import { isValidEmail, isValidPassword } from '../../app/utils/auth-validation';

describe('isValidEmail', () => {
  it('accepts a normal address', () => expect(isValidEmail('a@b.co')).toBe(true));
  it('rejects missing @', () => expect(isValidEmail('ab.co')).toBe(false));
  it('rejects too short', () => expect(isValidEmail('a@b')).toBe(false));
});
describe('isValidPassword', () => {
  it('accepts 8+ chars', () => expect(isValidPassword('hunter22')).toBe(true));
  it('rejects < 8 chars', () => expect(isValidPassword('short')).toBe(false));
});
