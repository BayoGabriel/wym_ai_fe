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
