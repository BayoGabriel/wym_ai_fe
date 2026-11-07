import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { FileUp } from 'lucide-react';
import { Alert } from '../../../shared/components/Alert';
import { assistApi } from '../api/assist-api';

const ACCEPTED: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  csv: 'text/csv',
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export function KnowledgeUpload({ onUploaded }: { onUploaded: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mimeType = ACCEPTED[ext] ?? file.type;
    if (!Object.values(ACCEPTED).includes(mimeType)) {
      setError(`${file.name}: only PDF, DOCX, TXT and CSV files are supported`);
      return;
    }
    setBusy(file.name);
    setError(null);
    try {
      const base64 = await readFileAsBase64(file);
      await assistApi.uploadKnowledgeDocument({
        title: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        mimeType,
        base64,
      });
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(null);
    }
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void upload(file);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div
      className={`kb-drop${dragOver ? ' is-over' : ''}${busy ? ' is-busy' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <FileUp size={20} />
      <strong>{busy ? `Uploading ${busy}…` : 'Drop a document or click to browse'}</strong>
      <span>PDF, DOCX, TXT or CSV — processed into searchable chunks.</span>
      {error && <Alert kind="error">{error}</Alert>}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.csv"
        onChange={onFile}
        style={{ display: 'none' }}
        disabled={!!busy}
      />
    </div>
  );
}
