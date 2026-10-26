import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useOrgContext } from '../../organizations/queries/use-org-context';

export function ProductHomePage() {
  const { code } = useParams();
  const org = useOrgContext();
  const product =
    org.status === 'ready'
      ? org.products.find((p) => p.code.toLowerCase() === code?.toLowerCase())
      : undefined;
  useDocumentTitle(product?.name ?? 'Product');

  if (org.status === 'loading') return <LoadingState label="Loading product…" />;
  if (org.status === 'error') return <ErrorState message={org.message} />;
  if (!product) {
    return (
      <EmptyState
        title="Product not enabled"
        message="This product isn't entitled for your organization. Contact WymNet to enable it."
      />
    );
  }

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle={product.description ?? undefined}
        actions={<StatusBadge status={product.active ? 'active' : 'inactive'} />}
      />
      <div className="card">
        <h2 style={{ fontSize: 'var(--text-lg)' }}>Workspace coming next</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          The {product.name} management workspace — configuration, conversations, knowledge, and
          team tools — is delivered in the next implementation phase. Your entitlement is active and
          this space is reserved for it.
        </p>
      </div>
    </>
  );
}
