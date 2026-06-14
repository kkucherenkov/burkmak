import { describe, it, expect } from 'vitest';
import { anchorFromSelection } from '../../app/utils/highlight-anchor';

describe('anchorFromSelection', () => {
  it('extracts quote + bounded prefix/suffix', () => {
    const text = 'Alpha beta gamma delta epsilon.';
    const a = anchorFromSelection(text, 6, 16); // "beta gamma"
    expect(a.quote).toBe('beta gamma');
    expect(a.prefix.endsWith('Alpha ')).toBe(true);
    expect(a.suffix.startsWith(' delta')).toBe(true);
  });

  it('clamps context at the bounds', () => {
    const a = anchorFromSelection('Hi there world', 0, 2);
    expect(a.quote).toBe('Hi');
    expect(a.prefix).toBe('');
  });

  it('clamps suffix at end of string', () => {
    const text = 'Hello world';
    const a = anchorFromSelection(text, 6, 11); // "world"
    expect(a.quote).toBe('world');
    expect(a.suffix).toBe('');
  });

  it('respects custom ctx length', () => {
    const text = 'ABCDEFGHIJKLMNOP';
    const a = anchorFromSelection(text, 4, 8, 2); // "EFGH"
    expect(a.quote).toBe('EFGH');
    expect(a.prefix).toBe('CD');
    expect(a.suffix).toBe('IJ');
  });
});
