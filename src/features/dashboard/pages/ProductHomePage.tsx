import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatusTag } from '../../assist/components/StatusTag';
import { ButtonLink } from '../../../shared/components/Button';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useOrgContext } from '../../organizations/queries/use-org-context';

const PRODUCT_HOME: Record<string, { to: string; label: string; what: string }> = {
  WYMASSIST: {
    to: '/dashboard/assist',
    label: 'Open work queue',
    what: 'AI assistant for your website — conversations, leads, handoffs and appointments.',
  },
  WYMINSIGHT: {
    to: '/dashboard/insight/datasets',
    label: 'Open datasets',
    what: 'Analytics on your business data — upload datasets, generate insight reports.',
  },
  WYMFLOW: {
    to: '/dashboard/flow/tasks',
    label: 'Open tasks',
    what: 'Workflow automation — approval tasks, submissions and workflow definitions.',
  },
};

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
  if (!product || !product.active) {
    return (
      <EmptyState
        title="Product not enabled"
        message="This product isn't entitled for your organization. Contact WymNet to enable it."
      />
    );
  }

  const home = PRODUCT_HOME[product.code];
  return (
    <>
      <PageHeader
        title={product.name}
        subtitle={home?.what ?? product.description ?? undefined}
        actions={<StatusTag status="ACTIVE" />}
      />
      <div className="card">
        {home ? (
          <ButtonLink to={home.to}>{home.label}</ButtonLink>
        ) : (
          <p className="muted" style={{ marginBottom: 0 }}>
            This product has no workspace yet.
          </p>
        )}
      </div>
    </>
  );
}
