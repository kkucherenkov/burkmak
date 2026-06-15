/**
 * token-view — pure view-model helpers for the personal access tokens list.
 *
 * No side-effects, no composables, no i18n calls. Callers pass translated
 * labels as arguments so these functions stay unit-testable without a Vue
 * runtime.
 */

import type { components } from '@app/specs';

type PersonalAccessToken = components['schemas']['PersonalAccessToken'];

export interface TokenRow {
  id: string;
  name: string;
  prefix: string;
  /** Formatted "last used" string; neverLabel when null/undefined. */
  lastUsed: string;
  /** Formatted creation date string. */
  createdAt: string;
}

/**
 * Format an ISO-8601 last-used timestamp into a locale-aware short date/time
 * string. Returns `neverLabel` when the value is null or undefined.
 */
export function formatLastUsed(iso: string | null | undefined, neverLabel: string): string {
  if (!iso) return neverLabel;
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Map a list of `PersonalAccessToken` API records to display rows.
 * All labels that require translation must be supplied by the caller.
 */
export function tokenRows(tokens: PersonalAccessToken[], neverLabel: string): TokenRow[] {
  return tokens.map((t) => ({
    id: t.id,
    name: t.name,
    prefix: t.prefix,
    lastUsed: formatLastUsed(t.lastUsedAt, neverLabel),
    createdAt: new Date(t.createdAt).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  }));
}
