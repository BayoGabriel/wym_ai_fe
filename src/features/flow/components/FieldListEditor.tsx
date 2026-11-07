import { useState } from 'react';
import type { FlowField } from '../api';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Select } from '../../../shared/components/Select';

const TYPES: FlowField['type'][] = ['text', 'textarea', 'number', 'date', 'select', 'checkbox'];

export function FieldListEditor({
  fields,
  onChange,
}: {
  fields: FlowField[];
  onChange: (fields: FlowField[]) => void;
}) {
  const [draft, setDraft] = useState<FlowField>({ key: '', label: '', type: 'text' });
  const [options, setOptions] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    setError(null);
    const key = draft.key.trim();
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(key)) {
      setError('Key must be snake_case (lowercase letters, digits, underscores).');
      return;
    }
    if (!draft.label.trim()) {
      setError('Label is required.');
      return;
    }
    if (fields.some((f) => f.key === key)) {
      setError('A field with this key already exists.');
      return;
    }
    const field: FlowField = { ...draft, key, label: draft.label.trim() };
    if (field.type === 'select') {
      field.options = options
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      if (!field.options.length) {
        setError('Select fields need at least one option.');
        return;
      }
    } else {
      delete field.options;
    }
    onChange([...fields, field]);
    setDraft({ key: '', label: '', type: 'text' });
    setOptions('');
  };

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {fields.map((f, i) => (
          <li
            key={f.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-2) 0',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span>
              {f.label} <code className="muted">({f.key})</code> — {f.type}
              {f.required ? ' · required' : ''}
              {f.options?.length ? ` · ${f.options.length} options` : ''}
            </span>
            <button
              type="button"
              className="pill"
              onClick={() => onChange(fields.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      <div className="form-grid" style={{ marginTop: 'var(--space-3)' }}>
        <TextField
          label="Key"
          value={draft.key}
          onChange={(e) => setDraft({ ...draft, key: e.target.value })}
          placeholder="invoice_amount"
        />
        <TextField
          label="Label"
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          placeholder="Invoice amount"
        />
        <div className="field">
          <span className="field__label">Type</span>
          <Select
            value={draft.type}
            onChange={(t) => setDraft({ ...draft, type: t as FlowField['type'] })}
            ariaLabel="Field type"
            options={TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>
        {draft.type === 'select' && (
          <TextField
            label="Options (comma-separated)"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Small, Medium, Large"
          />
        )}
        <label className="field" style={{ justifyContent: 'flex-end' }}>
          <span style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={!!draft.required}
              onChange={(e) => setDraft({ ...draft, required: e.target.checked })}
            />
            Required
          </span>
        </label>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={add}
        style={{ marginTop: 'var(--space-2)' }}
      >
        Add field
      </Button>
    </div>
  );
}
