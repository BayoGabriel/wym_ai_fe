import { authRequest } from '../../shared/api/api-client';

export type Organization = {
  id: string;
  name: string;
  slug: string;
  publicKey: string | null;
  status: 'pending' | 'active' | 'suspended' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type OrganizationProduct = {
  status: 'active' | 'inactive';
  productId: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
};

export function getOrganization(id: string, signal?: AbortSignal): Promise<Organization> {
  return authRequest<Organization>(`/api/v1/organizations/${id}`, { signal });
}

export function listOrganizationProducts(
  organizationId: string,
  signal?: AbortSignal
): Promise<OrganizationProduct[]> {
  return authRequest<OrganizationProduct[]>(`/api/v1/organizations/${organizationId}/products`, {
    signal,
  });
}

export type OrgAuditEvent = {
  id: string;
  organizationId: string | null;
  actorUserId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: string | null;
  createdAt: string;
};

/** Change trail for the organization — visible to the client's own staff. */
export function listOrganizationAuditEvents(
  organizationId: string,
  limit = 50,
  signal?: AbortSignal
): Promise<OrgAuditEvent[]> {
  return authRequest<OrgAuditEvent[]>(
    `/api/v1/organizations/${organizationId}/audit-events?limit=${limit}`,
    { signal }
  );
}
