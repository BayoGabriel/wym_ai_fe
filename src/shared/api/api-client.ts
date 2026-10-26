import { env } from '../config/env';
import { tokenStore } from '../auth/token-store';
import type { TokenPair } from '../auth/token-store';
import { isTokenExpired } from '../auth/jwt';
import { ApiError } from './api-error';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
};

let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(handler: () => void) {
  onSessionExpired = handler;
}

let refreshPromise: Promise<TokenPair> | null = null;

async function performRefresh(): Promise<TokenPair> {
  const tokens = tokenStore.get();
  if (!tokens) throw new ApiError(401, 'UNAUTHORIZED', 'No session');
  // The backend requires the (possibly expired) access token in the header
  // to bind the refresh to a user; the refresh token is the real credential.
  const res = await fetch(`${env.VITE_API_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  if (!res.ok) {
    tokenStore.clear();
    throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired');
  }
  const next = (await res.json()) as TokenPair;
  tokenStore.set(next);
  return next;
}

/** Single-flight refresh: concurrent 401s share one refresh call. */
function refreshTokens(): Promise<TokenPair> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function parseError(res: Response): Promise<ApiError> {
  let code = 'ERROR';
  let message = res.statusText || 'Request failed';
  let details: ApiError['details'];
  try {
    const body = (await res.json()) as {
      error?: {
        code?: string;
        message?: string;
        details?: ApiError['details'];
      };
    };
    if (body.error?.code) code = body.error.code;
    if (body.error?.message) message = body.error.message;
    if (body.error?.details) details = body.error.details;
  } catch {
    // non-JSON error body — keep status-derived message
  }
  return new ApiError(res.status, code, message, details);
}

async function rawRequest<T>(path: string, options: RequestOptions): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${env.VITE_API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed');
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Public/unauthenticated request. */
export function apiRequest<T>(path: string, options: RequestOptions = {}) {
  return rawRequest<T>(path, options);
}

/**
 * Authenticated request. Attaches the stored access token, proactively
 * refreshes when it is expired, retries once after a successful refresh,
 * and notifies the session layer when the session is unrecoverable.
 */
export async function authRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let tokens = tokenStore.get();
  if (!tokens) throw new ApiError(401, 'UNAUTHORIZED', 'Not signed in');

  if (isTokenExpired(tokens.accessToken)) {
    try {
      tokens = await refreshTokens();
    } catch (error) {
      onSessionExpired?.();
      throw error;
    }
  }

  try {
    return await rawRequest<T>(path, { ...options, token: tokens.accessToken });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    try {
      const next = await refreshTokens();
      return await rawRequest<T>(path, { ...options, token: next.accessToken });
    } catch (refreshError) {
      onSessionExpired?.();
      throw refreshError;
    }
  }
}
