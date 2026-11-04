import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import type { IntakeField } from '../api/assist-api';
import { assistKeys, assistQueries } from '../queries';
import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState } from '../../../shared/components/States';

export function IntakeFieldsEditor() {
  const queryClient = useQueryClient();
  const query = useQuery(assistQueries.config);
  const [fields, setFields] = useState<IntakeField[] | null>(null);
  const [draft, setDraft] = useState<IntakeField>({ key: '', label: '', type: 'text' });

  const items = fields ?? query.data?.intakeFields ?? [];

  const save = useMutation({
    mutationFn: (next: IntakeField[]) => assistApi.patchAssistantConfig({ intakeFields: next }),
    onSuccess: () => {
      setFields(null);
      void queryClient.invalidateQueries({ queryKey: assistKeys.config });
    },
  });

  if (query.isPending) return <LoadingState label="Loading intake fields…" />;

  const update = (next: IntakeField[]) => {
    setFields(next);
    save.mutate(next);
  };

  const addField = () => {
    if (!draft.key.trim() || !draft.label.trim()) return;
    update([...items, { ...draft, options: draft.options?.filter(Boolean) }]);
    setDraft({ key: '', label: '', type: 'text' });
  };

  return (
    <section className="card">
      <h2 className="section-title">Custom intake fields</h2>
      <p className="muted">
        Extra questions the assistant collects during lead capture — e.g. a school can ask for a
        course of interest.
      </p>
      {save.isError && <Alert kind="error">{save.error.message}</Alert>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((f, i) => (
          <li
            key={f.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--space-2) 0',
            }}
          >
            <span>
              {f.label} <code className="muted">({f.key})</code> — {f.type}
              {f.required ? ' · required' : ''}
              {f.options?.length ? ` · ${f.options.join(', ')}` : ''}
            </span>
            <button className="pill" onClick={() => update(items.filter((_, j) => j !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="form-grid" style={{ marginTop: 'var(--space-3)' }}>
        <input
          className="input"
          placeholder="key (snake_case)"
          value={draft.key}
          onChange={(e) => setDraft({ ...draft, key: e.target.value })}
        />
        <input
          className="input"
          placeholder="Label shown to visitor"
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
        />
        <select
          className="input"
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value as IntakeField['type'] })}
        >
          <option value="text">Text</option>
          <option value="select">Select</option>
          <option value="checkbox">Checkbox</option>
        </select>
        {draft.type === 'select' && (
          <input
            className="input"
            placeholder="Options (comma separated)"
            value={(draft.options ?? []).join(', ')}
            onChange={(e) =>
              setDraft({ ...draft, options: e.target.value.split(',').map((o) => o.trim()) })
            }
          />
        )}
        <label style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={!!draft.required}
            onChange={(e) => setDraft({ ...draft, required: e.target.checked })}
          />
          Required
        </label>
      </div>
      <Button variant="secondary" onClick={addField} style={{ marginTop: 'var(--space-3)' }}>
        Add field
      </Button>
    </section>
  );
}
