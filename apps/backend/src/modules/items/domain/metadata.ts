import { parse } from 'node-html-parser';

export interface ParsedMetadata {
  title: string | null;
  siteName: string | null;
  excerpt: string | null;
  leadImageUrl: string | null;
  faviconUrl: string | null;
  canonicalUrl: string | null;
}

function abs(href: string | undefined, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

export function parseMetadata(html: string, url: string): ParsedMetadata {
  const root = parse(html);
  const meta = (sel: string, attr = 'content'): string | undefined =>
    root.querySelector(sel)?.getAttribute(attr)?.trim() ?? undefined;

  const title =
    meta('meta[property="og:title"]') ?? root.querySelector('title')?.text.trim() ?? null;
  const siteName = meta('meta[property="og:site_name"]') ?? null;
  const excerpt =
    meta('meta[property="og:description"]') ?? meta('meta[name="description"]') ?? null;
  const leadImageUrl = abs(meta('meta[property="og:image"]'), url);
  const canonicalUrl =
    abs(meta('meta[property="og:url"]'), url) ?? abs(meta('link[rel="canonical"]', 'href'), url);
  const iconHref = meta('link[rel="icon"]', 'href') ?? meta('link[rel="shortcut icon"]', 'href');
  const faviconUrl = abs(iconHref, url) ?? abs('/favicon.ico', url);

  return { title, siteName, excerpt, leadImageUrl, faviconUrl, canonicalUrl };
}
