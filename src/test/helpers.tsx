import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../app/providers/AuthProvider';

export function makeToken(expSecondsFromNow: number): string {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + expSecondsFromNow,
    sub: 'u1',
  };
  const encode = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'none' })}.${encode(payload)}.sig`;
}

export function mockJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function mockApiError(code: string, message: string, status = 400, details?: unknown) {
  return mockJsonResponse({ error: { code, message, details } }, status);
}

function testQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', withAuth = true }: { route?: string; withAuth?: boolean } = {}
) {
  const content = withAuth ? <AuthProvider>{ui}</AuthProvider> : ui;
  return render(
    <QueryClientProvider client={testQueryClient()}>
      <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
    </QueryClientProvider>
  );
}

/** Renders a route table under providers for guard/navigation tests. */
export function renderRoutes(routes: { path: string; element: ReactNode }[], initial: string) {
  return render(
    <QueryClientProvider client={testQueryClient()}>
      <MemoryRouter initialEntries={[initial]}>
        <AuthProvider>
          <Routes>
            {routes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
