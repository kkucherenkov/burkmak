import { describe, it, expect } from 'vitest';
import { escapeFtsQuery } from './item.repo';

describe('escapeFtsQuery', () => {
  it('wraps single term in quotes with prefix wildcard', () => {
    expect(escapeFtsQuery('hello')).toBe('"hello"*');
  });

  it('handles multiple terms', () => {
    expect(escapeFtsQuery('hello world')).toBe('"hello"* "world"*');
  });

  it('escapes embedded double-quotes by doubling them', () => {
    expect(escapeFtsQuery('say "hi"')).toBe('"say"* """hi"""*');
  });

  it('strips leading/trailing whitespace and ignores blank tokens', () => {
    expect(escapeFtsQuery('  foo   bar  ')).toBe('"foo"* "bar"*');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(escapeFtsQuery('   ')).toBe('');
  });

  it('prevents FTS5 operator injection (NOT, AND, OR)', () => {
    // Operators inside quoted terms are treated as literal text, not FTS5 syntax
    const result = escapeFtsQuery('NOT evil OR bad AND good');
    expect(result).toBe('"NOT"* "evil"* "OR"* "bad"* "AND"* "good"*');
  });

  it('prevents column filter injection (table:term syntax)', () => {
    const result = escapeFtsQuery('title:secret');
    expect(result).toBe('"title:secret"*');
  });

  it('prevents NEAR expression injection', () => {
    const result = escapeFtsQuery('NEAR(foo bar, 5)');
    expect(result).toBe('"NEAR(foo"* "bar,"* "5)"*');
  });
});
