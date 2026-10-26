import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, authRequest, setOnSessionExpired } from './api-client';
import { ApiError } from './api-error';
import { tokenStore } from '../auth/token-store';
import { makeToken, mockJsonResponse, mockApiError } from '../../test/helpers';

const BASE = 'http://localhost:3000';

function fetchMock(impl: (url: string, init?: RequestInit) => Promise<Response>) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation((input, init) => impl(String(input), init));
}

beforeEach(() => {
  setOnSessionExpired(() => {});
});

describe('apiRequest', () => {
  it('sends no Authorization header', async () => {
    const fetchSpy = fetchMock(async () => mockJsonResponse({ ok: true }));
    await apiRequest('/api/v1/ping');
    const [, init] = fetchSpy.mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('parses backend error envelope into ApiError', async () => {
    fetchMock(async () =>
      mockApiError('VALIDATION_ERROR', 'Bad input', 422, {
        fieldErrors: { x: ['y'] },
      })
    );
    const err = (await apiRequest('/x').catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.status).toBe(422);
    expect(err.details?.fieldErrors?.x).toEqual(['y']);
  });

  it('maps fetch failures to NETWORK_ERROR', async () => {
    fetchMock(async () => {
      throw new TypeError('fetch failed');
    });
    const err = (await apiRequest('/x').catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('NETWORK_ERROR');
  });
});

describe('authRequest', () => {
  it('attaches the access token', async () => {
    tokenStore.set({ accessToken: makeToken(3600), refreshToken: 'rt' });
    const fetchSpy = fetchMock(async () => mockJsonResponse({ ok: true }));
    await authRequest('/api/v1/x');
    expect(String(fetchSpy.mock.calls[0][0])).toBe(`${BASE}/api/v1/x`);
    expect((fetchSpy.mock.calls[0][1]?.headers as Record<string, string>).Authorization).toMatch(
      /^Bearer /
    );
  });

  it('rejects immediately when no session exists', async () => {
    const err = (await authRequest('/x').catch((e) => e)) as ApiError;
    expect(err.status).toBe(401);
  });

  it('refreshes an expired access token before calling the API', async () => {
    tokenStore.set({ accessToken: makeToken(-100), refreshToken: 'rt' });
    const fresh = { accessToken: makeToken(3600), refreshToken: 'rt2' };
    const calls: string[] = [];
    fetchMock(async (url) => {
      calls.push(url);
      if (url.endsWith('/auth/refresh')) return mockJsonResponse(fresh);
      return mockJsonResponse({ ok: true });
    });
    await authRequest('/api/v1/me');
    expect(calls).toEqual([`${BASE}/api/v1/auth/refresh`, `${BASE}/api/v1/me`]);
    expect(tokenStore.get()?.accessToken).toBe(fresh.accessToken);
  });

  it('shares a single refresh across concurrent requests', async () => {
    tokenStore.set({ accessToken: makeToken(-100), refreshToken: 'rt' });
    let refreshCalls = 0;
    fetchMock(async (url) => {
      if (url.endsWith('/auth/refresh')) {
        refreshCalls++;
        await new Promise((r) => setTimeout(r, 20));
        return mockJsonResponse({
          accessToken: makeToken(3600),
          refreshToken: 'rt2',
        });
      }
      return mockJsonResponse({ ok: true });
    });
    await Promise.all([authRequest('/a'), authRequest('/b'), authRequest('/c')]);
    expect(refreshCalls).toBe(1);
  });

  it('retries once after a 401 and succeeds', async () => {
    tokenStore.set({ accessToken: makeToken(3600), refreshToken: 'rt' });
    let apiCalls = 0;
    fetchMock(async (url) => {
      if (url.endsWith('/auth/refresh')) {
        return mockJsonResponse({
          accessToken: makeToken(3600),
          refreshToken: 'rt2',
        });
      }
      apiCalls++;
      return apiCalls === 1 ? mockApiError('UNAUTHORIZED', 'expired', 401) : mockJsonResponse({});
    });
    await authRequest('/api/v1/me');
    expect(apiCalls).toBe(2);
  });

  it('clears the session and notifies when refresh fails', async () => {
    tokenStore.set({ accessToken: makeToken(-100), refreshToken: 'rt' });
    let expired = false;
    setOnSessionExpired(() => {
      expired = true;
    });
    fetchMock(async () => mockApiError('INVALID_REFRESH_TOKEN', 'revoked', 401));
    const err = (await authRequest('/x').catch((e) => e)) as ApiError;
    expect(err.status).toBe(401);
    expect(expired).toBe(true);
    expect(tokenStore.get()).toBeNull();
  });
});
