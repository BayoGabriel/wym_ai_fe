import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { flowApi } from '../api';
import { SubmissionForm } from '../components/SubmissionForm';
import { StatusFilter } from '../../assist/components/StatusFilter';
import { StatusTag } from '../../assist/components/StatusTag';
import { useCan } from '../../../shared/auth/use-permission';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function FlowInstancesPage() {
  useDocumentTitle('Submissions');
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const canWrite = useCan('flow.write');
  const defs = useQuery({ queryKey: ['flow', 'definitions'], queryFn: flowApi.listDefinitions });
  const list = useQuery({
    queryKey: ['flow', 'instances', status],
    queryFn: () => flowApi.listInstances({ status: status || undefined }),
  });

  return (
    <>
      <PageHeader title="Submissions" subtitle="Items moving through approval workflows." />
      <div className="toolbar">
        <StatusFilter
          label="Status"
          value={status}
          onChange={setStatus}
          options={['IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED']}
        />
        {canWrite && (
          <button className="btn btn--secondary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Hide form' : 'New submission'}
          </button>
        )}
      </div>
      {showForm && defs.data && (
        <SubmissionForm definitions={defs.data.items} onDone={() => setShowForm(false)} />
      )}
      {list.isPending && <LoadingState label="Loading submissions…" />}
      {list.isError && <ErrorState message={list.error.message} />}
      {list.data && list.data.items.length === 0 && (
        <EmptyState title="No submissions" message="Submit an item for approval to see it here." />
      )}
      {list.data && list.data.items.length > 0 && (
        <section className="card card--pad0">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Step</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {list.data.items.map((i) => (
                <tr key={i.id} onClick={() => navigate(`/dashboard/flow/instances/${i.id}`)}>
                  <td>
                    <Link to={`/dashboard/flow/instances/${i.id}`}>{i.title}</Link>
                  </td>
                  <td>
                    <StatusTag status={i.status} />
                  </td>
                  <td>{i.status === 'IN_PROGRESS' ? `Step ${i.currentStep + 1}` : '—'}</td>
                  <td className="muted">{new Date(i.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
