import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../app/providers/auth-context';
import { organizationProductsQuery, organizationQuery } from './org-queries';
import type { Organization, OrganizationProduct } from '../organizations-api';

export type OrgContext =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      organization: Organization | null;
      products: OrganizationProduct[];
    };

/**
 * Resolves the caller's organization and product entitlements from the query
 * cache. Users belong to a single organization — no switching UI exists yet.
 */
export function useOrgContext(): OrgContext {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? null;

  const orgQuery = useQuery({
    ...organizationQuery(orgId ?? ''),
    enabled: !!orgId,
  });
  const productsQuery = useQuery({
    ...organizationProductsQuery(orgId ?? ''),
    enabled: !!orgId,
  });

  if (!orgId) return { status: 'ready', organization: null, products: [] };
  if (orgQuery.isPending || productsQuery.isPending) return { status: 'loading' };
  const error = orgQuery.error ?? productsQuery.error;
  if (error) return { status: 'error', message: error.message };
  return {
    status: 'ready',
    organization: orgQuery.data ?? null,
    products: productsQuery.data ?? [],
  };
}
