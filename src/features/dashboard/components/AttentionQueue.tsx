import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assistApi } from '../../assist/api/assist-api';
import { flowApi } from '../../flow/api';
import { useCan } from '../../../shared/auth/use-permission';
import { StatusTag } from '../../assist/components/StatusTag';

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/** Open operational work across products — handoffs, appointments, flow tasks. */
export function AttentionQueue() {
  const canHandoff = useCan('handoff.read');
  const canAppt = useCan('appointment.read');
  const canFlow = useCan('flow.read');
  const handoffs = useQuery({
    queryKey: ['attention', 'handoffs'],
    queryFn: () => assistApi.listHandoffs({ status: 'QUEUED' }),
    enabled: canHandoff,
    refetchInterval: 30_000,
  });
  const appts = useQuery({
    queryKey: ['attention', 'appointments'],
    queryFn: () => assistApi.listAppointments({ status: 'REQUESTED' }),
    enabled: canAppt,
  });
  const tasks = useQuery({
    queryKey: ['attention', 'tasks'],
    queryFn: () => flowApi.listTasks({ mine: true, status: 'PENDING' }),
    enabled: canFlow,
  });

  const rows: { key: string; title: string; sub: string; meta: string; to: string; tag: string }[] = [];
  for (const h of handoffs.data?.items.slice(0, 5) ?? [])
    rows.push({
      key: `h-${h.id}`,
      title: h.reason ?? 'Visitor requested a human',
      sub: 'Human handoff',
      meta: ago(h.createdAt),
      to: `/dashboard/assist/handoffs/${h.id}`,
      tag: h.status,
    });
  for (const a of appts.data?.items.slice(0, 5) ?? [])
    rows.push({
      key: `a-${a.id}`,
      title: `${a.customerName} — ${a.preferredDate} ${a.preferredTime}`,
      sub: 'Appointment request',
      meta: ago(a.createdAt),
      to: '/dashboard/assist/appointments',
      tag: a.status,
    });
  for (const t of tasks.data?.items.slice(0, 5) ?? [])
    rows.push({
      key: `t-${t.id}`,
      title: t.title,
      sub: 'Approval task',
      meta: ago(t.createdAt),
      to: `/dashboard/flow/instances/${t.instanceId}`,
      tag: t.status,
    });

  if (!rows.length) return null;
  return (
    <section className="card">
      <div className="card-head">
        <h2>Needs attention</h2>
        <span className="card-note">{rows.length} open item{rows.length === 1 ? '' : 's'}</span>
      </div>
      <ul className="row-list">
        {rows.map((r) => (
          <li key={r.key}>
            <div className="row-main">
              <div className="row-title">
                <Link to={r.to}>{r.title}</Link>
              </div>
              <div className="row-sub">{r.sub}</div>
            </div>
            <StatusTag status={r.tag} />
            <span className="row-meta">{r.meta}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
