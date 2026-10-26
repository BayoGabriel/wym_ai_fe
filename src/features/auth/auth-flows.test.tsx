import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderRoutes } from '../../test/helpers';
import { makeToken, mockJsonResponse, mockApiError } from '../../test/helpers';
import { tokenStore } from '../../shared/auth/token-store';
import { RequireAuth, RedirectIfAuthed } from '../../app/router/guards';
import { SignInPage } from './pages/SignInPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAuth } from '../../app/providers/auth-context';

const USER = {
  id: 'u1',
  email: 'ada@acme.test',
  name: 'Ada',
  status: 'active',
  organizationId: 'org1',
  roles: [{ id: 'r1', name: 'Client Administrator', scope: 'organization' }],
  permissions: ['organization.read'],
  platformAccess: false,
};
const TOKENS = { accessToken: makeToken(3600), refreshToken: 'rt-1' };

function fetchMock(impl: (url: string, init?: RequestInit) => Promise<Response>) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation((input, init) => impl(String(input), init));
}

const appRoutes = [
  {
    path: '/sign-in',
    element: (
      <RedirectIfAuthed>
        <SignInPage />
      </RedirectIfAuthed>
    ),
  },
  { path: '/dashboard', element: <RequireAuth>Dashboard content</RequireAuth> },
];

function authFetch(): Promise<Response> {
  return Promise.resolve(mockJsonResponse(USER));
}

describe('sign-in flow', () => {
  it('signs in with valid credentials and lands on the dashboard', async () => {
    fetchMock((url) => {
      if (url.endsWith('/auth/login')) return Promise.resolve(mockJsonResponse(TOKENS, 201));
      return authFetch();
    });
    renderRoutes(appRoutes, '/sign-in');

    fireEvent.change(await screen.findByLabelText(/email/i), {
      target: { value: 'ada@acme.test' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Dashboard content')).toBeInTheDocument();
    expect(tokenStore.get()).not.toBeNull();
  });

  it('shows a friendly message on INVALID_CREDENTIALS', async () => {
    fetchMock((url) => {
      if (url.endsWith('/auth/login'))
        return Promise.resolve(mockApiError('INVALID_CREDENTIALS', 'Invalid credentials', 401));
      return authFetch();
    });
    renderRoutes(appRoutes, '/sign-in');

    fireEvent.change(await screen.findByLabelText(/email/i), {
      target: { value: 'ada@acme.test' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(tokenStore.get()).toBeNull();
  });

  it('blocks submission with client-side validation errors', async () => {
    const fetchSpy = fetchMock(authFetch);
    renderRoutes(appRoutes, '/sign-in');
    fireEvent.click(await screen.findByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('registration flow', () => {
  it('shows the server EMAIL_EXISTS error on the email field', async () => {
    fetchMock((url) => {
      if (url.endsWith('/auth/register'))
        return Promise.resolve(mockApiError('EMAIL_EXISTS', 'Email already registered', 409));
      return authFetch();
    });
    renderRoutes(
      [{ path: '/register', element: <RegisterPage /> }, ...appRoutes.slice(1)],
      '/register'
    );
    fireEvent.change(await screen.findByLabelText(/your name/i), {
      target: { value: 'Ada' },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: 'ada@acme.test' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/organization name/i), {
      target: { value: 'Acme' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/already registered/i)).toBeInTheDocument();
  });
});

describe('session restore and guards', () => {
  it('redirects unauthenticated users to sign-in', async () => {
    renderRoutes(appRoutes, '/dashboard');
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('restores a valid stored session and renders protected content', async () => {
    tokenStore.set(TOKENS);
    fetchMock(authFetch);
    renderRoutes(appRoutes, '/dashboard');
    expect(await screen.findByText('Dashboard content')).toBeInTheDocument();
  });

  it('refreshes an expired stored access token during restore', async () => {
    tokenStore.set({ accessToken: makeToken(-60), refreshToken: 'rt-1' });
    fetchMock((url) => {
      if (url.endsWith('/auth/refresh'))
        return Promise.resolve(
          mockJsonResponse({
            accessToken: makeToken(3600),
            refreshToken: 'rt-2',
          })
        );
      return authFetch();
    });
    renderRoutes(appRoutes, '/dashboard');
    expect(await screen.findByText('Dashboard content')).toBeInTheDocument();
    expect(tokenStore.get()?.refreshToken).toBe('rt-2');
  });

  it('redirects to sign-in when the stored session cannot be restored', async () => {
    tokenStore.set(TOKENS);
    fetchMock(async (url) =>
      url.endsWith('/auth/refresh')
        ? mockApiError('INVALID_REFRESH_TOKEN', 'revoked', 401)
        : mockApiError('UNAUTHORIZED', 'expired', 401)
    );
    renderRoutes(appRoutes, '/dashboard');
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(tokenStore.get()).toBeNull();
  });
});

describe('logout', () => {
  function LogoutButton() {
    const { signOut } = useAuth();
    return <button onClick={() => void signOut()}>log out</button>;
  }

  it('calls the backend logout, clears tokens, and signs out', async () => {
    tokenStore.set(TOKENS);
    const fetchSpy = fetchMock((url) => {
      if (url.endsWith('/auth/logout')) return Promise.resolve(new Response(null, { status: 204 }));
      return authFetch();
    });
    renderRoutes(
      [
        {
          path: '/x',
          element: (
            <RequireAuth>
              <LogoutButton />
            </RequireAuth>
          ),
        },
        ...appRoutes.slice(0, 1),
      ],
      '/x'
    );
    fireEvent.click(await screen.findByText('log out'));
    await waitFor(() => expect(tokenStore.get()).toBeNull());
    expect(fetchSpy.mock.calls.some((c) => String(c[0]).endsWith('/auth/logout'))).toBe(true);
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});

describe('returnTo handling', () => {
  it('safe return destinations are internal only', async () => {
    const { safeReturnTo } = await import('../../app/router/route-utils');
    expect(safeReturnTo('https://evil.test')).toBe('/dashboard');
    expect(safeReturnTo('//evil.test')).toBe('/dashboard');
    expect(safeReturnTo('/dashboard/products')).toBe('/dashboard/products');
    expect(safeReturnTo(undefined)).toBe('/dashboard');
  });
});
