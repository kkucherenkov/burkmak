import { describe, expect, it } from 'vitest';
import { slugFilename } from '../src/modules/export/infra/slugify';
import { renderNote } from '../src/modules/export/infra/render-note';

describe('slugFilename', () => {
  it('slugifies title + short id suffix, .md', () => {
    expect(slugFilename('The Case for Reading Slowly!', 'cmqd1234')).toBe(
      'the-case-for-reading-slowly-cmqd1234.md',
    );
  });
  it('falls back to id when title empty', () => {
    expect(slugFilename(null, 'cmqd1234')).toBe('cmqd1234.md');
  });
  it('collapses non-alnum and trims', () => {
    expect(slugFilename('  A  —  B ', 'id1')).toBe('a-b-id1.md');
  });
});

const item = {
  id: 'it1',
  title: 'Reading Slowly',
  url: 'https://x.com/a',
  canonicalUrl: null,
  siteName: 'x.com',
  savedAt: '2026-06-14T00:00:00Z',
  tags: ['reading', 'longread'],
  readingTimeMin: 12,
};

describe('renderNote', () => {
  it('renders frontmatter + highlights blockquotes + notes', () => {
    const { filename, markdown, itemId } = renderNote(item, [
      { quote: 'first quote', note: 'my note', color: 'yellow' },
      { quote: 'second', note: null, color: 'green' },
    ]);
    expect(itemId).toBe('it1');
    expect(filename).toBe('reading-slowly-it1.md');
    expect(markdown).toContain('burkmakId: it1'); // idempotency key
    expect(markdown).toContain('title: Reading Slowly');
    expect(markdown).toContain('url: https://x.com/a');
    expect(markdown).toContain('source: x.com');
    expect(markdown).toMatch(/tags:\n\s+- reading\n\s+- longread/);
    expect(markdown).toContain('> first quote'); // highlight blockquote
    expect(markdown).toContain('my note'); // note rendered
    expect(markdown).toContain('> second');
  });

  it('escapes YAML-special title and omits empty note', () => {
    const { markdown } = renderNote({ ...item, title: 'A: B #c' }, [
      { quote: 'q', note: null, color: 'blue' },
    ]);
    expect(markdown).toContain('title: "A: B #c"'); // quoted because of :
  });

  it('uses id when title null; omits author when no siteName', () => {
    const { filename, markdown } = renderNote({ ...item, title: null, siteName: null }, []);
    expect(filename).toBe('it1.md');
    expect(markdown).not.toContain('source:');
  });
});
