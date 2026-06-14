import { describe, it, expect, vi } from 'vitest';

// Mock node:dns/promises before any import that uses it, so the hoisted
// vi.mock call replaces the module in the ESM registry.
vi.mock('node:dns/promises', () => ({
  lookup: vi.fn(),
}));

// We test the pure IP-range predicates and the assertSafeHost/assertSafeScheme
// helpers directly to avoid live DNS calls in CI.
import {
  isPrivateIPv4,
  isPrivateIPv6,
  assertSafeScheme,
  assertSafeHost,
  SafeFetchError,
} from './safe-fetch';
import { lookup } from 'node:dns/promises';

// ── isPrivateIPv4 ─────────────────────────────────────────────────────────────

describe('isPrivateIPv4', () => {
  it('blocks 127.0.0.1 (loopback)', () => {
    expect(isPrivateIPv4('127.0.0.1')).toBe(true);
  });

  it('blocks 10.0.0.1 (RFC-1918)', () => {
    expect(isPrivateIPv4('10.0.0.1')).toBe(true);
  });

  it('blocks 10.255.255.255 (end of 10/8)', () => {
    expect(isPrivateIPv4('10.255.255.255')).toBe(true);
  });

  it('blocks 172.16.0.1 (RFC-1918)', () => {
    expect(isPrivateIPv4('172.16.0.1')).toBe(true);
  });

  it('blocks 172.31.255.255 (end of 172.16/12)', () => {
    expect(isPrivateIPv4('172.31.255.255')).toBe(true);
  });

  it('allows 172.15.0.1 (just outside 172.16/12)', () => {
    expect(isPrivateIPv4('172.15.0.1')).toBe(false);
  });

  it('allows 172.32.0.1 (just outside 172.16/12)', () => {
    expect(isPrivateIPv4('172.32.0.1')).toBe(false);
  });

  it('blocks 192.168.1.1 (RFC-1918)', () => {
    expect(isPrivateIPv4('192.168.1.1')).toBe(true);
  });

  it('blocks 169.254.169.254 (cloud metadata / link-local)', () => {
    expect(isPrivateIPv4('169.254.169.254')).toBe(true);
  });

  it('blocks 0.0.0.0 (unspecified)', () => {
    expect(isPrivateIPv4('0.0.0.0')).toBe(true);
  });

  it('allows 8.8.8.8 (public)', () => {
    expect(isPrivateIPv4('8.8.8.8')).toBe(false);
  });

  it('allows 93.184.216.34 (example.com)', () => {
    expect(isPrivateIPv4('93.184.216.34')).toBe(false);
  });
});

// ── isPrivateIPv6 ─────────────────────────────────────────────────────────────

describe('isPrivateIPv6', () => {
  it('blocks ::1 (loopback)', () => {
    expect(isPrivateIPv6('::1')).toBe(true);
  });

  it('blocks :: (unspecified)', () => {
    expect(isPrivateIPv6('::')).toBe(true);
  });

  it('blocks fc00:: (ULA start)', () => {
    expect(isPrivateIPv6('fc00::')).toBe(true);
  });

  it('blocks fdff:ffff::1 (ULA end)', () => {
    expect(isPrivateIPv6('fdff:ffff::1')).toBe(true);
  });

  it('blocks fe80::1 (link-local)', () => {
    expect(isPrivateIPv6('fe80::1')).toBe(true);
  });

  it('allows 2001:db8::1 (documentation/public range)', () => {
    expect(isPrivateIPv6('2001:db8::1')).toBe(false);
  });
});

// ── assertSafeScheme ─────────────────────────────────────────────────────────

describe('assertSafeScheme', () => {
  it('allows http:', () => {
    expect(() => assertSafeScheme(new URL('http://example.com/'))).not.toThrow();
  });

  it('allows https:', () => {
    expect(() => assertSafeScheme(new URL('https://example.com/'))).not.toThrow();
  });

  it('blocks file:', () => {
    expect(() => assertSafeScheme(new URL('file:///etc/passwd'))).toThrow(SafeFetchError);
  });

  it('blocks ftp:', () => {
    expect(() => assertSafeScheme(new URL('ftp://example.com/file'))).toThrow(SafeFetchError);
  });

  it('blocks data: (parsed as URL)', () => {
    // data: URL — URL constructor handles it
    expect(() => assertSafeScheme(new URL('data:text/html,<h1>x</h1>'))).toThrow(SafeFetchError);
  });
});

// ── assertSafeHost (DNS mocked) ───────────────────────────────────────────────

// Helper: prime the mocked lookup to return a specific resolved address.
function mockLookup(address: string, family: 4 | 6): void {
  vi.mocked(lookup).mockResolvedValue({ address, family } as Awaited<ReturnType<typeof lookup>>);
}

describe('assertSafeHost', () => {
  it('blocks hostname that resolves to 169.254.169.254', async () => {
    mockLookup('169.254.169.254', 4);
    await expect(assertSafeHost('metadata.internal')).rejects.toThrow(SafeFetchError);
  });

  it('blocks hostname that resolves to 127.0.0.1', async () => {
    mockLookup('127.0.0.1', 4);
    await expect(assertSafeHost('localhost')).rejects.toThrow(SafeFetchError);
  });

  it('blocks hostname that resolves to 10.0.0.1', async () => {
    mockLookup('10.0.0.1', 4);
    await expect(assertSafeHost('internal.corp')).rejects.toThrow(SafeFetchError);
  });

  it('blocks hostname that resolves to ::1', async () => {
    mockLookup('::1', 6);
    await expect(assertSafeHost('ip6-localhost')).rejects.toThrow(SafeFetchError);
  });

  it('allows hostname that resolves to a public IPv4', async () => {
    mockLookup('93.184.216.34', 4);
    await expect(assertSafeHost('example.com')).resolves.toBeUndefined();
  });

  it('blocks when DNS lookup fails (fail-closed)', async () => {
    vi.mocked(lookup).mockRejectedValue(new Error('ENOTFOUND'));
    await expect(assertSafeHost('does-not-exist.invalid')).rejects.toThrow(SafeFetchError);
  });
});
