import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { adminApi } from '../api/admin-api';
import type { AdminOrganization } from '../api/admin-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Button } from '../../../shared/components/Button';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useToast } from '../../../shared/components/toast-context';
import { StatusTag } from '../../assist/components/StatusTag';
import { RegisterClientModal } from '../components/RegisterClientModal';
import '../../assist/styles/leads.css';

type PendingAction =
  | { kind: 'suspend' | 'activate'; org: AdminOrganization }
  | { kind: 'delete'; org: AdminOrganization };

const STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting setup',
  active: 'Active',
  suspended: 'Suspended',
  archived: 'Archived',
};

export function AdminOrganizationsPage() {
  useDocumentTitle('Clients');
  const queryClient = useQueryClient();
  const toast = useToast();
  const orgs = useQuery({ queryKey: ['admin', 'orgs'], queryFn: () => adminApi.listOrganizations() });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'usage'] });
      if (pending?.kind === 'delete') {
        toast({ title: `${pending.org.name} deleted`, kind: 'success' });
      } else if (pending) {
        toast({
          title:
            pending.kind === 'suspend'
              ? `${pending.org.name} suspended — their team can't sign in`
              : `${pending.org.name} is active again`,
          kind: 'success',
        });
      }
      setPending(null);
    },
    onError: (e) =>
      toast({ title: 'Action failed', description: e.message, kind: 'error' }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const data = orgs.data ?? [];
    return data.filter(
      (o) =>
        (!statusFilter || o.status === statusFilter) &&
        (!q || o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q))
    );
  }, [orgs.data, search, statusFilter]);

  const counts = useMemo(() => {
    const data = orgs.data ?? [];
    return {
      total: data.length,
      active: data.filter((o) => o.status === 'active').length,
      suspended: data.filter((o) => o.status === 'suspended').length,
      other: data.filter((o) => !['active', 'suspended'].includes(o.status)).length,
    };
  }, [orgs.data]);

  const runPending = () => {
    if (!pending) return;
    if (pending.kind === 'delete') {
      act.mutate(() => adminApi.deleteOrganization(pending.org.id));
    } else {
      act.mutate(() =>
        adminApi.setOrganizationStatus(
          pending.org.id,
          pending.kind === 'suspend' ? 'suspended' : 'active'
        )
      );
    }
  };

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Every business on your platform — open one to see its details, settings and activity."
        actions={<Button onClick={() => setRegisterOpen(true)}>+ Register a client</Button>}
      />
      {orgs.isPending && <LoadingState label="Loading clients…" />}
      {orgs.isError && <ErrorState message={orgs.error.message} />}
      {orgs.data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{counts.total}</div>
              <div className="stat-label">Total clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{counts.active}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{counts.suspended}</div>
              <div className="stat-label">Suspended</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{counts.other}</div>
              <div className="stat-label">Awaiting setup / archived</div>
            </div>
          </div>

          <section className="card card--pad0">
            <div className="card-head" style={{ padding: 'var(--space-3) var(--space-4) 0' }}>
              <h2>All clients</h2>
              <select
                className="status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Status filter"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
              <div className="leads-search">
                <Search size={13} />
                <input
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search clients"
                />
              </div>
            </div>
            <div className="table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="num">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} style={{ cursor: 'default' }}>
                      <td>
                        <div className="t-title">
                          <Link to={`/dashboard/admin/organizations/${o.id}`}>{o.name}</Link>
                        </div>
                        <div className="t-sub mono">{o.slug}</div>
                      </td>
                      <td>
                        <StatusTag status={o.status.toUpperCase()} />
                        <div className="t-sub">{STATUS_LABELS[o.status] ?? o.status}</div>
                      </td>
                      <td className="muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="num">
                        <div className="pill-list" style={{ justifyContent: 'flex-end' }}>
                          <Link
                            className="pill"
                            to={`/dashboard/admin/organizations/${o.id}`}
                          >
                            Manage
                          </Link>
                          {o.status === 'archived' ? null : (
                            <button
                              className="pill"
                              onClick={() =>
                                setPending({
                                  kind: o.status === 'active' ? 'suspend' : 'activate',
                                  org: o,
                                })
                              }
                            >
                              {o.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                          <button
                            className="pill pill--danger"
                            onClick={() => setPending({ kind: 'delete', org: o })}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="state-box">
                          <h3>{search ? 'No clients match your search' : 'No clients yet'}</h3>
                          <p>
                            {search
                              ? 'Try a different name.'
                              : 'Register your first client to give them access to the platform.'}
                          </p>
                          {!search && (
                            <Button onClick={() => setRegisterOpen(true)}>
                              + Register a client
                            </Button>
                          )}
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

      <RegisterClientModal open={registerOpen} onClose={() => setRegisterOpen(false)} />

      <ConfirmDialog
        open={pending?.kind === 'suspend' || pending?.kind === 'activate'}
        title={
          pending?.kind === 'suspend'
            ? `Suspend ${pending.org.name}?`
            : `Activate ${pending?.org.name}?`
        }
        body={
          pending?.kind === 'suspend' ? (
            <p>
              Everyone at <strong>{pending?.org.name}</strong> will immediately lose access —
              their assistant stops answering and their team can't sign in until you
              re-activate the account. Nothing is deleted.
            </p>
          ) : (
            <p>
              <strong>{pending?.org.name}</strong> and their team will regain full access
              right away.
            </p>
          )
        }
        confirmLabel={pending?.kind === 'suspend' ? 'Suspend account' : 'Activate account'}
        danger={pending?.kind === 'suspend'}
        loading={act.isPending}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending?.kind === 'delete'}
        title={`Delete ${pending?.org.name} permanently?`}
        body={
          <p>
            This permanently removes <strong>{pending?.org.name}</strong> — their users,
            conversations, leads, knowledge and settings.{' '}
            <strong>This can't be undone.</strong> If you only want to cut off access, suspend
            the account instead.
          </p>
        }
        confirmLabel="Delete permanently"
        danger
        loading={act.isPending}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
