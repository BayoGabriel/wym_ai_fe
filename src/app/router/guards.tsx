import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/auth-context';
import { LoadingState } from '../../shared/components/States';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const location = useLocation();

  if (state.status === 'initializing') return <LoadingState label="Restoring session…" />;
  if (state.status === 'unauthenticated') {
    return (
      <Navigate to="/sign-in" replace state={{ returnTo: location.pathname + location.search }} />
    );
  }
  return <>{children}</>;
}

export function RequirePlatform({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user?.platformAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const location = useLocation();

  if (state.status === 'initializing') return <LoadingState label="Restoring session…" />;
  if (state.status === 'authenticated') {
    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    return (
      <Navigate
        to={
          returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')
            ? returnTo
            : '/dashboard'
        }
        replace
      />
    );
  }
  return <>{children}</>;
}
