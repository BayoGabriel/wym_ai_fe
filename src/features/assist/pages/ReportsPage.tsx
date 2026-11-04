import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assistQueries } from '../queries';
import { authDownload, saveBlob } from '../../../shared/api/api-client';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { Button } from '../../../shared/components/Button';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

function DailyChart({ daily }: { daily: { date: string; count: number }[] }) {
  const max = Math.max(1, ...daily.map((d) => d.count));
  const total = daily.reduce((n, d) => n + d.count, 0);
  return (
    <section className="card">
      <div className="card-head">
        <h2>Messages per day</h2>
        <span className="card-note">{total} messages in window</span>
      </div>
      {daily.length === 0 ? (
        <p className="muted">No messages in this window.</p>
      ) : (
        <>
          <div className="spark" style={{ height: 96 }}>
            {daily.map((d) => (
              <span
                key={d.date}
                className={d.count === max ? 'hot' : ''}
                style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}
                title={`${d.date}: ${d.count}`}
              />
            ))}
          </div>
          <div className="faint small" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{daily[0]?.date}</span>
            <span>{daily[daily.length - 1]?.date}</span>
          </div>
        </>
      )}
    </section>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((n, r) => n + r.count, 0);
  return (
    <section className="card">
      <div className="card-head">
        <h2>{title}</h2>
        <span className="card-note">{total} total</span>
      </div>
      {rows.length === 0 && <p className="muted">No data in this window.</p>}
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span className="bar-label">{r.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
          <span className="bar-num">{r.count}</span>
        </div>
      ))}
    </section>
  );
}

export function ReportsPage() {
  useDocumentTitle('Reports');
  const [days, setDays] = useState(30);
  const query = useQuery(assistQueries.report(days));

  return (
    <>
      <PageHeader title="Reports" subtitle="Enquiry and activity statistics." />
      <div className="toolbar">
        <label className="field" style={{ marginBottom: 0 }}>
          <span className="field__label">Window</span>
          <select className="input" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
        <div className="toolbar-end">
          <Button
            variant="secondary"
            onClick={() =>
              void authDownload(`/api/v1/reports/enquiries?days=${days}&format=csv`).then((b) =>
                saveBlob(b, `enquiry-report-${days}d.csv`)
              )
            }
          >
            Download CSV
          </Button>
        </div>
      </div>
      {query.isPending && <LoadingState label="Loading report…" />}
      {query.isError && <ErrorState message={query.error.message} />}
      {query.data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{query.data.conversations.total}</div>
              <div className="stat-label">Conversations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{query.data.messages.total}</div>
              <div className="stat-label">Messages</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{query.data.leads.total}</div>
              <div className="stat-label">Leads captured</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{query.data.handoffs.open}</div>
              <div className="stat-label">Open handoffs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{query.data.appointments.total}</div>
              <div className="stat-label">Appointment requests</div>
            </div>
          </div>
          <div className="grid two">
            <DailyChart daily={query.data.messages.daily} />
            <Breakdown
              title="Leads by category"
              rows={query.data.leads.byCategory.map((r) => ({
                label: r.category,
                count: r.count,
              }))}
            />
            <Breakdown
              title="Leads by status"
              rows={query.data.leads.byStatus.map((r) => ({ label: r.status, count: r.count }))}
            />
            <Breakdown
              title="Handoffs by status"
              rows={query.data.handoffs.byStatus.map((r) => ({
                label: r.status,
                count: r.count,
              }))}
            />
          </div>
        </>
      )}
    </>
  );
}
