import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { StatusTag } from '../../assist/components/StatusTag';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const EVENT_LABELS: Record<string, string> = {
  'conversation.ai.response': 'AI responses',
  'conversation.message': 'Visitor messages',
  'lead.captured': 'Leads captured',
  'handoff.requested': 'Handoffs requested',
  'appointment.requested': 'Appointments requested',
};

export function AdminUsagePage() {
  useDocumentTitle('Platform usage');
  const usage = useQuery({ queryKey: ['admin', 'usage'], queryFn: adminApi.getUsage });
  const events = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.listAuditEvents(50),
  });
  const totalEvents = usage.data?.usageTotals.reduce((n, t) => n + t.quantity, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Usage & audit"
        subtitle="Platform-wide volume across client organizations, plus the administrative audit feed."
      />
      {usage.isPending && <LoadingState label="Loading usage…" />}
      {usage.isError && <ErrorState message={usage.error.message} />}
      {usage.data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{usage.data.organizations.total}</div>
              <div className="stat-label">Organizations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {usage.data.organizations.byStatus.find((s) => s.status === 'active')?.count ?? 0}
              </div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {usage.data.organizations.byStatus.find((s) => s.status === 'suspended')?.count ??
                  0}
              </div>
              <div className="stat-label">Suspended</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalEvents}</div>
              <div className="stat-label">Tracked usage events</div>
            </div>
          </div>
          <div className="split split--right">
            <section className="card card--pad0">
              <div className="table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Status</th>
                      <th className="num">Users</th>
                      <th className="num">Convs</th>
                      <th className="num">Messages</th>
                      <th className="num">Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.data.perOrganization.map((o) => (
                      <tr key={o.id} style={{ cursor: 'default' }}>
                        <td>
                          <div className="t-title">{o.name}</div>
                          <div className="t-sub mono">{o.slug}</div>
                        </td>
                        <td>
                          <StatusTag status={o.status.toUpperCase()} />
                        </td>
                        <td className="num">{o.userCount}</td>
                        <td className="num">{o.conversationCount}</td>
                        <td className="num">{o.messageCount}</td>
                        <td className="num">{o.leadCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="card">
              <div className="card-head">
                <h2>Event totals</h2>
              </div>
              {usage.data.usageTotals.map((t) => (
                <div className="bar-row" key={t.eventType}>
                  <span className="bar-label">{EVENT_LABELS[t.eventType] ?? t.eventType}</span>
                  <span className="bar-track">
                    <span
                      className="bar-fill"
                      style={{
                        width: `${Math.round((t.quantity / Math.max(1, totalEvents)) * 100)}%`,
                      }}
                    />
                  </span>
                  <span className="bar-num">{t.quantity}</span>
                </div>
              ))}
              {usage.data.usageTotals.length === 0 && (
                <p className="muted" style={{ margin: 0 }}>
                  No usage events recorded yet.
                </p>
              )}
            </section>
          </div>
        </>
      )}
      <section className="card">
        <div className="card-head">
          <h2>Audit events</h2>
          <span className="card-note">Most recent {events.data?.length ?? 0}</span>
        </div>
        {events.isPending && <LoadingState label="Loading activity…" />}
        {events.data && (
          <ul className="row-list">
            {events.data.map((e) => (
              <li key={e.id}>
                <div className="row-main">
                  <div className="row-title mono">{e.action}</div>
                  <div className="row-sub">
                    {e.resourceType}
                    {e.resourceId ? ` · ${e.resourceId.slice(0, 8)}…` : ''}
                    {e.organizationId ? ` · org ${e.organizationId.slice(0, 8)}…` : ''}
                  </div>
                </div>
                <span className="row-meta">{new Date(e.createdAt).toLocaleString()}</span>
              </li>
            ))}
            {events.data.length === 0 && <li className="muted">No activity recorded.</li>}
          </ul>
        )}
      </section>
    </>
  );
}
