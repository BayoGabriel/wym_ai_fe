import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { flowApi } from '../api';
import type { FlowField, FlowStep } from '../api';
import { FieldListEditor } from './FieldListEditor';
import { StepListEditor } from './StepListEditor';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Alert } from '../../../shared/components/Alert';

export function DefinitionForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FlowField[]>([]);
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () =>
      flowApi.createDefinition({
        name,
        description: description || undefined,
        fields,
        steps,
        active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow', 'definitions'] });
      onDone();
    },
    onError: (e) => setError(e.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!steps.length) {
      setError('Add at least one approval step.');
      return;
    }
    create.mutate();
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="section-title">New workflow</h2>
      {(error || create.isError) && <Alert kind="error">{error ?? create.error?.message}</Alert>}
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Invoice approval"
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <h3 className="section-title" style={{ marginTop: 'var(--space-4)' }}>
        Submission fields
      </h3>
      <FieldListEditor fields={fields} onChange={setFields} />
      <h3 className="section-title" style={{ marginTop: 'var(--space-4)' }}>
        Approval steps
      </h3>
      <StepListEditor steps={steps} onChange={setSteps} />
      <Button type="submit" loading={create.isPending} style={{ marginTop: 'var(--space-4)' }}>
        Create workflow
      </Button>
    </form>
  );
}
