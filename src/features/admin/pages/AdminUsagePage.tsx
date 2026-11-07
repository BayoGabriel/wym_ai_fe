import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { adminApi, adminKeys } from '../api/admin-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { StatusTag } from '../../assist/components/StatusTag';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { AuditEventList } from '../../../shared/components/AuditEventList';

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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const totalEvents = usage.data?.usageTotals.reduce((n, t) => n + t.quantity, 0) ?? 0;

  const toggle = (orgId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(orgId)) next.delete(orgId);
      else next.add(orgId);
      return next;
    });

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
              <div className="card-head" style={{ padding: 'var(--space-3) var(--space-4) 0' }}>
                <h2>Organizations</h2>
                <span className="card-note">Expand a row for per-client usage and activity</span>
              </div>
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
                    {usage.data.perOrganization.map((o) => {
                      const open = expanded.has(o.id);
                      return (
                        <Fragment key={o.id}>
                          <tr
                            className="group-row"
                            onClick={() => toggle(o.id)}
                            aria-expanded={open}
                          >
                            <td>
                              <div className="t-title group-title">
                                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                {o.name}
                              </div>
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
                          {open && (
                            <tr className="sub-row">
                              <td colSpan={6} className="expanded-cell">
                                <OrgUsageDetail orgId={o.id} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
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
        {events.data && <AuditEventList events={events.data} />}
      </section>
    </>
  );
}

function OrgUsageDetail({ orgId }: { orgId: string }) {
  const usage = useQuery({
    queryKey: adminKeys.orgUsage(orgId),
    queryFn: () => adminApi.getOrgUsage(orgId),
  });
  const events = useQuery({
    queryKey: adminKeys.orgAudit(orgId),
    queryFn: () => adminApi.listAuditEvents(15, orgId),
  });

  const total = usage.data?.totals.reduce((n, t) => n + t.quantity, 0) ?? 0;

  return (
    <div className="org-detail">
      <div>
        <h3>Usage by event</h3>
        {usage.isPending && <LoadingState label="Loading usage…" />}
        {usage.data && (
          <>
            {usage.data.totals.map((t) => (
              <div className="bar-row" key={t.eventType}>
                <span className="bar-label">{EVENT_LABELS[t.eventType] ?? t.eventType}</span>
                <span className="bar-track">
                  <span
                    className="bar-fill"
                    style={{
                      width: `${Math.round((t.quantity / Math.max(1, total)) * 100)}%`,
                    }}
                  />
                </span>
                <span className="bar-num">{t.quantity}</span>
              </div>
            ))}
            {usage.data.totals.length === 0 && (
              <p className="muted">No usage events recorded.</p>
            )}
            {usage.data.recent.length > 0 && (
              <ul className="row-list" style={{ marginTop: 'var(--space-3)' }}>
                {usage.data.recent.slice(0, 10).map((r) => (
                  <li key={r.id}>
                    <div className="row-main">
                      <div className="row-title mono">{r.eventType}</div>
                      <div className="row-sub">
                        qty {r.quantity}
                        {r.provider ? ` · ${r.provider}` : ''}
                      </div>
                    </div>
                    <span className="row-meta">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <div>
        <h3>Recent actions</h3>
        {events.isPending && <LoadingState label="Loading activity…" />}
        {events.data && <AuditEventList events={events.data} />}
      </div>
    </div>
  );
}
