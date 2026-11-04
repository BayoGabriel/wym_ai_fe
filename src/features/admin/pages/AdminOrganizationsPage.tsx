import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { StatusTag } from '../../assist/components/StatusTag';
import { OrgCreateForm } from '../components/OrgCreateForm';

const PRODUCTS = ['WYMASSIST', 'WYMINSIGHT', 'WYMFLOW'];

export function AdminOrganizationsPage() {
  useDocumentTitle('Client accounts');
  const queryClient = useQueryClient();
  const orgs = useQuery({ queryKey: ['admin', 'orgs'], queryFn: adminApi.listOrganizations });
  const [error, setError] = useState<string | null>(null);

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] }),
    onError: (e) => setError(e.message),
  });

  return (
    <>
      <PageHeader title="Client accounts" subtitle="Every organization on the platform." />
      {error && <Alert kind="error">{error}</Alert>}
      {orgs.isPending && <LoadingState label="Loading organizations…" />}
      {orgs.isError && <ErrorState message={orgs.error.message} />}
      {orgs.data && (
        <section className="card card--pad0">
          <div className="table-wrap">
            <table className="ops-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.data.map((o) => (
                <tr key={o.id} style={{ cursor: 'default' }}>
                  <td>
                    <div className="t-title">{o.name}</div>
                    <div className="t-sub mono">{o.slug}</div>
                  </td>
                  <td>
                    <StatusTag status={o.status.toUpperCase()} />
                  </td>
                  <td className="muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="pill-list">
                      <button
                        className="pill"
                        onClick={() =>
                          act.mutate(() =>
                            adminApi.setOrganizationStatus(
                              o.id,
                              o.status === 'active' ? 'suspended' : 'active'
                            )
                          )
                        }
                      >
                        {o.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      {PRODUCTS.map((p) => (
                        <button
                          key={p}
                          className="pill"
                          onClick={() => act.mutate(() => adminApi.assignProduct(o.id, p))}
                        >
                          +{p.replace('WYM', '')}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}
      <OrgCreateForm />
    </>
  );
}
