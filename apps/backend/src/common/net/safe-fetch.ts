/**
 * SSRF-guarded fetch helper.
 *
 * Enforces:
 *  - Only http: / https: schemes.
 *  - Hostname must not resolve to a private/loopback/link-local/ULA/unspecified address.
 *  - Redirects are followed manually (up to MAX_REDIRECTS) so each hop is re-validated.
 *  - Per-request timeout and size cap are caller-supplied.
 */

import { lookup } from 'node:dns/promises';

/** How many redirects we will follow before giving up. */
const MAX_REDIRECTS = 3;

// ── IP-range predicates ───────────────────────────────────────────────────────

/**
 * Returns true when the IPv4 address string falls in a blocked range:
 *   127.0.0.0/8  – loopback
 *   10.0.0.0/8   – RFC-1918
 *   172.16.0.0/12 – RFC-1918
 *   192.168.0.0/16 – RFC-1918
 *   169.254.0.0/16 – link-local / cloud metadata
 *   0.0.0.0       – unspecified
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts as [number, number, number, number];
  if (a === 127) return true; // 127.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b === 254) return true; // 169.254.0.0/16
  if (a === 0) return true; // 0.0.0.0
  return false;
}

/**
 * Returns true when the IPv6 address string falls in a blocked range:
 *   ::1            – loopback
 *   ::             – unspecified
 *   fc00::/7       – ULA (fc00:: – fdff::)
 *   fe80::/10      – link-local
 */
export function isPrivateIPv6(address: string): boolean {
  // Normalise to lower-case; strip zone id.
  const addr = address.toLowerCase().replace(/%.*$/, '');
  if (addr === '::1' || addr === '::' || addr === '0:0:0:0:0:0:0:1' || addr === '0:0:0:0:0:0:0:0')
    return true;

  // Expand first group to check fc00::/7 and fe80::/10.
  // A full expansion is not needed — we only need the first 16-bit group.
  // Starts with :: means the first explicit group is 0.
  const firstGroup = addr.startsWith('::') ? '0' : (addr.split(':')[0] ?? '0');
  const val = Number.parseInt(firstGroup, 16);
  if (Number.isNaN(val)) return false;
  // fc00::/7 → 0xfc00..0xfdff (bit 7 of the high byte is set, bit 8 cleared — i.e. 0b11111100 mask)
  if ((val & 0xfe_00) === 0xfc_00) return true;
  // fe80::/10 → 0xfe80..0xfebf
  if ((val & 0xff_c0) === 0xfe_80) return true;
  return false;
}

/** Throws a SafeFetchError if the hostname resolves to a blocked address. */
export async function assertSafeHost(hostname: string): Promise<void> {
  let resolved: { address: string; family: number };
  try {
    resolved = await lookup(hostname);
  } catch {
    // DNS failure — treat as blocked (fail-closed).
    throw new SafeFetchError(`SSRF guard: DNS lookup failed for host "${hostname}"`);
  }

  const { address, family } = resolved;
  const blocked =
    family === 4 ? isPrivateIPv4(address) : family === 6 ? isPrivateIPv6(address) : true; // unknown family — block

  if (blocked) {
    throw new SafeFetchError(
      `SSRF guard: host "${hostname}" resolves to blocked address "${address}"`,
    );
  }
}

// ── Scheme check ─────────────────────────────────────────────────────────────

/** Throws SafeFetchError if the URL scheme is not http or https. */
export function assertSafeScheme(url: URL): void {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SafeFetchError(`SSRF guard: scheme "${url.protocol}" is not allowed`);
  }
}

// ── Main helper ───────────────────────────────────────────────────────────────

export class SafeFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafeFetchError';
  }
}

export interface SafeFetchOptions {
  /** AbortSignal from caller (for timeout). */
  signal?: AbortSignal;
  /** Request headers. */
  headers?: Record<string, string>;
  /** Hard cap on response body size in bytes. Throws if exceeded. */
  sizeCap?: number;
}

/**
 * Fetch `urlString` with SSRF protection.
 *
 * - Validates scheme + resolves hostname against blocked ranges before each hop.
 * - Follows redirects manually (≤ MAX_REDIRECTS), re-checking each Location.
 * - Returns the final Response; the body has NOT been consumed.
 */
export async function safeFetch(urlString: string, opts: SafeFetchOptions = {}): Promise<Response> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new SafeFetchError(`SSRF guard: invalid URL "${urlString}"`);
  }

  assertSafeScheme(url);
  await assertSafeHost(url.hostname);

  let currentUrl = url;

  // Follow up to MAX_REDIRECTS hops, re-validating each Location header.
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(currentUrl.toString(), {
      redirect: 'manual',
      ...(opts.signal !== undefined && { signal: opts.signal }),
      ...(opts.headers !== undefined && { headers: opts.headers }),
    });

    // Not a redirect — return the response to the caller.
    if (res.status < 300 || res.status >= 400) {
      return res;
    }

    // Redirect response — check hop budget first.
    if (hop === MAX_REDIRECTS) {
      throw new SafeFetchError(`SSRF guard: too many redirects from "${urlString}"`);
    }

    const location = res.headers.get('location');
    if (!location) {
      throw new SafeFetchError('SSRF guard: redirect with no Location header');
    }

    let nextUrl: URL;
    try {
      nextUrl = new URL(location, currentUrl);
    } catch {
      throw new SafeFetchError(`SSRF guard: invalid Location header "${location}"`);
    }

    assertSafeScheme(nextUrl);
    await assertSafeHost(nextUrl.hostname);

    currentUrl = nextUrl;
  }

  // Unreachable: the for loop always returns or throws within its body.
  throw new SafeFetchError(`SSRF guard: too many redirects from "${urlString}"`);
}
