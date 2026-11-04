import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { insightApi } from '../api';
import { useCan } from '../../../shared/auth/use-permission';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/components/States';
import { StatusTag } from '../../assist/components/StatusTag';
import { Alert } from '../../../shared/components/Alert';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

function DatasetUpload() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const contentBase64 = btoa(
        new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), '')
      );
      await insightApi.uploadDataset({
        name: file.name.replace(/\.(csv|xlsx)$/i, ''),
        filename: file.name,
        contentBase64,
      });
      queryClient.invalidateQueries({ queryKey: ['insight', 'datasets'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card">
      <h2 className="section-title">Upload a dataset</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <p className="muted">
        CSV or Excel (.xlsx) files up to 8MB. The first row is treated as column headers.
      </p>
      <label className="btn btn--secondary" style={{ cursor: 'pointer' }}>
        {busy ? 'Uploading…' : 'Choose file'}
        <input
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          hidden
          disabled={busy}
          onChange={(e) => void onFile(e)}
        />
      </label>
    </section>
  );
}

export function DatasetsPage() {
  useDocumentTitle('Datasets');
  const canWrite = useCan('insight.write');
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: ['insight', 'datasets'],
    queryFn: () => insightApi.listDatasets(),
  });
  const remove = useMutation({
    mutationFn: insightApi.deleteDataset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insight', 'datasets'] }),
  });

  return (
    <>
      <PageHeader title="Datasets" subtitle="Business data uploaded for analysis." />
      {canWrite && <DatasetUpload />}
      {list.isPending && <LoadingState label="Loading datasets…" />}
      {list.isError && <ErrorState message={list.error.message} />}
      {list.data && list.data.items.length === 0 && (
        <EmptyState title="No datasets" message="Upload a CSV or Excel file to get started." />
      )}
      {list.data && list.data.items.length > 0 && (
        <section className="card card--pad0">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>File</th>
                <th>Rows</th>
                <th>Status</th>
                <th>Uploaded</th>
                {canWrite && <th />}
              </tr>
            </thead>
            <tbody>
              {list.data.items.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link to={`/dashboard/insight/datasets/${d.id}`}>{d.name}</Link>
                  </td>
                  <td className="muted">{d.filename}</td>
                  <td>{d.rowCount.toLocaleString()}</td>
                  <td>
                    <StatusTag status={d.status} />
                  </td>
                  <td className="muted">{new Date(d.createdAt).toLocaleDateString()}</td>
                  {canWrite && (
                    <td>
                      <button className="pill" onClick={() => remove.mutate(d.id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
