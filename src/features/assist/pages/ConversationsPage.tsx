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
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function ConversationsPage() {
  useDocumentTitle('Conversations');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery(assistQueries.conversations(status || undefined, page));

  return (
    <>
      <PageHeader
        title="Conversations"
        subtitle="Every visitor and staff conversation captured by WymAssist."
      />
      <div className="toolbar">
        <StatusFilter
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={['ACTIVE', 'CLOSED', 'ARCHIVED']}
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
            title={status ? 'Nothing matches this filter' : 'No conversations yet'}
            message={
              status
                ? 'Try a different status filter.'
                : 'Visitor chats appear here once the assistant is live on a channel.'
            }
          />
        ) : (
          <section className="card card--pad0">
            <div className="table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Conversation</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Last activity</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="t-title">
                          <Link to={`/dashboard/assist/conversations/${c.id}`}>
                            {c.title ?? 'Untitled conversation'}
                          </Link>
                        </div>
                        <div className="t-sub mono">{c.id.slice(0, 8)}</div>
                      </td>
                      <td>{c.channel}</td>
                      <td>
                        <StatusTag status={c.status} />
                      </td>
                      <td className="muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="muted">{ago(c.updatedAt)}</td>
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
