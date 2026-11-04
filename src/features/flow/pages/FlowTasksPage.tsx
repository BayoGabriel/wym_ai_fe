import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { flowApi } from '../api';
import { useCan } from '../../../shared/auth/use-permission';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/components/States';
import { StatusTag } from '../../assist/components/StatusTag';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function FlowTasksPage() {
  useDocumentTitle('My tasks');
  const queryClient = useQueryClient();
  const canWrite = useCan('flow.write');
  const tasks = useQuery({
    queryKey: ['flow', 'tasks', 'mine'],
    queryFn: () => flowApi.listTasks({ mine: true, status: 'PENDING' }),
  });
  const decide = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      flowApi.decideTask(id, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['flow', 'instances'] });
    },
  });

  return (
    <>
      <PageHeader title="My tasks" subtitle="Approval steps waiting on you or the shared queue." />
      {decide.isError && <Alert kind="error">{decide.error.message}</Alert>}
      {tasks.isPending && <LoadingState label="Loading tasks…" />}
      {tasks.isError && <ErrorState message={tasks.error.message} />}
      {tasks.data && tasks.data.items.length === 0 && (
        <EmptyState title="All clear" message="No pending approval tasks." />
      )}
      {tasks.data && tasks.data.items.length > 0 && (
        <section className="card card--pad0">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Waiting since</th>
                {canWrite && <th />}
              </tr>
            </thead>
            <tbody>
              {tasks.data.items.map((t) => (
                <tr key={t.id} style={{ cursor: 'default' }}>
                  <td>
                    <Link to={`/dashboard/flow/instances/${t.instanceId}`}>{t.title}</Link>
                    {t.assignedTo === null && <span className="muted"> · unassigned</span>}
                  </td>
                  <td>
                    <StatusTag status={t.status} />
                  </td>
                  <td className="muted">{new Date(t.createdAt).toLocaleString()}</td>
                  {canWrite && (
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Button
                          onClick={() => decide.mutate({ id: t.id, approve: true })}
                          loading={decide.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => decide.mutate({ id: t.id, approve: false })}
                          loading={decide.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
