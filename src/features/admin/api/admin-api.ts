import { authRequest } from '../../../shared/api/api-client';

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
};

export type AdminUsage = {
  organizations: { byStatus: { status: string; count: number }[]; total: number };
  usageTotals: { eventType: string; quantity: number }[];
  perOrganization: (AdminOrganization & {
    userCount: number;
    conversationCount: number;
    messageCount: number;
    leadCount: number;
  })[];
};

export type Subscription = {
  id: string;
  organizationId: string;
  organizationName?: string | null;
  productCode?: string | null;
  status: 'trialing' | 'active' | 'suspended' | 'cancelled' | 'expired';
  startAt: string;
  endAt: string | null;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  organizationId: string | null;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  createdAt: string;
};

export type Product = { id: string; code: string; name: string; active: boolean };

export const adminApi = {
  listOrganizations: () => authRequest<AdminOrganization[]>('/api/v1/organizations'),
  createOrganization: (body: { name: string; slug: string; status?: string }) =>
    authRequest<AdminOrganization>('/api/v1/organizations', { method: 'POST', body }),
  setOrganizationStatus: (id: string, status: 'active' | 'suspended') =>
    authRequest(`/api/v1/admin/organizations/${id}/status`, { method: 'POST', body: { status } }),
  assignProduct: (organizationId: string, productCode: string) =>
    authRequest('/api/v1/admin/products/assign', {
      method: 'POST',
      body: { organizationId, productCode },
    }),
  listProducts: () => authRequest<Product[]>('/api/v1/admin/products'),
  getUsage: () => authRequest<AdminUsage>('/api/v1/admin/usage'),
  listSubscriptions: () => authRequest<Subscription[]>('/api/v1/admin/subscriptions'),
  createSubscription: (body: {
    organizationId: string;
    productCode: string;
    status?: string;
    endAt?: string | null;
  }) => authRequest<Subscription>('/api/v1/admin/subscriptions', { method: 'POST', body }),
  updateSubscription: (id: string, body: { status?: string; endAt?: string | null }) =>
    authRequest<Subscription>(`/api/v1/admin/subscriptions/${id}`, { method: 'PATCH', body }),
  listAuditEvents: (limit = 50) =>
    authRequest<AuditEvent[]>(`/api/v1/admin/audit-events?limit=${limit}`),
};
