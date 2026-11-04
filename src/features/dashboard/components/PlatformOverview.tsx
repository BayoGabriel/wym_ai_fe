import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../admin/api/admin-api';
import { StatusTag } from '../../assist/components/StatusTag';

const EVENT_LABELS: Record<string, string> = {
  'conversation.ai.response': 'AI responses',
  'conversation.message': 'Visitor messages',
  'lead.captured': 'Leads captured',
  'handoff.requested': 'Handoffs requested',
  'appointment.requested': 'Appointments requested',
};

/** Platform operations overview — only shown to platform-access users. */
export function PlatformOverview() {
  const usage = useQuery({ queryKey: ['admin', 'usage'], queryFn: adminApi.getUsage });
  const audit = useQuery({
    queryKey: ['admin', 'audit', 8],
    queryFn: () => adminApi.listAuditEvents(8),
  });

  const orgs = usage.data?.organizations;
  const active = orgs?.byStatus.find((s) => s.status === 'active')?.count ?? 0;
  const suspended = orgs?.byStatus.find((s) => s.status === 'suspended')?.count ?? 0;
  const busiest = [...(usage.data?.perOrganization ?? [])]
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5);

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{orgs?.total ?? '—'}</div>
          <div className="stat-label">Organizations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{suspended}</div>
          <div className="stat-label">Suspended</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {usage.data?.usageTotals.reduce((n, t) => n + t.quantity, 0) ?? '—'}
          </div>
          <div className="stat-label">Tracked usage events</div>
        </div>
      </div>
      <div className="grid two">
        <section className="card">
          <div className="card-head">
            <h2>Most active clients</h2>
            <Link to="/dashboard/admin/organizations" className="small">
              All clients
            </Link>
          </div>
          <ul className="row-list">
            {busiest.map((o) => (
              <li key={o.id}>
                <div className="row-main">
                  <div className="row-title">{o.name}</div>
                  <div className="row-sub">
                    {o.userCount} users · {o.conversationCount} conversations · {o.leadCount} leads
                  </div>
                </div>
                <StatusTag status={o.status} />
              </li>
            ))}
            {usage.data && busiest.length === 0 && (
              <li className="muted">No client organizations yet.</li>
            )}
          </ul>
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Recent administrative activity</h2>
            <Link to="/dashboard/admin/usage" className="small">
              Full audit
            </Link>
          </div>
          <ul className="row-list">
            {(audit.data ?? []).slice(0, 8).map((e) => (
              <li key={e.id}>
                <div className="row-main">
                  <div className="row-title">{e.action}</div>
                  <div className="row-sub">
                    {e.resourceType} {e.resourceId ? `${e.resourceId.slice(0, 8)}…` : '—'}
                  </div>
                </div>
                <span className="row-meta">{new Date(e.createdAt).toLocaleString()}</span>
              </li>
            ))}
            {audit.data && audit.data.length === 0 && (
              <li className="muted">No audit events recorded yet.</li>
            )}
          </ul>
        </section>
      </div>
      {usage.data && usage.data.usageTotals.length > 0 && (
        <section className="card">
          <div className="card-head">
            <h2>Platform usage totals</h2>
          </div>
          {usage.data.usageTotals.map((t) => (
            <div className="bar-row" key={t.eventType}>
              <span className="bar-label">{EVENT_LABELS[t.eventType] ?? t.eventType}</span>
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{
                    width: `${Math.round(
                      (t.quantity / Math.max(...usage.data.usageTotals.map((x) => x.quantity))) * 100
                    )}%`,
                  }}
                />
              </span>
              <span className="bar-num">{t.quantity}</span>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
