import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { insightApi } from '../api';
import type { Trend } from '../api';
import { authDownload, saveBlob } from '../../../shared/api/api-client';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { Button } from '../../../shared/components/Button';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

function TrendChart({ trend }: { trend: Trend }) {
  const all = [...trend.points.map((p) => p.total), ...trend.forecast.map((f) => f.predicted)];
  const max = Math.max(...all, 1);
  return (
    <section className="card">
      <h2 className="section-title">
        {trend.valueColumn} by {trend.dateColumn}{' '}
        <span className="muted">
          ({trend.direction}
          {trend.growthPct !== null ? `, ${trend.growthPct}%` : ''})
        </span>
      </h2>
      <div>
        {trend.points.map((p) => (
          <div className="bar-row" key={p.period}>
            <span className="bar-label">{p.period}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.max(2, (p.total / max) * 100)}%` }}
              />
            </div>
            <span className="bar-value">{p.total.toLocaleString()}</span>
          </div>
        ))}
        {trend.forecast.map((f) => (
          <div className="bar-row" key={f.period}>
            <span className="bar-label">{f.period} (est.)</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.max(2, (f.predicted / max) * 100)}%`, opacity: 0.45 }}
              />
            </div>
            <span className="bar-value">{f.predicted.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function InsightReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  useDocumentTitle('Report');
  const report = useQuery({
    queryKey: ['insight', 'report', id],
    queryFn: () => insightApi.getReport(id!),
    enabled: !!id,
  });

  if (report.isPending) return <LoadingState label="Loading report…" />;
  if (report.isError) return <ErrorState message={report.error.message} />;
  const r = report.data!;
  const a = r.analysis;

  return (
    <>
      <PageHeader title={r.title} subtitle={new Date(r.createdAt).toLocaleString()} />
      <div className="toolbar">
        <Button
          variant="secondary"
          onClick={() =>
            void authDownload(`/api/v1/insight/reports/${r.id}/download`).then((b) =>
              saveBlob(b, `insight-report-${r.id}.csv`)
            )
          }
        >
          Download CSV
        </Button>
        <Link to="/dashboard/insight/reports">Back to reports</Link>
      </div>

      {r.summary && (
        <section className="card">
          <h2 className="section-title">Executive summary</h2>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{r.summary}</p>
        </section>
      )}

      {a.kpis.length > 0 && (
        <div className="stat-grid">
          {a.kpis.map((k) => (
            <div className="stat-card" key={k.label}>
              <div className="stat-value">{k.value}</div>
              <div className="stat-label">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {a.trends.map((t, i) => (
        <TrendChart key={i} trend={t} />
      ))}

      <section className="card card--pad0">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Distinct</th>
              <th>Top values</th>
            </tr>
          </thead>
          <tbody>
            {a.columns.map((c) => (
              <tr key={c.name} style={{ cursor: 'default' }}>
                <td>{c.name}</td>
                <td>
                  <code>{c.type}</code>
                </td>
                <td>{c.distinct}</td>
                <td className="muted">
                  {c.topValues?.map((t) => `${t.value} (${t.count})`).join(', ') ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
