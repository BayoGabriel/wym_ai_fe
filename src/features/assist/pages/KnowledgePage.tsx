import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ErrorState, EmptyState } from '../../../shared/components/States';
import { TableSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { StatusFilter } from '../components/StatusFilter';
import { KnowledgeForm } from '../components/KnowledgeForm';
import { KnowledgeUpload } from '../components/KnowledgeUpload';
import { KnowledgeTable } from '../components/KnowledgeTable';

export function KnowledgePage() {
  useDocumentTitle('Knowledge base');
  const canWrite = useCan('knowledge.write');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const filters = { status: status || undefined, search: search || undefined };
  const query = useQuery(assistQueries.knowledge(filters));
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['knowledge'] });

  return (
    <>
      <PageHeader
        title="Knowledge base"
        subtitle="Approved information the assistant answers from — publish or archive to control what it can say."
      />
      <div className="toolbar">
        <input
          className="input"
          placeholder="Search knowledge…"
          aria-label="Search knowledge"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <StatusFilter value={status} onChange={setStatus} options={['DRAFT', 'ACTIVE', 'ARCHIVED']} />
        <div className="toolbar-end">
          <span className="muted small">{query.data ? `${query.data.total} items` : ''}</span>
          {canWrite && (
            <button className="btn btn--secondary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Hide form' : 'New item'}
            </button>
          )}
        </div>
      </div>
      <div className="split split--right">
        <div>
          {query.isPending && <TableSkeleton />}
          {query.isError && <ErrorState message={query.error.message} />}
          {query.data &&
            (query.data.items.length === 0 ? (
              <EmptyState
                title={search || status ? 'Nothing matches' : 'No knowledge yet'}
                message={
                  search || status
                    ? 'Try a different search or filter.'
                    : 'Add FAQs, policies, services — the assistant only answers from approved items.'
                }
              />
            ) : (
              <section className="card card--pad0">
                <div className="table-wrap">
                  <KnowledgeTable items={query.data.items} />
                </div>
              </section>
            ))}
        </div>
        {canWrite && (
          <div>
            {showForm && <KnowledgeForm onCreated={refresh} />}
            <KnowledgeUpload onUploaded={refresh} />
          </div>
        )}
      </div>
    </>
  );
}
