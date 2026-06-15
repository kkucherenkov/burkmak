import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { buildEpub } from '../src/modules/kobo/infra/epub.builder';

const base = {
  item: { id: 'it1', title: 'Reading Slowly', url: 'https://x.com/a', siteName: 'x.com' },
  article: { contentHtml: '<p>Hello &amp; welcome</p>' },
  images: [] as { name: string; mediaType: string; data: Uint8Array }[],
};

describe('buildEpub', () => {
  it('produces a valid epub zip with mimetype stored first', async () => {
    const bytes = await buildEpub(base);
    const zip = await JSZip.loadAsync(bytes);
    expect(await zip.file('mimetype')!.async('string')).toBe('application/epub+zip');
    expect(zip.file('META-INF/container.xml')).toBeTruthy();
    expect(zip.file('OEBPS/content.opf')).toBeTruthy();
    expect(zip.file('OEBPS/nav.xhtml')).toBeTruthy();
    const ch = await zip.file('OEBPS/chapter.xhtml')!.async('string');
    expect(ch).toContain('Hello'); // body carried over
    const opf = await zip.file('OEBPS/content.opf')!.async('string');
    expect(opf).toContain('urn:burkmak:it1'); // identifier
    expect(opf).toContain('Reading Slowly');
  });

  it('embeds images and rewrites their src', async () => {
    const bytes = await buildEpub({
      ...base,
      article: { contentHtml: '<p><img src="/api/v1/items/it1/image/abc.png"></p>' },
      images: [{ name: 'abc.png', mediaType: 'image/png', data: new Uint8Array([1, 2, 3]) }],
    });
    const zip = await JSZip.loadAsync(bytes);
    expect(zip.file('OEBPS/images/abc.png')).toBeTruthy();
    const ch = await zip.file('OEBPS/chapter.xhtml')!.async('string');
    expect(ch).toContain('images/abc.png');
    expect(ch).not.toContain('/api/v1/items/');
  });
});
