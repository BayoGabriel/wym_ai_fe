import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import type { AssistantConfig } from '../api/assist-api';
import { assistKeys } from '../queries';
import { adminApi, adminKeys } from '../../admin/api/admin-api';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { PresetSelectField } from '../../../shared/components/PresetSelectField';
import { OPERATING_HOURS_OPTIONS, TONE_OPTIONS } from '../data/presets';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState } from '../../../shared/components/States';

const FLAGS: { key: keyof AssistantConfig; label: string }[] = [
  { key: 'publicChatEnabled', label: 'Public website chat' },
  { key: 'leadCaptureEnabled', label: 'Lead capture' },
  { key: 'escalationEnabled', label: 'Human escalation' },
  { key: 'appointmentRequestsEnabled', label: 'Appointment requests' },
  { key: 'notifyOnLead', label: 'Notify on new lead' },
  { key: 'notifyOnHandoff', label: 'Notify on handoff request' },
  { key: 'notifyOnAppointment', label: 'Notify on appointment request' },
];

export function AssistantConfigForm({ orgId }: { orgId?: string } = {}) {
  const query = useQuery({
    queryKey: orgId ? adminKeys.orgOverview(orgId) : assistKeys.config,
    queryFn: async () =>
      orgId
        ? (await adminApi.getOrgOverview(orgId)).assistConfig
        : assistApi.getAssistantConfig(),
  });
  if (query.isPending) return <LoadingState label="Loading configuration…" />;
  return <ConfigFormInner initial={query.data ?? {}} orgId={orgId} />;
}

function ConfigFormInner({ initial, orgId }: { initial: AssistantConfig; orgId?: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AssistantConfig>(initial);
  const [origins, setOrigins] = useState((initial.allowedOrigins ?? []).join('\n'));

  const save = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        allowedOrigins: origins
          .split('\n')
          .map((o) => o.trim())
          .filter(Boolean),
      };
      return orgId ? adminApi.patchAssistConfig(orgId, body) : assistApi.patchAssistantConfig(body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orgId ? adminKeys.orgOverview(orgId) : assistKeys.config,
      });
      if (orgId) {
        void queryClient.invalidateQueries({ queryKey: adminKeys.orgAudit(orgId) });
      }
    },
  });

  return (
    <form
      className="card"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <h2 className="section-title">Assistant configuration</h2>
      {save.isError && <Alert kind="error">{save.error.message}</Alert>}
      {save.isSuccess && <Alert kind="success">Saved.</Alert>}
      <div className="form-grid">
        <TextField
          label="Assistant name"
          value={form.assistantName ?? ''}
          onChange={(e) => setForm({ ...form, assistantName: e.target.value })}
        />
        <PresetSelectField
          label="Chatbot personality"
          value={form.tone ?? ''}
          options={TONE_OPTIONS}
          onChange={(tone) => setForm({ ...form, tone })}
          customPlaceholder="e.g. warm and witty"
          hint="Sets the assistant's tone of voice — pick a preset or choose Custom…"
        />
        <PresetSelectField
          label="Operating hours"
          value={form.operatingHours ?? ''}
          options={OPERATING_HOURS_OPTIONS}
          onChange={(operatingHours) => setForm({ ...form, operatingHours })}
          customPlaceholder="e.g. Mon–Fri 09:00–17:00"
        />
        <TextField
          label="Notification email"
          type="email"
          value={form.notificationEmail ?? ''}
          onChange={(e) => setForm({ ...form, notificationEmail: e.target.value })}
          hint="Additional mailbox for alerts — all team members are always notified too"
        />
      </div>
      <label className="field">
        <span className="field__label">Welcome message</span>
        <textarea
          className="input"
          rows={2}
          value={form.welcomeMessage ?? ''}
          onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field__label">Allowed origins (one per line)</span>
        <textarea
          className="input"
          rows={3}
          placeholder="https://example.com"
          value={origins}
          onChange={(e) => setOrigins(e.target.value)}
        />
        <span className="field__hint">
          Only these websites may embed the assistant. Leave empty to allow any.
        </span>
      </label>
      <div className="form-grid">
        {FLAGS.map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={!!form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>
      <Button type="submit" loading={save.isPending} style={{ marginTop: 'var(--space-4)' }}>
        Save configuration
      </Button>
    </form>
  );
}
