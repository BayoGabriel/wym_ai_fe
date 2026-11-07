import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin-api';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Alert } from '../../../shared/components/Alert';
import { Modal } from '../../../shared/components/Modal';
import { useToast } from '../../../shared/components/toast-context';

export function RegisterClientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const products = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: adminApi.listProducts,
    enabled: open,
  });

  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(['WYMASSIST']));
  const [error, setError] = useState<string | null>(null);

  const toggle = (code: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const register = useMutation({
    mutationFn: () =>
      adminApi.registerClient({
        name: name.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        productCodes: [...selected],
      }),
    onSuccess: (r) => {
      setError(null);
      setName('');
      setContactName('');
      setContactEmail('');
      setSelected(new Set(['WYMASSIST']));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      toast({
        title: `${r.organization.name} registered`,
        description: r.inviteSent
          ? `Invite email sent to ${r.invitedEmail}.`
          : `Account created but the invite email to ${r.invitedEmail} could not be sent — resend it later.`,
        kind: r.inviteSent ? 'success' : 'warning',
      });
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    register.mutate();
  };

  return (
    <Modal
      open={open}
      title="Register a new client"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={register.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="register-client-form" loading={register.isPending}>
            Create account &amp; send invite
          </Button>
        </>
      }
    >
      <form id="register-client-form" onSubmit={submit}>
        <p className="muted" style={{ marginTop: 0 }}>
          We'll email the contact person a link to set their password and activate their
          account. They sign in as the organization's administrator.
        </p>
        {error && <Alert kind="error">{error}</Alert>}
        <div className="form-grid">
          <TextField
            label="Business name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bright Dental Clinic"
            required
          />
          <TextField
            label="Contact person"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Ada Lovelace"
            required
          />
        </div>
        <TextField
          label="Contact email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          hint="The invite link is sent here — this becomes their sign-in email."
          required
        />
        <div className="field">
          <span className="field__label">Products to include</span>
          <div className="choice-grid">
            {(products.data ?? []).map((p) => (
              <button
                key={p.code}
                type="button"
                className={`choice-card${selected.has(p.code) ? ' selected' : ''}`}
                onClick={() => toggle(p.code)}
                aria-pressed={selected.has(p.code)}
              >
                <span className="choice-name">{p.name}</span>
                <span className="choice-code">
                  {selected.has(p.code) ? 'Included — 14-day trial' : 'Not included'}
                </span>
              </button>
            ))}
            {products.isPending && <p className="muted">Loading products…</p>}
          </div>
          <span className="field__hint">
            Each included product starts a 14-day trial subscription you can adjust later.
          </span>
        </div>
      </form>
    </Modal>
  );
}
