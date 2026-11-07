import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Select } from '../../../shared/components/Select';
import { Alert } from '../../../shared/components/Alert';
import { assistApi } from '../api/assist-api';

import { KNOWLEDGE_CATEGORIES } from './knowledge-categories';

export function KnowledgeForm({
  onCreated,
  initialTitle = '',
  initialCategory = 'FAQ',
}: {
  onCreated: () => void;
  initialTitle?: string;
  initialCategory?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await assistApi.createKnowledge({ title, content, category });
      setTitle('');
      setContent('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card">
      <h2 className="section-title">Add knowledge</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div className="field">
        <span className="field__label">Category</span>
        <Select
          value={category}
          onChange={setCategory}
          ariaLabel="Category"
          options={KNOWLEDGE_CATEGORIES.map((c) => ({
            value: c,
            label: c.replace(/_/g, ' '),
          }))}
        />
      </div>
      <label className="field">
        <span className="field__label">Content</span>
        <textarea
          className="input"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </label>
      <Button type="submit" loading={busy}>
        Save as draft
      </Button>
    </form>
  );
}
