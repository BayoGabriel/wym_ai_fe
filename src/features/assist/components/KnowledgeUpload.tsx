import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Alert } from '../../../shared/components/Alert';
import { assistApi } from '../api/assist-api';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export function KnowledgeUpload({ onUploaded }: { onUploaded: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const base64 = await readFileAsBase64(file);
      await assistApi.uploadKnowledgePdf({
        title: file.name.replace(/\.pdf$/i, ''),
        fileName: file.name,
        base64,
      });
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Upload a PDF</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <p className="muted">PDFs are stored, then processed into searchable knowledge chunks.</p>
      <label className="btn btn--secondary" style={{ cursor: 'pointer' }}>
        {busy ? 'Uploading…' : 'Choose PDF'}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => void onFile(e)}
          style={{ display: 'none' }}
          disabled={busy}
        />
      </label>
    </div>
  );
}
