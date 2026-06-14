import { describe, it, expect } from 'vitest';
import { parseArticle } from './article';

const HTML = `<html><head><title>T</title></head><body>
  <article><h1>Hello</h1><p>One two three four five.</p>
  <script>alert(1)</script><p>Six seven eight.</p></article></body></html>`;

describe('parseArticle', () => {
  it('extracts readable content, strips scripts, counts words + reading time', () => {
    const a = parseArticle(HTML, 'https://ex.com/p');
    expect(a.contentHtml).not.toContain('<script');
    expect(a.contentText).toContain('One two three');
    expect(a.wordCount).toBeGreaterThanOrEqual(8);
    expect(a.readingTimeMin).toBe(Math.max(1, Math.ceil(a.wordCount / 200)));
  });

  it('returns empty content when no article is found', () => {
    expect(
      parseArticle('<html><body><nav>x</nav></body></html>', 'https://ex.com').contentText,
    ).toBe('');
  });
});
