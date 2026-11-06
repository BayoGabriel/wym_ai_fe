import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';
import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';
import { Modal } from '../../../shared/components/Modal';

const FALLBACK_PRODUCTS = ['WYMASSIST', 'WYMINSIGHT', 'WYMFLOW'];
const STATUSES = ['trialing', 'active', 'suspended', 'cancelled', 'expired'];

const today = () => new Date().toISOString().slice(0, 10);

export function SubscriptionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const orgs = useQuery({
    queryKey: ['admin', 'orgs'],
    queryFn: adminApi.listOrganizations,
    enabled: open,
  });
  const products = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: adminApi.listProducts,
    enabled: open,
  });

  const [orgId, setOrgId] = useState('');
  const [product, setProduct] = useState('');
  const [status, setStatus] = useState('trialing');
  const [startAt, setStartAt] = useState(today);
  const [endAt, setEndAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const productOptions = (products.data ?? [])
    .filter((p) => p.active)
    .map((p) => ({ code: p.code, name: p.name }));
  const options = productOptions.length
    ? productOptions
    : FALLBACK_PRODUCTS.map((code) => ({ code, name: code }));
  const selectedProduct = product || options[0]?.code || '';

  const create = useMutation({
    mutationFn: () =>
      adminApi.createSubscription({
        organizationId: orgId,
        productCode: selectedProduct,
        status,
        startAt: startAt ? new Date(startAt).toISOString() : undefined,
        endAt: endAt ? new Date(endAt).toISOString() : null,
      }),
    onSuccess: () => {
      setError(null);
      setOrgId('');
      setEndAt('');
      setStatus('trialing');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <Modal
      open={open}
      title="New subscription"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="subscription-form" loading={create.isPending}>
            Create subscription
          </Button>
        </>
      }
    >
      <form id="subscription-form" onSubmit={submit}>
        {error && <Alert kind="error">{error}</Alert>}

        <label className="field">
          <span className="field__label">Organization</span>
          <select
            className="input"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            required
            disabled={orgs.isPending}
          >
            <option value="">
              {orgs.isPending ? 'Loading organizations…' : 'Select an organization…'}
            </option>
            {(orgs.data ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {orgs.isError && <span className="field__error">{orgs.error.message}</span>}
        </label>

        <div className="field">
          <span className="field__label">Product</span>
          <div className="choice-grid">
            {options.map((p) => (
              <button
                key={p.code}
                type="button"
                className={`choice-card${selectedProduct === p.code ? ' selected' : ''}`}
                onClick={() => setProduct(p.code)}
              >
                <span className="choice-name">{p.name}</span>
                <span className="choice-code">{p.code}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field__label">Initial status</span>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Starts</span>
            <input
              type="date"
              className="input"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Ends</span>
            <input
              type="date"
              className="input"
              value={endAt}
              min={startAt || undefined}
              onChange={(e) => setEndAt(e.target.value)}
            />
            <span className="field__hint">Leave empty for an open-ended subscription.</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
