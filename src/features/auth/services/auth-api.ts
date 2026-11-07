import { apiRequest, authRequest } from '../../../shared/api/api-client';
import { tokenStore } from '../../../shared/auth/token-store';
import type { AuthTokens, AuthUser, RegisterResponse } from '../types/auth';

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  organizationSlug?: string;
};

export async function login(input: LoginInput): Promise<AuthTokens> {
  const tokens = await apiRequest<AuthTokens>('/api/v1/auth/login', {
    method: 'POST',
    body: input,
  });
  tokenStore.set(tokens);
  return tokens;
}

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const res = await apiRequest<RegisterResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: input,
  });
  tokenStore.set({
    accessToken: res.accessToken,
    refreshToken: res.refreshToken,
  });
  return res;
}

// Always resolves on success — the backend responds identically whether or
// not the email is registered, so unknown addresses can't be probed.
export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest<{ ok: boolean }>('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<void> {
  await apiRequest<{ ok: boolean }>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: input,
  });
}

export function fetchCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  return authRequest<AuthUser>('/api/v1/auth/me', { signal });
}

export async function logout(): Promise<void> {
  const tokens = tokenStore.get();
  if (tokens) {
    try {
      await apiRequest('/api/v1/auth/logout', {
        method: 'POST',
        token: tokens.accessToken,
        body: { refreshToken: tokens.refreshToken },
      });
    } catch {
      // Logout is best-effort — the local session is cleared regardless.
    }
  }
  tokenStore.clear();
}
