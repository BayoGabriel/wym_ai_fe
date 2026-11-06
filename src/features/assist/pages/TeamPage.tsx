import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import type { StaffUser } from '../api/assist-api';
import { assistKeys, assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Alert } from '../../../shared/components/Alert';
import { ErrorState } from '../../../shared/components/States';
import { TableSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { useAuth } from '../../../app/providers/auth-context';
import { StatusTag } from '../components/StatusTag';
import { StaffForm } from '../components/StaffForm';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
}

function RoleTags({ roles, scopes }: { roles: string[]; scopes: Map<string, string> }) {
  if (!roles.length) return <span className="faint">—</span>;
  return (
    <span className="role-tags">
      {roles.map((r) => (
        <span
          key={r}
          className={`role-tag${scopes.get(r) === 'platform' ? ' role-tag--platform' : ''}`}
        >
          {r}
        </span>
      ))}
    </span>
  );
}

export function TeamPage() {
  useDocumentTitle('Team');
  const { user } = useAuth();
  const canCreate = useCan('user.create');
  const canUpdate = useCan('user.update');
  const queryClient = useQueryClient();
  const users = useQuery(assistQueries.users);
  const roles = useQuery(assistQueries.roles);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'suspended'>('all');

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      assistApi.updateUser(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assistKeys.users }),
  });

  const roleScopes = useMemo(
    () => new Map((roles.data ?? []).map((r) => [r.name, r.scope])),
    [roles.data]
  );
  const isPlatformViewer = !!user?.roles?.some((r) => r.scope === 'platform');
  const assignableRoles = useMemo(
    () =>
      (roles.data ?? []).filter(
        (r) => r.scope === 'organization' || isPlatformViewer || r.scope !== 'platform'
      ),
    [roles.data, isPlatformViewer]
  );

  const members = useMemo(() => users.data ?? [], [users.data]);
  const counts = useMemo(() => {
    const active = members.filter((m) => m.status === 'active').length;
    const platform = members.filter((m) =>
      m.roles.some((r) => roleScopes.get(r) === 'platform')
    ).length;
    return { total: members.length, active, suspended: members.length - active, platform };
  }, [members, roleScopes]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter(
        (m) =>
          (status === 'all' || m.status === status) &&
          (!q ||
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.roles.some((r) => r.toLowerCase().includes(q)))
      )
      .sort((a, b) => {
        const platform = (m: StaffUser) =>
          m.roles.some((r) => roleScopes.get(r) === 'platform') ? 0 : 1;
        return platform(a) - platform(b) || a.name.localeCompare(b.name);
      });
  }, [members, query, status, roleScopes]);

  const orgRole = (m: StaffUser) =>
    m.roles.find((r) => roleScopes.get(r) !== 'platform') ?? '';

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Staff who can sign in and work in this dashboard — their roles decide what they can see and do."
      />
      {patch.isError && <Alert kind="error">{patch.error.message}</Alert>}

      {users.data && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{counts.total}</div>
            <div className="stat-label">Members</div>
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
            <div className="stat-value">{counts.platform}</div>
            <div className="stat-label">Platform admins</div>
          </div>
        </div>
      )}

      <div className={canCreate ? 'split split--right' : undefined}>
        <div>
          {users.isPending && <TableSkeleton />}
          {users.isError && <ErrorState message={users.error.message} />}
          {users.data && (
            <>
              <div className="toolbar">
                <input
                  className="input"
                  placeholder="Search name, email, or role…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search members"
                />
                <div className="toolbar-end pill-list">
                  {(['all', 'active', 'suspended'] as const).map((s) => (
                    <button
                      key={s}
                      className={`pill${status === s ? ' on' : ''}`}
                      onClick={() => setStatus(s)}
                    >
                      {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Suspended'}
                    </button>
                  ))}
                </div>
              </div>

              {visible.length === 0 ? (
                <div className="card state-box">
                  <h3>No members match</h3>
                  <p>Try a different search or clear the status filter.</p>
                </div>
              ) : (
                <section className="card card--pad0">
                  <div className="table-wrap">
                    <table className="ops-table">
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Roles</th>
                          <th>Status</th>
                          <th>Joined</th>
                          {canUpdate && <th style={{ textAlign: 'right' }}>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((u) => {
                          const isSelf = u.id === user?.id;
                          const hasPlatformRole = u.roles.some(
                            (r) => roleScopes.get(r) === 'platform'
                          );
                          const busy = patch.isPending && patch.variables?.id === u.id;
                          return (
                            <tr key={u.id} style={{ cursor: 'default' }}>
                              <td>
                                <div className="member-cell">
                                  <span
                                    className={`avatar${hasPlatformRole ? ' avatar--platform' : ''}`}
                                    aria-hidden
                                  >
                                    {initials(u.name)}
                                  </span>
                                  <span>
                                    <span className="t-title">
                                      {u.name}
                                      {isSelf && <span className="faint"> (you)</span>}
                                    </span>
                                    <span className="t-sub">{u.email}</span>
                                  </span>
                                </div>
                              </td>
                              <td>
                                <RoleTags roles={u.roles} scopes={roleScopes} />
                              </td>
                              <td>
                                <StatusTag status={u.status.toUpperCase()} />
                              </td>
                              <td className="muted">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              {canUpdate && (
                                <td>
                                  {!isSelf && (
                                    <div className="member-actions">
                                      <select
                                        className="role-select"
                                        value={orgRole(u)}
                                        disabled={busy}
                                        aria-label={`Role for ${u.name}`}
                                        onChange={(e) =>
                                          patch.mutate({
                                            id: u.id,
                                            body: { roleName: e.target.value || null },
                                          })
                                        }
                                      >
                                        <option value="">No role</option>
                                        {assignableRoles.map((r) => (
                                          <option key={r.id} value={r.name}>
                                            {r.name}
                                          </option>
                                        ))}
                                        {!assignableRoles.some((r) => r.name === orgRole(u)) &&
                                          orgRole(u) && (
                                            <option value={orgRole(u)}>{orgRole(u)}</option>
                                          )}
                                      </select>
                                      <button
                                        className="pill"
                                        disabled={busy}
                                        onClick={() =>
                                          patch.mutate({
                                            id: u.id,
                                            body: {
                                              status:
                                                u.status === 'active' ? 'suspended' : 'active',
                                            },
                                          })
                                        }
                                      >
                                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
        {canCreate && <StaffForm />}
      </div>
    </>
  );
}
