import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderRoutes, makeToken, mockJsonResponse } from '../../test/helpers';
import { tokenStore } from '../../shared/auth/token-store';
import { RequireAuth } from '../../app/router/guards';
import { AppShell } from '../../app/shell/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { ProductHomePage } from './pages/ProductHomePage';

const USER = {
  id: 'u1',
  email: 'ada@acme.test',
  name: 'Ada',
  status: 'active',
  organizationId: 'org-1',
  roles: [{ id: 'r1', name: 'Client Administrator', scope: 'organization' }],
  permissions: ['organization.read', 'lead.read'],
  platformAccess: false,
};
const ORG = { id: 'org-1', name: 'Acme Corp', slug: 'acme', status: 'active' };
const PRODUCTS = [
  {
    status: 'active',
    productId: 'p1',
    code: 'WYMASSIST',
    name: 'WymAssist AI',
    description: 'Assistant',
    active: true,
  },
  {
    status: 'inactive',
    productId: 'p2',
    code: 'WYMINSIGHT',
    name: 'WymInsight AI',
    description: 'Analytics',
    active: false,
  },
];

function dashboardFetch() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url = String(input);
    if (url.endsWith('/auth/me')) return Promise.resolve(mockJsonResponse(USER));
    if (url.endsWith('/organizations/org-1/products'))
      return Promise.resolve(mockJsonResponse(PRODUCTS));
    if (url.endsWith('/organizations/org-1')) return Promise.resolve(mockJsonResponse(ORG));
    return Promise.resolve(new Response('not found', { status: 404 }));
  });
}

function renderDashboard(initial: string) {
  return renderRoutes(
    [
      {
        path: '*',
        element: (
          <RequireAuth>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<OverviewPage />} />
                <Route path="/dashboard/products/:code" element={<ProductHomePage />} />
              </Route>
            </Routes>
          </RequireAuth>
        ),
      },
    ],
    initial
  );
}

describe('dashboard shell', () => {
  it('renders real organization data and active-product navigation', async () => {
    tokenStore.set({ accessToken: makeToken(3600), refreshToken: 'rt' });
    dashboardFetch();
    renderDashboard('/dashboard');

    // The org name appears in the sidebar context box and the overview subhead.
    const matches = await screen.findAllByText(/Acme Corp/);
    expect(matches.length).toBeGreaterThanOrEqual(2);
    // Entitlement-aware nav: only the active product's section appears.
    const nav = screen.getByRole('navigation', { name: /application/i });
    expect(nav).toHaveTextContent('WymAssist');
    expect(nav).not.toHaveTextContent('WymInsight');
    // The org context box reflects the enabled-product count.
    expect(screen.getByText('1 product enabled')).toBeInTheDocument();
  });

  it('product home shows the entitlement details for an enabled product', async () => {
    tokenStore.set({ accessToken: makeToken(3600), refreshToken: 'rt' });
    dashboardFetch();
    renderDashboard('/dashboard/products/wymassist');
    expect(await screen.findByRole('heading', { name: 'WymAssist AI' })).toBeInTheDocument();
  });
});
