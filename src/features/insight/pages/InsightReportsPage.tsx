import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { insightApi } from '../api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function InsightReportsPage() {
  useDocumentTitle('Analysis reports');
  const reports = useQuery({
    queryKey: ['insight', 'reports'],
    queryFn: () => insightApi.listReports(),
  });

  return (
    <>
      <PageHeader title="Analysis reports" subtitle="Generated insights from your datasets." />
      {reports.isPending && <LoadingState label="Loading reports…" />}
      {reports.isError && <ErrorState message={reports.error.message} />}
      {reports.data && reports.data.items.length === 0 && (
        <EmptyState
          title="No reports"
          message="Open a dataset and run an analysis to generate a report."
        />
      )}
      {reports.data && reports.data.items.length > 0 && (
        <section className="card card--pad0">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Rows</th>
                <th>Generated</th>
              </tr>
            </thead>
            <tbody>
              {reports.data.items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/dashboard/insight/reports/${r.id}`}>{r.title}</Link>
                  </td>
                  <td>{r.analysis.rowCount.toLocaleString()}</td>
                  <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
