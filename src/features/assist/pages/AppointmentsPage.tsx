import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import { assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Alert } from '../../../shared/components/Alert';
import { ErrorState, EmptyState } from '../../../shared/components/States';
import { TableSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { StatusFilter } from '../components/StatusFilter';
import { StatusTag } from '../components/StatusTag';
import { Pager } from '../components/Pager';
import { AppointmentActions } from '../components/AppointmentActions';

export function AppointmentsPage() {
  useDocumentTitle('Appointments');
  const canWrite = useCan('appointment.write');
  const [status, setStatus] = useState('REQUESTED');
  const [page, setPage] = useState(1);
  const query = useQuery(assistQueries.appointments(status || undefined, page));
  const queryClient = useQueryClient();
  const act = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) =>
      assistApi.updateAppointment(id, { status: next }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Requests collected by the assistant, awaiting scheduling."
      />
      <div className="toolbar">
        <StatusFilter
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']}
        />
        <div className="toolbar-end muted small">
          {query.data ? `${query.data.total} total` : ''}
        </div>
      </div>
      {act.isError && <Alert kind="error">{act.error.message}</Alert>}
      {query.isPending && <TableSkeleton />}
      {query.isError && <ErrorState message={query.error.message} />}
      {query.data &&
        (query.data.items.length === 0 ? (
          <EmptyState
            title={status === 'REQUESTED' ? 'Nothing waiting to be scheduled' : 'No appointments'}
            message="Enable appointment requests in assistant settings to start collecting them."
          />
        ) : (
          <section className="card card--pad0">
            <div className="table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Preferred slot</th>
                    <th>Reason</th>
                    <th>Status</th>
                    {canWrite && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="t-title">{a.customerName}</div>
                        <div className="t-sub">{a.email ?? a.phone ?? 'No contact on file'}</div>
                      </td>
                      <td>
                        {a.preferredDate} <span className="muted">{a.preferredTime}</span>
                      </td>
                      <td className="muted">{a.reason ?? '—'}</td>
                      <td>
                        <StatusTag status={a.status} />
                      </td>
                      {canWrite && (
                        <td>
                          <AppointmentActions
                            status={a.status}
                            onTransition={(next) => act.mutate({ id: a.id, next })}
                          />
                        </td>
                      )}
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
