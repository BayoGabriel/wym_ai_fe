import { authRequest } from '../../../shared/api/api-client';
import type { AssistantConfig, OrgSettings } from '../../assist/api/assist-api';

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string;
  publicKey?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
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

export type AdminOrgUsage = {
  totals: { eventType: string; quantity: number }[];
  recent: {
    id: string;
    eventType: string;
    quantity: number;
    provider: string | null;
    createdAt: string;
  }[];
};

export type Subscription = {
  id: string;
  organizationId: string;
  organizationName?: string | null;
  productCode?: string | null;
  productName?: string | null;
  status: 'trialing' | 'active' | 'suspended' | 'cancelled' | 'expired';
  startAt: string;
  endAt: string | null;
  createdAt: string;
};

export type AdminOrgProduct = {
  status: 'active' | 'inactive';
  productId: string;
  code: string;
  name: string;
};

export type PlatformOverview = {
  organizations: { total: number; byStatus: { status: string; count: number }[] };
  subscriptions: { byStatus: { status: string; count: number }[] };
  mrrCents: number;
  trialsExpiring: { id: string; name: string; trialEndsAt: string; daysLeft: number | null }[];
};

export type AdminOrgUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
};

export type AdminOrgOverview = {
  organization: AdminOrganization;
  settings: OrgSettings;
  assistConfig: AssistantConfig;
  products: AdminOrgProduct[];
  subscriptions: Subscription[];
  users: AdminOrgUser[];
  usageByEvent: { eventType: string; quantity: number }[];
};

export type AuditEvent = {
  id: string;
  organizationId: string | null;
  actorUserId: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata?: string | null;
  createdAt: string;
};

export type Product = { id: string; code: string; name: string; active: boolean };

export const adminApi = {
  listOrganizations: (params?: { q?: string; status?: string }) =>
    authRequest<AdminOrganization[]>(
      `/api/v1/organizations${params && (params.q || params.status) ? `?${new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)) as Record<string, string>)}` : ''}`
    ),
  getPlatformOverview: () => authRequest<PlatformOverview>('/api/v1/admin/overview'),
  impersonate: (id: string) =>
    authRequest<{
      accessToken: string;
      user: { id: string; name: string; email: string };
      organization: { id: string; name: string };
      expiresIn: number;
    }>(`/api/v1/admin/organizations/${id}/impersonate`, { method: 'POST', body: {} }),
  endImpersonation: () =>
    authRequest('/api/v1/admin/impersonation/end', { method: 'POST', body: {} }),
  getOnboardingDraft: (id: string) =>
    authRequest<{ draft: Record<string, unknown> | null }>(`/api/v1/admin/organizations/${id}/onboarding`),
  saveOnboardingDraft: (id: string, draft: Record<string, unknown>) =>
    authRequest(`/api/v1/admin/organizations/${id}/onboarding`, { method: 'PATCH', body: draft }),
  applyTemplate: (id: string, template: 'dental_clinic' | 'salon' | 'saas_support') =>
    authRequest<{ applied: string; faqsCreated: number }>(
      `/api/v1/admin/organizations/${id}/apply-template`,
      { method: 'POST', body: { template } }
    ),
  createOrganization: (body: { name: string; slug: string; status?: string }) =>
    authRequest<AdminOrganization>('/api/v1/organizations', { method: 'POST', body }),
  updateOrganization: (
    id: string,
    body: { name?: string; slug?: string; status?: string }
  ) =>
    authRequest<AdminOrganization>(`/api/v1/organizations/${id}`, {
      method: 'PATCH',
      body,
    }),
  setOrganizationStatus: (id: string, status: 'active' | 'suspended') =>
    authRequest(`/api/v1/admin/organizations/${id}/status`, { method: 'POST', body: { status } }),
  registerClient: (body: {
    name: string;
    contactName: string;
    contactEmail: string;
    productCodes?: string[];
  }) =>
    authRequest<{ organization: AdminOrganization; invitedEmail: string; inviteSent: boolean }>(
      '/api/v1/admin/organizations/register',
      { method: 'POST', body }
    ),
  deleteOrganization: (id: string) =>
    authRequest(`/api/v1/admin/organizations/${id}`, { method: 'DELETE' }),
  getOrgOverview: (id: string) =>
    authRequest<AdminOrgOverview>(`/api/v1/admin/organizations/${id}/overview`),
  patchOrgSettings: (id: string, body: Partial<OrgSettings>) =>
    authRequest<OrgSettings>(`/api/v1/admin/organizations/${id}/settings`, {
      method: 'PATCH',
      body,
    }),
  patchAssistConfig: (id: string, body: Partial<AssistantConfig>) =>
    authRequest<AssistantConfig>(`/api/v1/admin/organizations/${id}/assist-config`, {
      method: 'PATCH',
      body,
    }),
  getOrgUsage: (id: string) =>
    authRequest<AdminOrgUsage>(`/api/v1/admin/organizations/${id}/usage`),
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
    startAt?: string;
    endAt?: string | null;
  }) => authRequest<Subscription>('/api/v1/admin/subscriptions', { method: 'POST', body }),
  updateSubscription: (id: string, body: { status?: string; endAt?: string | null }) =>
    authRequest<Subscription>(`/api/v1/admin/subscriptions/${id}`, { method: 'PATCH', body }),
  listAuditEvents: (limit = 50, organizationId?: string) =>
    authRequest<AuditEvent[]>(
      `/api/v1/admin/audit-events?limit=${limit}${organizationId ? `&organizationId=${organizationId}` : ''}`
    ),
};

export const adminKeys = {
  orgOverview: (id: string) => ['admin', 'org', id, 'overview'] as const,
  orgUsage: (id: string) => ['admin', 'org', id, 'usage'] as const,
  orgAudit: (id: string) => ['admin', 'org', id, 'audit'] as const,
};
