import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlarmClock, Flame, Handshake, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { assistApi } from '../api/assist-api';
import { assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ErrorState, EmptyState } from '../../../shared/components/States';
import { TableSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { useToast } from '../../../shared/components/toast-context';
import { StatusFilter } from '../components/StatusFilter';
import { StatusTag } from '../components/StatusTag';
import { Pager } from '../components/Pager';
import '../styles/handoffs.css';

function waitInfo(createdAt: string) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins >= 240) return { label: formatDistanceToNow(new Date(createdAt)), cls: 'age--urgent', priority: 'High' };
  if (mins >= 60) return { label: formatDistanceToNow(new Date(createdAt)), cls: 'age--soon', priority: 'Medium' };
  return { label: formatDistanceToNow(new Date(createdAt)), cls: 'age--fresh', priority: 'Normal' };
}

export function HandoffsPage() {
  useDocumentTitle('Human handoffs');
  const canWrite = useCan('handoff.write');
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [status, setStatus] = useState('QUEUED');
  const [page, setPage] = useState(1);
  const query = useQuery(assistQueries.handoffs(status || undefined, page));

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['handoffs'] }),
    onError: (e) => toast({ title: 'Action failed', description: e.message, kind: 'error' }),
  });

  const resolve = (id: string) =>
    act.mutate(() => assistApi.resolveHandoff(id), {
      onSuccess: () =>
        toast({
          title: 'Handoff resolved',
          description: 'Teach the bot from this resolution?',
          kind: 'success',
          action: { label: 'Teach the bot', onClick: () => navigate('/dashboard/assist/knowledge?new=1') },
        }),
    });

  const sorted = [...(query.data?.items ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <>
      <PageHeader
        title="Human handoffs"
        subtitle="Enquiries escalated from the assistant to your team — oldest waits first."
      />
      <div className="toolbar">
        <StatusFilter
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={['QUEUED', 'ASSIGNED', 'RESOLVED', 'CANCELLED']}
        />
        <div className="toolbar-end muted small">{query.data ? `${query.data.total} total` : ''}</div>
      </div>
      {query.isPending && <TableSkeleton />}
      {query.isError && <ErrorState message={query.error.message} />}
      {query.data &&
        (sorted.length === 0 ? (
          <EmptyState
            icon={<Handshake size={18} />}
            title={status === 'QUEUED' ? 'Queue is clear' : 'No handoffs'}
            message={
              status === 'QUEUED'
                ? 'No visitors are waiting for a human right now.'
                : 'Escalated enquiries appear here when visitors ask for a human.'
            }
          />
        ) : (
          <section className="card card--pad0">
            <div className="table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Enquiry</th>
                    <th>Priority</th>
                    <th>Waiting</th>
                    <th>Status</th>
                    {canWrite && <th aria-label="Actions" />}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((h) => {
                    const age = waitInfo(h.createdAt);
                    const open = h.status === 'QUEUED' || h.status === 'REQUESTED' || h.status === 'ASSIGNED';
                    return (
                      <tr key={h.id}>
                        <td>
                          <div className="t-title">
                            <Link to={`/dashboard/assist/handoffs/${h.id}`}>
                              {h.reason ?? 'Visitor requested a human'}
                            </Link>
                          </div>
                          <div className="t-sub">
                            <Link to={`/dashboard/assist/conversations/${h.conversationId}`}>
                              conversation {h.conversationId.slice(0, 8)}
                            </Link>
                          </div>
                        </td>
                        <td>
                          {open ? (
                            <span className={`prio ${age.cls}`}>
                              {age.priority === 'High' && <Flame size={11} />}
                              {age.priority}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`age ${age.cls}`}>
                            <AlarmClock size={11} /> {age.label}
                          </span>
                        </td>
                        <td>
                          <StatusTag status={h.status} />
                        </td>
                        {canWrite && (
                          <td className="t-actions">
                            {h.status === 'QUEUED' && (
                              <button className="pill" onClick={() => act.mutate(() => assistApi.claimHandoff(h.id))}>
                                <UserCheck size={11} /> Claim
                              </button>
                            )}
                            {open && (
                              <button className="pill" onClick={() => resolve(h.id)}>
                                Resolve
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      {query.data && (
        <Pager page={query.data.page} limit={query.data.limit} total={query.data.total} onPage={setPage} />
      )}
    </>
  );
}
