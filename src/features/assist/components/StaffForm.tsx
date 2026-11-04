import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import type { Role } from '../api/assist-api';
import { assistKeys, assistQueries } from '../queries';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Alert } from '../../../shared/components/Alert';

export function StaffForm() {
  const queryClient = useQueryClient();
  const roles = useQuery(assistQueries.roles);
  const [form, setForm] = useState({ name: '', email: '', password: '', roleName: 'Client Staff' });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => assistApi.createUser(form),
    onSuccess: () => {
      setForm({ name: '', email: '', password: '', roleName: 'Client Staff' });
      setError(null);
      void queryClient.invalidateQueries({ queryKey: assistKeys.users });
    },
    onError: (e) => setError(e.message),
  });

  const orgRoles = (roles.data ?? []).filter((r: Role) => r.scope === 'organization');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="section-title">Add staff member</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <div className="form-grid">
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={8}
        />
        <label className="field">
          <span className="field__label">Role</span>
          <select
            className="input"
            value={form.roleName}
            onChange={(e) => setForm({ ...form, roleName: e.target.value })}
          >
            {orgRoles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button type="submit" loading={create.isPending} style={{ marginTop: 'var(--space-3)' }}>
        Add member
      </Button>
    </form>
  );
}
