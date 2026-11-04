import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ErrorState, EmptyState } from '../../../shared/components/States';
import { TableSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { StatusFilter } from '../components/StatusFilter';
import { StatusTag } from '../components/StatusTag';
import { Pager } from '../components/Pager';
import { LeadDetail } from '../components/LeadDetail';

export function LeadsPage() {
  useDocumentTitle('Leads');
  const [status, setStatus] = useState('NEW');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const query = useQuery(assistQueries.leads(status || undefined, page));

  return (
    <>
      <PageHeader title="Leads" subtitle="Contact details visitors shared during conversations." />
      <div className="toolbar">
        <StatusFilter
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']}
        />
        <div className="toolbar-end muted small">{query.data ? `${query.data.total} total` : ''}</div>
      </div>
      {query.isPending && <TableSkeleton />}
      {query.isError && <ErrorState message={query.error.message} />}
      {query.data &&
        (query.data.items.length === 0 ? (
          <EmptyState
            title={status === 'NEW' ? 'No new leads' : 'No leads match'}
            message="Leads appear when visitors share contact details through the assistant — enable lead capture in Settings."
          />
        ) : (
          <div className="split split--right">
            <section className="card card--pad0">
              <div className="table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Captured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.data.items.map((l) => (
                      <tr
                        key={l.id}
                        onClick={() => setSelected(l.id)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelected(l.id)}
                        tabIndex={0}
                        role="button"
                        aria-selected={selected === l.id}
                        style={{
                          cursor: 'pointer',
                          background: selected === l.id ? 'var(--accent-soft)' : undefined,
                        }}
                      >
                        <td>
                          <div className="t-title">{l.name ?? 'Unnamed lead'}</div>
                          <div className="t-sub">{l.email ?? l.phone ?? 'No contact details'}</div>
                        </td>
                        <td className="muted">{l.enquiryCategory ?? '—'}</td>
                        <td>
                          <StatusTag status={l.status} />
                        </td>
                        <td className="muted">{new Date(l.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            {selected ? (
              <LeadDetail leadId={selected} />
            ) : (
              <EmptyState title="Select a lead" message="Choose a row to review details and notes." />
            )}
          </div>
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
