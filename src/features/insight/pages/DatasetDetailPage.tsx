import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { insightApi } from '../api';
import { useCan } from '../../../shared/auth/use-permission';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { StatusTag } from '../../assist/components/StatusTag';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  useDocumentTitle('Dataset');
  const navigate = useNavigate();
  const canWrite = useCan('insight.write');
  const dataset = useQuery({
    queryKey: ['insight', 'dataset', id],
    queryFn: () => insightApi.getDataset(id!),
    enabled: !!id,
  });
  const analyze = useMutation({
    mutationFn: () => insightApi.analyzeDataset(id!),
    onSuccess: (report) => navigate(`/dashboard/insight/reports/${report.id}`),
  });

  if (dataset.isPending) return <LoadingState label="Loading dataset…" />;
  if (dataset.isError) return <ErrorState message={dataset.error.message} />;
  const d = dataset.data!;
  const headers = d.profile?.map((c) => c.name) ?? Object.keys(d.rows?.[0] ?? {});
  const preview = (d.rows ?? []).slice(0, 8);

  return (
    <>
      <PageHeader title={d.name} subtitle={`${d.rowCount.toLocaleString()} rows · ${d.filename}`} />
      {analyze.isError && <Alert kind="error">{analyze.error.message}</Alert>}
      <div className="toolbar">
        <StatusTag status={d.status} />
        {canWrite && (
          <Button onClick={() => analyze.mutate()} loading={analyze.isPending}>
            Run analysis
          </Button>
        )}
        <Link to="/dashboard/insight/datasets">Back to datasets</Link>
      </div>

      {d.profile && (
        <section className="card card--pad0">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Distinct</th>
                <th>Empty</th>
                <th>Min</th>
                <th>Max</th>
                <th>Mean</th>
              </tr>
            </thead>
            <tbody>
              {d.profile.map((c) => (
                <tr key={c.name} style={{ cursor: 'default' }}>
                  <td>{c.name}</td>
                  <td>
                    <code>{c.type}</code>
                  </td>
                  <td>{c.distinct}</td>
                  <td>{c.nulls}</td>
                  <td>{c.min ?? '—'}</td>
                  <td>{c.max ?? '—'}</td>
                  <td>{c.mean !== undefined ? c.mean.toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {preview.length > 0 && (
        <section className="card card--pad0">
          <table className="ops-table">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  {headers.map((h) => (
                    <td key={h} className="muted">
                      {r[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
