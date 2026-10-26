import { authRequest } from '../../shared/api/api-client';

export type Organization = {
  id: string;
  name: string;
  slug: string;
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
