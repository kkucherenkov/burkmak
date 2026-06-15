import { describe, expect, it } from 'vitest';
import { parseBurkmakId } from './frontmatter';

describe('parseBurkmakId', () => {
  it('reads burkmakId from a YAML frontmatter block', () => {
    expect(parseBurkmakId('---\nburkmakId: it1\ntitle: X\n---\nbody')).toBe('it1');
  });
  it('returns null without frontmatter or key', () => {
    expect(parseBurkmakId('no frontmatter')).toBeNull();
    expect(parseBurkmakId('---\ntitle: X\n---')).toBeNull();
  });
});
