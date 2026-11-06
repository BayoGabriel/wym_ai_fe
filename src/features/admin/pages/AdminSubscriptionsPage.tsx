import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { StatusTag } from '../../assist/components/StatusTag';
import { SubscriptionModal } from '../components/SubscriptionModal';

const STATUSES = ['trialing', 'active', 'suspended', 'cancelled', 'expired'];

export function AdminSubscriptionsPage() {
  useDocumentTitle('Subscriptions');
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const subs = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: adminApi.listSubscriptions,
  });
  const patch = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateSubscription(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  });

  const counts = useMemo(() => {
    const data = subs.data ?? [];
    return {
      total: data.length,
      active: data.filter((s) => s.status === 'active').length,
      trialing: data.filter((s) => s.status === 'trialing').length,
      attention: data.filter((s) => ['suspended', 'cancelled', 'expired'].includes(s.status))
        .length,
    };
  }, [subs.data]);

  const filtered = useMemo(
    () =>
      (subs.data ?? []).filter((s) => statusFilter === 'all' || s.status === statusFilter),
    [subs.data, statusFilter]
  );

  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle="Product subscription lifecycle per client."
        actions={<Button onClick={() => setModalOpen(true)}>+ New subscription</Button>}
      />
      {patch.isError && <Alert kind="error">{patch.error.message}</Alert>}
      {subs.isPending && <LoadingState label="Loading subscriptions…" />}
      {subs.isError && <ErrorState message={subs.error.message} />}
      {subs.data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{counts.total}</div>
              <div className="stat-label">Total subscriptions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{counts.active}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{counts.trialing}</div>
              <div className="stat-label">Trialing</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{counts.attention}</div>
              <div className="stat-label">Suspended / cancelled / expired</div>
            </div>
          </div>

          <section className="card card--pad0">
            <div className="card-head" style={{ padding: 'var(--space-3) var(--space-4) 0' }}>
              <h2>All subscriptions</h2>
              <select
                className="input status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Ends</th>
                    <th className="num">Change status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} style={{ cursor: 'default' }}>
                      <td>
                        <div className="t-title">{s.organizationName ?? 'Unknown org'}</div>
                        <div className="t-sub mono">{s.organizationId.slice(0, 8)}…</div>
                      </td>
                      <td>
                        <span className="mono">{s.productCode ?? '—'}</span>
                      </td>
                      <td>
                        <StatusTag status={s.status.toUpperCase()} />
                      </td>
                      <td className="muted">{new Date(s.startAt).toLocaleDateString()}</td>
                      <td className="muted">
                        {s.endAt ? new Date(s.endAt).toLocaleDateString() : 'Open-ended'}
                      </td>
                      <td className="num">
                        <select
                          className="status-select"
                          value={s.status}
                          disabled={patch.isPending}
                          onChange={(e) => patch.mutate({ id: s.id, status: e.target.value })}
                          aria-label="Change subscription status"
                        >
                          {STATUSES.map((x) => (
                            <option key={x} value={x}>
                              {x.charAt(0).toUpperCase() + x.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="state-box">
                          <h3>No subscriptions{statusFilter !== 'all' ? ` with status “${statusFilter}”` : ''}</h3>
                          <p>Create one to grant an organization product access.</p>
                          <Button onClick={() => setModalOpen(true)}>+ New subscription</Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      <SubscriptionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
