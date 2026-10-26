import { createContext, useContext } from 'react';
import type { LoginInput, RegisterInput } from '../../features/auth/services/auth-api';
import type { AuthState, AuthUser } from '../../features/auth/types/auth';

export type AuthContextValue = {
  state: AuthState;
  user: AuthUser | null;
  signIn: (input: LoginInput) => Promise<AuthUser>;
  signUp: (input: RegisterInput) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
