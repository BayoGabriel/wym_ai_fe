import { Fragment, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { adminApi } from '../api/admin-api';
import type { Subscription } from '../api/admin-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { StatusTag } from '../../assist/components/StatusTag';
import { SubscriptionModal } from '../components/SubscriptionModal';

const STATUSES = ['trialing', 'active', 'suspended', 'cancelled', 'expired'];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
];

type OrgGroup = { orgId: string; name: string; subs: Subscription[] };

function statusSummary(subs: Subscription[]) {
  const counts = new Map<string, number>();
  for (const s of subs) counts.set(s.status, (counts.get(s.status) ?? 0) + 1);
  return [...counts.entries()].map(([s, n]) => `${n} ${s}`).join(' · ');
}

export function AdminSubscriptionsPage() {
  useDocumentTitle('Subscriptions');
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
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

  const groups = useMemo(() => {
    const filtered = (subs.data ?? []).filter(
      (s) => statusFilter === 'all' || s.status === statusFilter
    );
    const map = new Map<string, OrgGroup>();
    for (const s of filtered) {
      const g = map.get(s.organizationId);
      if (g) g.subs.push(s);
      else
        map.set(s.organizationId, {
          orgId: s.organizationId,
          name: s.organizationName ?? 'Unknown org',
          subs: [s],
        });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [subs.data, statusFilter]);

  const toggle = (orgId: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(orgId)) next.delete(orgId);
      else next.add(orgId);
      return next;
    });

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
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS}
                ariaLabel="Filter by status"
              />
            </div>
            <div className="table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Organization / product</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Ends</th>
                    <th className="num">Change status</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => {
                    const isCollapsed = collapsed.has(g.orgId);
                    return (
                      <Fragment key={g.orgId}>
                        <tr
                          className="group-row"
                          onClick={() => toggle(g.orgId)}
                          aria-expanded={!isCollapsed}
                        >
                          <td>
                            <div className="t-title group-title">
                              {isCollapsed ? (
                                <ChevronRight size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                              {g.name}
                            </div>
                            <div className="t-sub mono">
                              {g.orgId.slice(0, 8)}… · {g.subs.length} subscription
                              {g.subs.length === 1 ? '' : 's'}
                            </div>
                          </td>
                          <td colSpan={4} className="muted">
                            {statusSummary(g.subs)}
                          </td>
                        </tr>
                        {!isCollapsed &&
                          g.subs.map((s) => (
                            <tr key={s.id} className="sub-row" style={{ cursor: 'default' }}>
                              <td>
                                <span className="mono sub-indent">{s.productCode ?? '—'}</span>
                              </td>
                              <td>
                                <StatusTag status={s.status.toUpperCase()} />
                              </td>
                              <td className="muted">
                                {new Date(s.startAt).toLocaleDateString()}
                              </td>
                              <td className="muted">
                                {s.endAt
                                  ? new Date(s.endAt).toLocaleDateString()
                                  : 'Open-ended'}
                              </td>
                              <td className="num">
                                <Select
                                  size="sm"
                                  value={s.status}
                                  disabled={patch.isPending}
                                  onChange={(status) => patch.mutate({ id: s.id, status })}
                                  options={STATUS_OPTIONS.slice(1)}
                                  ariaLabel="Change subscription status"
                                />
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    );
                  })}
                  {groups.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="state-box">
                          <h3>
                            No subscriptions
                            {statusFilter !== 'all' ? ` with status “${statusFilter}”` : ''}
                          </h3>
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
