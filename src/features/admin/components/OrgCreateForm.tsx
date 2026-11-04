import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Alert } from '../../../shared/components/Alert';

export function OrgCreateForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', slug: '' });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => adminApi.createOrganization({ ...form, status: 'active' }),
    onSuccess: () => {
      setForm({ name: '', slug: '' });
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
    },
    onError: (e) => setError(e.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="section-title">Create client account</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <div className="form-grid">
        <TextField
          label="Business name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <TextField
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          hint="Used in the widget embed and public API"
          required
        />
      </div>
      <Button type="submit" loading={create.isPending} style={{ marginTop: 'var(--space-3)' }}>
        Create account
      </Button>
    </form>
  );
}
