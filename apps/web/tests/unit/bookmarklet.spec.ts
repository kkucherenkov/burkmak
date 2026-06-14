import { describe, expect, it } from 'vitest';

import { buildSaveUrl, buildBookmarkletHref } from '../../app/utils/bookmarklet';

describe('buildSaveUrl', () => {
  it('builds an absolute /save URL with the page url encoded', () => {
    expect(buildSaveUrl('https://burkmak.example', 'https://nytimes.com/a?b=1')).toBe(
      'https://burkmak.example/save?url=https%3A%2F%2Fnytimes.com%2Fa%3Fb%3D1',
    );
  });
  it('strips a trailing slash from the origin', () => {
    expect(buildSaveUrl('https://burkmak.example/', 'https://x.com')).toBe(
      'https://burkmak.example/save?url=https%3A%2F%2Fx.com',
    );
  });
});

describe('buildBookmarkletHref', () => {
  it('produces a javascript: snippet that opens the save popup for the current page', () => {
    const href = buildBookmarkletHref('https://burkmak.example');
    expect(href.startsWith('javascript:')).toBe(true);
    expect(href).toContain('window.open(');
    expect(href).toContain('https://burkmak.example/save?url=');
    expect(href).toContain('encodeURIComponent(location.href)');
    // single line — bookmarklets cannot contain raw newlines
    expect(href.includes('\n')).toBe(false);
  });
});
