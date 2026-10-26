import { PageHeader } from '../../../shared/components/PageHeader';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useAuth } from '../../../app/providers/auth-context';
import { useOrgContext } from '../../organizations/queries/use-org-context';

export function OverviewPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const org = useOrgContext();

  if (org.status === 'loading') return <LoadingState label="Loading organization…" />;
  if (org.status === 'error') return <ErrorState message={org.message} />;

  return (
    <>
      <PageHeader
        title={org.organization ? org.organization.name : 'Your workspace'}
        subtitle={
          org.organization
            ? `Organization · ${org.organization.slug}`
            : 'No organization is linked to this account yet.'
        }
      />
      <div className="grid two">
        <section className="card">
          <h2 style={{ fontSize: 'var(--text-lg)' }}>Account</h2>
          <dl className="detail-list">
            <dt>Name</dt>
            <dd>{user?.name}</dd>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
            <dt>Roles</dt>
            <dd>{user?.roles.map((r) => r.name).join(', ') || '—'}</dd>
            <dt>Organization</dt>
            <dd>
              {org.organization ? <StatusBadge status={org.organization.status} /> : 'Not linked'}
            </dd>
          </dl>
        </section>
        <section className="card">
          <h2 style={{ fontSize: 'var(--text-lg)' }}>Products</h2>
          {org.products.length === 0 ? (
            <p className="muted" style={{ marginBottom: 0 }}>
              No products are enabled for this organization yet. Contact WymNet to enable WymAssist
              AI or join the roadmap for WymInsight and WymFlow.
            </p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {org.products.map((p) => (
                <li
                  key={p.code}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) 0',
                  }}
                >
                  <span>{p.name}</span>
                  <StatusBadge status={p.active ? 'active' : 'inactive'} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
