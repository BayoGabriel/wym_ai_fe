import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ErrorState, EmptyState } from '../../../shared/components/States';
import { TableSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { StatusFilter } from '../components/StatusFilter';
import { StatusTag } from '../components/StatusTag';
import { Pager } from '../components/Pager';

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function HandoffsPage() {
  useDocumentTitle('Human handoffs');
  const [status, setStatus] = useState('QUEUED');
  const [page, setPage] = useState(1);
  const query = useQuery(assistQueries.handoffs(status || undefined, page));

  return (
    <>
      <PageHeader
        title="Human handoffs"
        subtitle="Enquiries escalated from the assistant to your team."
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
        <div className="toolbar-end muted small">
          {query.data ? `${query.data.total} total` : ''}
        </div>
      </div>
      {query.isPending && <TableSkeleton />}
      {query.isError && <ErrorState message={query.error.message} />}
      {query.data &&
        (query.data.items.length === 0 ? (
          <EmptyState
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
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Waiting since</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((h) => (
                    <tr key={h.id}>
                      <td>
                        <div className="t-title">
                          <Link to={`/dashboard/assist/handoffs/${h.id}`}>
                            {h.reason ?? 'Visitor requested a human'}
                          </Link>
                        </div>
                        <div className="t-sub mono">conv {h.conversationId.slice(0, 8)}</div>
                      </td>
                      <td>
                        <StatusTag status={h.status} />
                      </td>
                      <td className="muted">{h.assignedTo ? 'Assigned' : 'Unassigned'}</td>
                      <td className="muted">{ago(h.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      {query.data && (
        <Pager
          page={query.data.page}
          limit={query.data.limit}
          total={query.data.total}
          onPage={setPage}
        />
      )}
    </>
  );
}
