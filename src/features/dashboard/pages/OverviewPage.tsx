import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assistQueries } from '../../assist/queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useAuth } from '../../../app/providers/auth-context';
import { useCan } from '../../../shared/auth/use-permission';
import { useOrgContext } from '../../organizations/queries/use-org-context';
import { SetupChecklist } from '../components/SetupChecklist';
import { AttentionQueue } from '../components/AttentionQueue';
import { PlatformOverview } from '../components/PlatformOverview';

function OrgStatStrip() {
  const canReport = useCan('report.read');
  const report = useQuery({ ...assistQueries.report(7), enabled: canReport });
  if (!canReport || !report.data) return null;
  const r = report.data;
  return (
    <div className="stat-grid">
      <Link to="/dashboard/assist/conversations" className="stat-card">
        <div className="stat-value">{r.conversations.total}</div>
        <div className="stat-label">Conversations · 7d</div>
      </Link>
      <Link to="/dashboard/assist/leads" className="stat-card">
        <div className="stat-value">{r.leads.total}</div>
        <div className="stat-label">Leads · 7d</div>
      </Link>
      <Link to="/dashboard/assist/handoffs" className="stat-card">
        <div className="stat-value">{r.handoffs.open}</div>
        <div className="stat-label">Open handoffs</div>
      </Link>
      <Link to="/dashboard/assist/appointments" className="stat-card">
        <div className="stat-value">{r.appointments.total}</div>
        <div className="stat-label">Appointment requests · 7d</div>
      </Link>
    </div>
  );
}

export function OverviewPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const org = useOrgContext();

  if (user?.platformAccess && org.status === 'ready' && !org.organization) {
    return (
      <>
        <PageHeader title="Platform overview" subtitle="All client organizations and WymNet operations." />
        <PlatformOverview />
      </>
    );
  }
  if (org.status === 'loading') return <LoadingState label="Loading workspace…" />;
  if (org.status === 'error') return <ErrorState message={org.message} />;

  return (
    <>
      <PageHeader
        title={org.organization?.name ?? 'Your workspace'}
        subtitle={
          org.organization
            ? `${org.organization.slug} · signed in as ${user?.name}`
            : 'No organization is linked to this account yet.'
        }
        actions={org.organization && <StatusBadge status={org.organization.status} />}
      />
      <OrgStatStrip />
      <AttentionQueue />
      <div className="grid two">
        <SetupChecklist />
        <section className="card">
          <div className="card-head">
            <h2>Products</h2>
          </div>
          {org.products.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              No products are enabled yet. Contact WymNet to enable WymAssist AI, or join the
              roadmap for WymInsight and WymFlow.
            </p>
          ) : (
            <ul className="row-list">
              {org.products.map((p) => (
                <li key={p.code}>
                  <div className="row-main">
                    <div className="row-title">
                      <Link to={`/dashboard/products/${p.code.toLowerCase()}`}>{p.name}</Link>
                    </div>
                  </div>
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
