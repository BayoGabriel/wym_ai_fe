import { describe, expect, it } from 'vitest';
import { tokenStore } from './token-store';
import { isTokenExpired, decodeJwtPayload } from './jwt';
import { makeToken } from '../../test/helpers';

describe('tokenStore', () => {
  it('round-trips a token pair', () => {
    tokenStore.set({ accessToken: 'a', refreshToken: 'r' });
    expect(tokenStore.get()).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('returns null when either token is missing', () => {
    localStorage.setItem('wymnet.accessToken', 'a');
    expect(tokenStore.get()).toBeNull();
  });

  it('clear removes both tokens', () => {
    tokenStore.set({ accessToken: 'a', refreshToken: 'r' });
    tokenStore.clear();
    expect(tokenStore.get()).toBeNull();
    expect(localStorage.length).toBe(0);
  });
});

describe('jwt helpers', () => {
  it('decodes a well-formed payload', () => {
    const token = makeToken(3600);
    expect(decodeJwtPayload(token)?.sub).toBe('u1');
  });

  it('returns null for malformed tokens', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('a.b.c')).toBeNull();
  });

  it('isTokenExpired is false for future exp, true for past exp', () => {
    expect(isTokenExpired(makeToken(3600))).toBe(false);
    expect(isTokenExpired(makeToken(-3600))).toBe(true);
  });

  it('treats tokens expiring within the skew window as expired', () => {
    expect(isTokenExpired(makeToken(5))).toBe(true);
  });
});
