import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../shared/components/Button';

export type Note = { id: string; body: string; createdAt: string };

export function NotesPanel({
  notes,
  onAdd,
  canWrite,
}: {
  notes: Note[];
  onAdd: (body: string) => void;
  canWrite: boolean;
}) {
  const [note, setNote] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onAdd(note.trim());
    setNote('');
  };
  return (
    <section className="card">
      <h2 className="section-title">Internal notes</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes.map((n) => (
          <li key={n.id} style={{ marginBottom: 'var(--space-3)' }}>
            <p style={{ margin: 0 }}>{n.body}</p>
            <span className="muted">{new Date(n.createdAt).toLocaleString()}</span>
          </li>
        ))}
        {notes.length === 0 && <p className="muted">No notes yet.</p>}
      </ul>
      {canWrite && (
        <form onSubmit={submit}>
          <textarea
            className="input"
            rows={2}
            placeholder="Add a private note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button variant="secondary" type="submit" style={{ marginTop: 'var(--space-2)' }}>
            Add note
          </Button>
        </form>
      )}
    </section>
  );
}
