import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { flowApi } from '../api';
import type { FlowDefinition } from '../api';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Alert } from '../../../shared/components/Alert';

// Renders a dynamic form from a workflow definition's field spec.
export function SubmissionForm({
  definitions,
  onDone,
}: {
  definitions: FlowDefinition[];
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const active = definitions.filter((d) => d.active);
  const [definitionId, setDefinitionId] = useState(active[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const definition = active.find((d) => d.id === definitionId);

  const submit = useMutation({
    mutationFn: () => flowApi.submitInstance({ definitionId, title, data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow', 'instances'] });
      onDone();
    },
    onError: (e) => setError(e.message),
  });

  const handle = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    submit.mutate();
  };

  const set = (key: string, v: unknown) => setValues((prev) => ({ ...prev, [key]: v }));

  if (!active.length) {
    return <p className="muted">Create a workflow definition first.</p>;
  }

  return (
    <form className="card" onSubmit={handle}>
      <h2 className="section-title">New submission</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <label className="field">
        <span className="field__label">Workflow</span>
        <select
          className="input"
          value={definitionId}
          onChange={(e) => {
            setDefinitionId(e.target.value);
            setValues({});
          }}
        >
          {active.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      {definition?.fields.map((f) => {
        if (f.type === 'select') {
          return (
            <label className="field" key={f.key}>
              <span className="field__label">
                {f.label}
                {f.required ? ' *' : ''}
              </span>
              <select
                className="input"
                value={String(values[f.key] ?? '')}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="">—</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        if (f.type === 'checkbox') {
          return (
            <label
              className="field"
              key={f.key}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <input
                type="checkbox"
                checked={!!values[f.key]}
                onChange={(e) => set(f.key, e.target.checked)}
              />
              <span className="field__label">{f.label}</span>
            </label>
          );
        }
        if (f.type === 'textarea') {
          return (
            <label className="field" key={f.key}>
              <span className="field__label">
                {f.label}
                {f.required ? ' *' : ''}
              </span>
              <textarea
                className="input"
                rows={3}
                value={String(values[f.key] ?? '')}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </label>
          );
        }
        return (
          <TextField
            key={f.key}
            label={f.label + (f.required ? ' *' : '')}
            type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
            value={String(values[f.key] ?? '')}
            onChange={(e) =>
              set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)
            }
          />
        );
      })}
      <Button type="submit" loading={submit.isPending} style={{ marginTop: 'var(--space-4)' }}>
        Submit for approval
      </Button>
    </form>
  );
}
