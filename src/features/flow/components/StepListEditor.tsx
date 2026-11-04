import { useState } from 'react';
import type { FlowStep } from '../api';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';

export function StepListEditor({
  steps,
  onChange,
}: {
  steps: FlowStep[];
  onChange: (steps: FlowStep[]) => void;
}) {
  const [name, setName] = useState('');

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onChange([...steps, { name: trimmed }]);
    setName('');
  };

  return (
    <div>
      <ol style={{ paddingLeft: 'var(--space-5)', margin: 0 }}>
        {steps.map((s, i) => (
          <li key={i} style={{ padding: 'var(--space-1) 0' }}>
            {s.name}
            <button
              type="button"
              className="pill"
              style={{ marginLeft: 'var(--space-2)' }}
              onClick={() => onChange(steps.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <div style={{ flex: 1 }}>
          <TextField
            label="Step name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Manager approval"
          />
        </div>
        <Button type="button" variant="secondary" onClick={add} style={{ alignSelf: 'flex-end' }}>
          Add step
        </Button>
      </div>
      <p className="muted">Steps run in order — each approval advances to the next step.</p>
    </div>
  );
}
