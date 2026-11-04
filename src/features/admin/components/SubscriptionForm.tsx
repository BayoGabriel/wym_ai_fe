import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';
import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';

const PRODUCTS = ['WYMASSIST', 'WYMINSIGHT', 'WYMFLOW'];

export function SubscriptionForm() {
  const queryClient = useQueryClient();
  const orgs = useQuery({ queryKey: ['admin', 'orgs'], queryFn: adminApi.listOrganizations });
  const [orgId, setOrgId] = useState('');
  const [product, setProduct] = useState('WYMASSIST');
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => adminApi.createSubscription({ organizationId: orgId, productCode: product }),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
    onError: (e) => setError(e.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="section-title">New subscription</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <div className="form-grid">
        <label className="field">
          <span className="field__label">Organization</span>
          <select
            className="input"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {(orgs.data ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Product</span>
          <select className="input" value={product} onChange={(e) => setProduct(e.target.value)}>
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button type="submit" loading={create.isPending} style={{ marginTop: 'var(--space-3)' }}>
        Create subscription
      </Button>
    </form>
  );
}
