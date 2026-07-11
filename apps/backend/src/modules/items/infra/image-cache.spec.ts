import { describe, it, expect } from 'vitest';
import { extractImgSrcs, firstCachedImageKey, resolveUrl, sha1 } from './image-cache';

describe('extractImgSrcs', () => {
  it('extracts src attributes from img tags', () => {
    const html =
      '<p><img src="https://ex.com/a.jpg" alt="a"/><img src="https://ex.com/b.png"/></p>';
    expect(extractImgSrcs(html)).toEqual(['https://ex.com/a.jpg', 'https://ex.com/b.png']);
  });

  it('deduplicates repeated srcs', () => {
    const html = '<img src="https://ex.com/a.jpg"/><img src="https://ex.com/a.jpg"/>';
    expect(extractImgSrcs(html)).toHaveLength(1);
  });

  it('returns empty array when no img tags', () => {
    expect(extractImgSrcs('<p>no images here</p>')).toEqual([]);
  });
});

describe('firstCachedImageKey', () => {
  it('returns the first locally-cached image filename in content order', () => {
    const html =
      '<img src="https://ex.com/remote.jpg"/>' +
      '<img src="/api/v1/items/it1/image/aaa.webp"/>' +
      '<img src="/api/v1/items/it1/image/bbb.png"/>';
    expect(firstCachedImageKey(html, 'it1')).toBe('aaa.webp');
  });

  it('ignores cached images belonging to other items', () => {
    const html = '<img src="/api/v1/items/OTHER/image/aaa.jpg"/>';
    expect(firstCachedImageKey(html, 'it1')).toBeNull();
  });

  it('returns null when only remote images remain', () => {
    expect(firstCachedImageKey('<img src="https://ex.com/a.jpg"/>', 'it1')).toBeNull();
  });

  it('returns null for imageless HTML', () => {
    expect(firstCachedImageKey('<p>text</p>', 'it1')).toBeNull();
  });
});

describe('resolveUrl', () => {
  it('returns absolute URL unchanged', () => {
    expect(resolveUrl('https://cdn.ex.com/img.png', 'https://ex.com')).toBe(
      'https://cdn.ex.com/img.png',
    );
  });

  it('resolves relative path against base', () => {
    expect(resolveUrl('/images/foo.png', 'https://ex.com/article')).toBe(
      'https://ex.com/images/foo.png',
    );
  });

  it('returns null for data: URIs', () => {
    expect(resolveUrl('data:image/png;base64,abc', 'https://ex.com')).toBeNull();
  });

  it('returns null when URL construction throws (bad absolute src + bad base)', () => {
    // Both src and base are invalid — new URL() throws
    expect(resolveUrl('not-a-url', 'not-a-base')).toBeNull();
  });
});

describe('sha1', () => {
  it('produces a 40-char hex string', () => {
    const h = sha1('https://ex.com/img.png');
    expect(h).toHaveLength(40);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic for same input', () => {
    expect(sha1('hello')).toBe(sha1('hello'));
  });

  it('differs for different inputs', () => {
    expect(sha1('a')).not.toBe(sha1('b'));
  });
});
