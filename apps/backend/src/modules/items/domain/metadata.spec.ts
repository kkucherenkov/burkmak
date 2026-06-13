import { describe, it, expect } from 'vitest';
import { parseMetadata } from './metadata';

const HTML = `<html><head>
  <title>Fallback Title</title>
  <meta property="og:title" content="OG Title"/>
  <meta name="description" content="A short description."/>
  <meta property="og:image" content="/img/lead.png"/>
  <meta property="og:site_name" content="Example"/>
  <link rel="canonical" href="https://ex.com/canonical"/>
  <link rel="icon" href="/favicon.ico"/>
</head><body>x</body></html>`;

describe('parseMetadata', () => {
  it('prefers og:title, resolves relative image/favicon against the url', () => {
    const m = parseMetadata(HTML, 'https://ex.com/a/page');
    expect(m).toMatchObject({
      title: 'OG Title',
      siteName: 'Example',
      excerpt: 'A short description.',
      leadImageUrl: 'https://ex.com/img/lead.png',
      faviconUrl: 'https://ex.com/favicon.ico',
      canonicalUrl: 'https://ex.com/canonical',
    });
  });

  it('falls back to <title> and /favicon.ico when tags are absent', () => {
    const m = parseMetadata(
      '<html><head><title>Only Title</title></head></html>',
      'https://ex.com/p',
    );
    expect(m.title).toBe('Only Title');
    expect(m.faviconUrl).toBe('https://ex.com/favicon.ico');
    expect(m.canonicalUrl).toBeNull();
  });
});
