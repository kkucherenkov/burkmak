export type SaveAction =
  | { kind: 'save'; url: string }
  | { kind: 'redirect'; to: string }
  | { kind: 'bad' };

export interface SaveActionInput {
  url: string | null | undefined;
  authed: boolean;
  /** Full path of the current /save route, used to return after sign-in. */
  fullPath: string;
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Pure decision for what the /save page should do — no Nuxt/Vue deps. */
export function resolveSaveAction({ url, authed, fullPath }: SaveActionInput): SaveAction {
  if (!url || !isHttpUrl(url)) return { kind: 'bad' };
  if (!authed) return { kind: 'redirect', to: `/sign-in?redirect=${encodeURIComponent(fullPath)}` };
  return { kind: 'save', url };
}
