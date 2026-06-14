/** Strip a single trailing slash so we never emit `//save`. */
function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '');
}

/** Absolute URL of the burkmak `/save` popup for a given page URL. */
export function buildSaveUrl(origin: string, pageUrl: string): string {
  return `${normalizeOrigin(origin)}/save?url=${encodeURIComponent(pageUrl)}`;
}

/**
 * A one-line `javascript:` bookmarklet. It opens the burkmak `/save` popup for
 * whatever page the bookmarklet is clicked on (`location.href`). The origin is
 * baked in at build time; the page URL is resolved at click time in the host page.
 */
export function buildBookmarkletHref(origin: string): string {
  const base = `${normalizeOrigin(origin)}/save?url=`;
  return (
    `javascript:(function(){window.open('${base}'` +
    `+encodeURIComponent(location.href),'burkmak','width=420,height=240');})();`
  );
}
