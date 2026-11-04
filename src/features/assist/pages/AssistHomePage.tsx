import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assistQueries } from '../queries';
import { assistApi } from '../api/assist-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { StatusTag } from '../components/StatusTag';
import { EmptyState } from '../../../shared/components/States';
import { SetupChecklist } from '../../dashboard/components/SetupChecklist';

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function StatStrip() {
  const report = useQuery(assistQueries.report(7));
  if (!report.data) return null;
  const r = report.data;
  const stats = [
    { label: 'Conversations · 7d', value: r.conversations.total, to: '/dashboard/assist/conversations' },
    { label: 'Leads · 7d', value: r.leads.total, to: '/dashboard/assist/leads' },
    { label: 'Open handoffs', value: r.handoffs.open, to: '/dashboard/assist/handoffs' },
    { label: 'Appt requests · 7d', value: r.appointments.total, to: '/dashboard/assist/appointments' },
  ];
  return (
    <div className="stat-grid">
      {stats.map((s) => (
        <Link key={s.label} to={s.to} className="stat-card">
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </Link>
      ))}
    </div>
  );
}

function HandoffQueue() {
  const q = useQuery({
    queryKey: ['assist-home', 'open-handoffs'],
    queryFn: () => assistApi.listHandoffs({ status: 'QUEUED' }),
    refetchInterval: 30_000,
  });
  const assigned = useQuery({
    queryKey: ['assist-home', 'assigned-handoffs'],
    queryFn: () => assistApi.listHandoffs({ status: 'ASSIGNED' }),
    refetchInterval: 30_000,
  });
  const items = [...(q.data?.items ?? []), ...(assigned.data?.items ?? [])].slice(0, 6);
  return (
    <section className="card">
      <div className="card-head">
        <h2>Handoff queue</h2>
        <Link to="/dashboard/assist/handoffs" className="small">All handoffs</Link>
      </div>
      {items.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>Queue is clear — no visitors waiting on a human.</p>
      ) : (
        <ul className="row-list">
          {items.map((h) => (
            <li key={h.id}>
              <div className="row-main">
                <div className="row-title">
                  <Link to={`/dashboard/assist/handoffs/${h.id}`}>
                    {h.reason ?? 'Visitor requested a human'}
                  </Link>
                </div>
                <div className="row-sub">
                  {h.assignedTo ? 'Assigned' : 'Unassigned'} · {ago(h.createdAt)}
                </div>
              </div>
              <StatusTag status={h.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentLeads() {
  const q = useQuery({
    queryKey: ['assist-home', 'new-leads'],
    queryFn: () => assistApi.listLeads({ status: 'NEW' }),
  });
  const items = q.data?.items.slice(0, 6) ?? [];
  return (
    <section className="card">
      <div className="card-head">
        <h2>New leads</h2>
        <Link to="/dashboard/assist/leads" className="small">All leads</Link>
      </div>
      {items.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>No uncontacted leads.</p>
      ) : (
        <ul className="row-list">
          {items.map((l) => (
            <li key={l.id}>
              <div className="row-main">
                <div className="row-title">{l.name ?? l.email ?? l.phone ?? 'Unnamed lead'}</div>
                <div className="row-sub">
                  {[l.email, l.phone].filter(Boolean).join(' · ') || 'No contact details'} ·{' '}
                  {ago(l.createdAt)}
                </div>
              </div>
              <StatusTag status={l.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PendingAppointments() {
  const q = useQuery({
    queryKey: ['assist-home', 'req-appointments'],
    queryFn: () => assistApi.listAppointments({ status: 'REQUESTED' }),
  });
  const items = q.data?.items.slice(0, 6) ?? [];
  return (
    <section className="card">
      <div className="card-head">
        <h2>Appointment requests</h2>
        <Link to="/dashboard/assist/appointments" className="small">All appointments</Link>
      </div>
      {items.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>No requests waiting to be scheduled.</p>
      ) : (
        <ul className="row-list">
          {items.map((a) => (
            <li key={a.id}>
              <div className="row-main">
                <div className="row-title">{a.customerName}</div>
                <div className="row-sub">
                  {a.preferredDate} at {a.preferredTime}
                  {a.reason ? ` · ${a.reason}` : ''}
                </div>
              </div>
              <StatusTag status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentConversations() {
  const q = useQuery({
    queryKey: ['assist-home', 'recent-convs'],
    queryFn: () => assistApi.listConversations({ status: 'ACTIVE' }),
    refetchInterval: 30_000,
  });
  const items = q.data?.items.slice(0, 6) ?? [];
  return (
    <section className="card">
      <div className="card-head">
        <h2>Live conversations</h2>
        <Link to="/dashboard/assist/conversations" className="small">All conversations</Link>
      </div>
      {items.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>No active conversations right now.</p>
      ) : (
        <ul className="row-list">
          {items.map((c) => (
            <li key={c.id}>
              <div className="row-main">
                <div className="row-title">
                  <Link to={`/dashboard/assist/conversations/${c.id}`}>
                    {c.title ?? 'Untitled conversation'}
                  </Link>
                </div>
                <div className="row-sub">
                  {c.channel.toLowerCase()} · {ago(c.updatedAt)}
                </div>
              </div>
              <StatusTag status={c.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AssistHomePage() {
  useDocumentTitle('WymAssist AI');
  const canReport = useCan('report.read');
  const canHandoff = useCan('handoff.read');
  const canLead = useCan('lead.read');
  const canOps = canHandoff || canLead;

  return (
    <>
      <PageHeader
        title="WymAssist AI"
        subtitle="Your customer-facing assistant — what needs attention right now."
      />
      {canReport && <StatStrip />}
      <SetupChecklist />
      {canOps ? (
        <div className="grid two">
          <HandoffQueue />
          <RecentConversations />
          <RecentLeads />
          <PendingAppointments />
        </div>
      ) : (
        <EmptyState
          title="No operational access"
          message="Your role doesn't include conversation, lead, or handoff permissions. Ask your administrator for access."
        />
      )}
    </>
  );
}
