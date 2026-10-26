import { queryOptions } from '@tanstack/react-query';
import { getOrganization, listOrganizationProducts } from '../organizations-api';

/** Centralized query keys — organization context scopes all tenant data. */
export const orgKeys = {
  all: ['organizations'] as const,
  detail: (orgId: string) => [...orgKeys.all, orgId] as const,
  products: (orgId: string) => [...orgKeys.detail(orgId), 'products'] as const,
};

export function organizationQuery(orgId: string) {
  return queryOptions({
    queryKey: orgKeys.detail(orgId),
    queryFn: ({ signal }) => getOrganization(orgId, signal),
    staleTime: 60_000,
  });
}

export function organizationProductsQuery(orgId: string) {
  return queryOptions({
    queryKey: orgKeys.products(orgId),
    queryFn: ({ signal }) => listOrganizationProducts(orgId, signal),
    staleTime: 60_000,
  });
}
