import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
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

export function TeamPage() {
  useDocumentTitle('Team');
  const { user } = useAuth();
  const canCreate = useCan('user.create');
  const canUpdate = useCan('user.update');
  const queryClient = useQueryClient();
  const users = useQuery(assistQueries.users);
  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      assistApi.updateUser(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assistKeys.users }),
  });

  return (
    <>
      <PageHeader
        title="Team"
        subtitle={`Staff who can operate the assistant and dashboard${users.data ? ` — ${users.data.length} members` : ''}.`}
      />
      {patch.isError && <Alert kind="error">{patch.error.message}</Alert>}
      <div className="split split--right">
        <div>
          {users.isPending && <TableSkeleton />}
          {users.isError && <ErrorState message={users.error.message} />}
          {users.data && (
            <section className="card card--pad0">
              <div className="table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Roles</th>
                      <th>Status</th>
                      <th>Joined</th>
                      {canUpdate && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {users.data.map((u) => (
                      <tr key={u.id} style={{ cursor: 'default' }}>
                        <td>
                          <div className="t-title">
                            {u.name}
                            {u.id === user?.id && <span className="faint"> (you)</span>}
                          </div>
                          <div className="t-sub">{u.email}</div>
                        </td>
                        <td className="muted">{u.roles.join(', ') || '—'}</td>
                        <td>
                          <StatusTag status={u.status.toUpperCase()} />
                        </td>
                        <td className="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                        {canUpdate && (
                          <td>
                            {u.id !== user?.id && (
                              <button
                                className="pill"
                                onClick={() =>
                                  patch.mutate({
                                    id: u.id,
                                    body: {
                                      status: u.status === 'active' ? 'suspended' : 'active',
                                    },
                                  })
                                }
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
        {canCreate && <StaffForm />}
      </div>
    </>
  );
}
