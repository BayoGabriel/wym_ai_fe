import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { flowApi } from '../api';
import type { FlowTask } from '../api';
import { useCan } from '../../../shared/auth/use-permission';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { StatusTag } from '../../assist/components/StatusTag';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

function DecideButtons({ task }: { task: FlowTask }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const canWrite = useCan('flow.write');
  const decide = useMutation({
    mutationFn: (approve: boolean) => flowApi.decideTask(task.id, approve, note || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow', 'instance', task.instanceId] });
      queryClient.invalidateQueries({ queryKey: ['flow', 'tasks'] });
    },
  });
  if (!canWrite || task.status !== 'PENDING') return null;
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
      <input
        className="input"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ maxWidth: 220 }}
      />
      <Button onClick={() => decide.mutate(true)} loading={decide.isPending}>
        Approve
      </Button>
      <Button variant="secondary" onClick={() => decide.mutate(false)} loading={decide.isPending}>
        Reject
      </Button>
    </div>
  );
}

export function FlowInstanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  useDocumentTitle('Submission');
  const queryClient = useQueryClient();
  const canWrite = useCan('flow.write');
  const detail = useQuery({
    queryKey: ['flow', 'instance', id],
    queryFn: () => flowApi.getInstance(id!),
    enabled: !!id,
  });
  const cancel = useMutation({
    mutationFn: () => flowApi.cancelInstance(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flow', 'instance', id] }),
  });

  if (detail.isPending) return <LoadingState label="Loading submission…" />;
  if (detail.isError) return <ErrorState message={detail.error.message} />;
  const { instance, definition, tasks, activities } = detail.data!;

  return (
    <>
      <PageHeader title={instance.title} subtitle={definition.name} />
      {cancel.isError && <Alert kind="error">{cancel.error.message}</Alert>}
      <div className="toolbar">
        <StatusTag status={instance.status} />
        {canWrite && instance.status === 'IN_PROGRESS' && (
          <Button variant="secondary" onClick={() => cancel.mutate()} loading={cancel.isPending}>
            Cancel submission
          </Button>
        )}
        <Link to="/dashboard/flow/instances">Back to submissions</Link>
      </div>

      <section className="card">
        <h2 className="section-title">Submitted data</h2>
        <table className="ops-table">
          <tbody>
            {Object.entries(instance.data).map(([k, v]) => (
              <tr key={k} style={{ cursor: 'default' }}>
                <td className="muted">{k}</td>
                <td>{String(v)}</td>
              </tr>
            ))}
            {Object.keys(instance.data).length === 0 && (
              <tr>
                <td className="muted">No field data submitted.</td>
              </tr>
            )}
          </tbody>
        </table>
        {instance.documents.length > 0 && (
          <p className="muted">
            Attachments: {instance.documents.map((d) => d.filename).join(', ')}
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Approval steps</h2>
        <table className="ops-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Status</th>
              <th>Decision</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} style={{ cursor: 'default' }}>
                <td>{t.title}</td>
                <td>
                  <StatusTag status={t.status} />
                </td>
                <td className="muted">
                  {t.outcome !== 'NONE'
                    ? `${t.outcome}${t.decisionNote ? ` — ${t.decisionNote}` : ''}`
                    : '—'}
                </td>
                <td>
                  <DecideButtons task={t} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="section-title">Activity</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {activities.map((a) => (
            <li
              key={a.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>
                <code>{a.action}</code>
              </span>
              <span className="muted">{new Date(a.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
