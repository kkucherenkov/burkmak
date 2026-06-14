import { describe, expect, it } from 'vitest';

import { resolveSaveAction } from '../../app/utils/save-action';

describe('resolveSaveAction', () => {
  it('saves when authed and the url is a valid http(s) url', () => {
    expect(
      resolveSaveAction({
        url: 'https://x.com/a',
        authed: true,
        fullPath: '/save?url=https%3A%2F%2Fx.com%2Fa',
      }),
    ).toEqual({ kind: 'save', url: 'https://x.com/a' });
  });

  it('redirects to sign-in (preserving return path) when not authed', () => {
    expect(
      resolveSaveAction({
        url: 'https://x.com',
        authed: false,
        fullPath: '/save?url=https%3A%2F%2Fx.com',
      }),
    ).toEqual({
      kind: 'redirect',
      to: '/sign-in?redirect=%2Fsave%3Furl%3Dhttps%253A%252F%252Fx.com',
    });
  });

  it('is bad when url is missing', () => {
    expect(resolveSaveAction({ url: null, authed: true, fullPath: '/save' })).toEqual({
      kind: 'bad',
    });
  });

  it('is bad when url is not http(s)', () => {
    expect(
      resolveSaveAction({ url: 'javascript:alert(1)', authed: true, fullPath: '/save' }),
    ).toEqual({
      kind: 'bad',
    });
    expect(resolveSaveAction({ url: 'ftp://x', authed: true, fullPath: '/save' })).toEqual({
      kind: 'bad',
    });
  });
});
