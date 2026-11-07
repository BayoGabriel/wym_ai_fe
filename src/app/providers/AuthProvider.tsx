import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { setOnSessionExpired } from '../../shared/api/api-client';
import { tokenStore } from '../../shared/auth/token-store';
import { ApiError } from '../../shared/api/api-error';
import { fetchCurrentUser, login, logout, register } from '../../features/auth/services/auth-api';
import type { LoginInput, RegisterInput } from '../../features/auth/services/auth-api';
import type { AuthState } from '../../features/auth/types/auth';
import { AuthContext, type AuthContextValue } from './auth-context';
import { initUserPrefs } from '../../shared/prefs/prefs';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'initializing' });

  // Per-user UI prefs layer over device prefs once the session resolves.
  useEffect(() => {
    initUserPrefs(state.status === 'authenticated' ? state.user.id : null);
  }, [state]);

  const expire = useCallback(() => {
    tokenStore.clear();
    setState({ status: 'unauthenticated' });
  }, []);

  useEffect(() => {
    setOnSessionExpired(expire);
    const controller = new AbortController();
    async function restore() {
      if (!tokenStore.get()) {
        setState({ status: 'unauthenticated' });
        return;
      }
      try {
        const user = await fetchCurrentUser(controller.signal);
        if (!controller.signal.aborted) setState({ status: 'authenticated', user });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          expire();
        } else {
          // Network/server failure: keep the stored session but surface the
          // unauthenticated shell rather than a broken dashboard.
          setState({ status: 'unauthenticated' });
        }
      }
    }
    restore();
    return () => controller.abort();
  }, [expire]);

  const signIn = useCallback(async (input: LoginInput) => {
    await login(input);
    const user = await fetchCurrentUser();
    setState({ status: 'authenticated', user });
    return user;
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    await register(input);
    const user = await fetchCurrentUser();
    setState({ status: 'authenticated', user });
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setState({ status: 'unauthenticated' });
  }, []);

  const hasPermission = useCallback(
    (permission: string) =>
      state.status === 'authenticated' && state.user.permissions.includes(permission),
    [state]
  );

  const value: AuthContextValue = useMemo(
    () => ({
      state,
      user: state.status === 'authenticated' ? state.user : null,
      signIn,
      signUp,
      signOut,
      hasPermission,
    }),
    [state, signIn, signUp, signOut, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
