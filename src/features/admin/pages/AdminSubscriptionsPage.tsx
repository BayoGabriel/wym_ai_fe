import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { StatusTag } from '../../assist/components/StatusTag';
import { SubscriptionForm } from '../components/SubscriptionForm';

const STATUSES = ['trialing', 'active', 'suspended', 'cancelled', 'expired'];

export function AdminSubscriptionsPage() {
  useDocumentTitle('Subscriptions');
  const queryClient = useQueryClient();
  const subs = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: adminApi.listSubscriptions,
  });
  const patch = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateSubscription(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  });

  return (
    <>
      <PageHeader title="Subscriptions" subtitle="Product subscription lifecycle per client." />
      {patch.isError && <Alert kind="error">{patch.error.message}</Alert>}
      {subs.isPending && <LoadingState label="Loading subscriptions…" />}
      {subs.isError && <ErrorState message={subs.error.message} />}
      {subs.data && (
        <section className="card card--pad0">
          <div className="table-wrap">
            <table className="ops-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Product</th>
                <th>Status</th>
                <th>Ends</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subs.data.map((s) => (
                <tr key={s.id} style={{ cursor: 'default' }}>
                  <td>{s.organizationName ?? s.organizationId}</td>
                  <td className="muted">{s.productCode}</td>
                  <td>
                    <StatusTag status={s.status.toUpperCase()} />
                  </td>
                  <td className="muted">
                    {s.endAt ? new Date(s.endAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="pill-list">
                      {STATUSES.filter((x) => x !== s.status).map((x) => (
                        <button
                          key={x}
                          className="pill"
                          onClick={() => patch.mutate({ id: s.id, status: x })}
                        >
                          {x}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {subs.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted" style={{ padding: 'var(--space-4)' }}>
                    No subscriptions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </section>
      )}
      <SubscriptionForm />
    </>
  );
}
