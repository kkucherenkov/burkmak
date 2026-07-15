import { describe, it, expect } from 'vitest';
import { escapeFtsQuery, buildItemWhere } from './item.repo';

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

describe('buildItemWhere', () => {
  it('always scopes to userId', () => {
    expect(buildItemWhere({ userId: 'u1', limit: 20 })).toEqual({ userId: 'u1' });
  });

  it('adds a kind filter when set (article)', () => {
    expect(buildItemWhere({ userId: 'u1', limit: 20, kind: 'article' })).toEqual({
      userId: 'u1',
      kind: 'article',
    });
  });

  it('adds a kind filter when set (bookmark)', () => {
    expect(buildItemWhere({ userId: 'u1', limit: 20, kind: 'bookmark' })).toEqual({
      userId: 'u1',
      kind: 'bookmark',
    });
  });

  it('omits kind entirely when unfiltered (returns all kinds)', () => {
    expect(buildItemWhere({ userId: 'u1', limit: 20 })).not.toHaveProperty('kind');
  });

  it('combines kind with readState, favorite, and tag', () => {
    expect(
      buildItemWhere({
        userId: 'u1',
        limit: 20,
        kind: 'article',
        readState: 'unread',
        favorite: true,
        tag: 'rust',
      }),
    ).toEqual({
      userId: 'u1',
      kind: 'article',
      readState: 'unread',
      favorite: true,
      tags: { some: { tag: { slug: 'rust', userId: 'u1' } } },
    });
  });
});
