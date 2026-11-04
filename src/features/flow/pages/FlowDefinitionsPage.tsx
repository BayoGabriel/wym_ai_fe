import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { flowApi } from '../api';
import { DefinitionForm } from '../components/DefinitionForm';
import { useCan } from '../../../shared/auth/use-permission';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/components/States';
import { StatusTag } from '../../assist/components/StatusTag';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function FlowDefinitionsPage() {
  useDocumentTitle('Workflows');
  const [showForm, setShowForm] = useState(false);
  const canAdmin = useCan('flow.admin');
  const defs = useQuery({ queryKey: ['flow', 'definitions'], queryFn: flowApi.listDefinitions });

  return (
    <>
      <PageHeader title="Workflows" subtitle="Approval processes with custom submission forms." />
      <div className="toolbar">
        {canAdmin && (
          <button className="btn btn--secondary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Hide form' : 'New workflow'}
          </button>
        )}
      </div>
      {showForm && <DefinitionForm onDone={() => setShowForm(false)} />}
      {defs.isPending && <LoadingState label="Loading workflows…" />}
      {defs.isError && <ErrorState message={defs.error.message} />}
      {defs.data && defs.data.items.length === 0 && (
        <EmptyState
          title="No workflows"
          message="Create a workflow definition with submission fields and approval steps."
        />
      )}
      {defs.data && defs.data.items.length > 0 && (
        <section className="card card--pad0">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Fields</th>
                <th>Steps</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {defs.data.items.map((d) => (
                <tr key={d.id} style={{ cursor: 'default' }}>
                  <td>
                    {d.name}
                    {d.description && <div className="muted">{d.description}</div>}
                  </td>
                  <td>{d.fields.length}</td>
                  <td>{d.steps.map((s) => s.name).join(' → ')}</td>
                  <td>
                    <StatusTag status={d.active ? 'ACTIVE' : 'ARCHIVED'} />
                  </td>
                  <td className="muted">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
