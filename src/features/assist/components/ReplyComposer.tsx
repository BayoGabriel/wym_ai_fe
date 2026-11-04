import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../shared/components/Button';

export function ReplyComposer({
  placeholder,
  submitLabel = 'Send',
  onSubmit,
  busy,
}: {
  placeholder: string;
  submitLabel?: string;
  onSubmit: (text: string) => void;
  busy?: boolean;
}) {
  const [text, setText] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };
  return (
    <form onSubmit={submit} style={{ marginTop: 'var(--space-4)' }}>
      <textarea
        className="input"
        rows={3}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" style={{ marginTop: 'var(--space-2)' }} loading={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}
