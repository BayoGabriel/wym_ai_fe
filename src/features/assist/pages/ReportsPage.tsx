import { Suspense, lazy, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Download, Plus, Trash2 } from 'lucide-react';
import { assistApi, type ReportSchedule } from '../api/assist-api';
import { assistQueries } from '../queries';
import { authDownload, saveBlob } from '../../../shared/api/api-client';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { CardSkeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select';
import { StatTile } from '../../../shared/components/StatTile';
import { ChartCard } from '../../../shared/components/ChartCard';
import { Drawer } from '../../../shared/components/Drawer';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useToast } from '../../../shared/components/toast-context';
import { useCan } from '../../../shared/auth/use-permission';
import '../styles/reports.css';

const VolumeChart = lazy(() =>
  import('../../dashboard/components/OverviewCharts').then((m) => ({ default: m.VolumeChart }))
);
const ChannelDonut = lazy(() =>
  import('../../dashboard/components/OverviewCharts').then((m) => ({ default: m.ChannelDonut }))
);
const LeadFunnel = lazy(() =>
  import('../../dashboard/components/OverviewCharts').then((m) => ({ default: m.LeadFunnel }))
);
const StatusBars = lazy(() =>
  import('../../dashboard/components/OverviewCharts').then((m) => ({ default: m.StatusBars }))
);

function fmtDelta(now: number, prev: number) {
  if (prev === 0) return now > 0 ? { value: 100, label: 'new' } : undefined;
  const pct = Math.round(((now - prev) / prev) * 100);
  return { value: pct, label: 'vs prev' };
}

function fmtSeconds(s: number | null) {
  if (s == null) return '—';
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

function SchedulesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const canWrite = useCan('report.read');
  const list = useQuery({
    queryKey: ['report-schedules'],
    queryFn: () => assistApi.listReportSchedules(),
    enabled: open,
  });
  const [frequency, setFrequency] = useState('weekly');
  const [emails, setEmails] = useState('');

  const create = useMutation({
    mutationFn: () =>
      assistApi.createReportSchedule({
        frequency,
        recipients: emails.split(/[,\s]+/).filter(Boolean),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['report-schedules'] });
      setEmails('');
      toast({ title: 'Schedule created', kind: 'success' });
    },
    onError: (e) => toast({ title: 'Create failed', description: e.message, kind: 'error' }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => assistApi.deleteReportSchedule(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['report-schedules'] }),
  });

  const items = list.data?.items ?? [];
  return (
    <Drawer open={open} onClose={onClose} title="Scheduled reports" width={440}>
      <p className="muted small" style={{ marginTop: 0 }}>
        Email a summary of this report to your team on a cadence.
      </p>
      {canWrite && (
        <div className="sched-new">
          <Select
            ariaLabel="Frequency"
            value={frequency}
            onChange={setFrequency}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
          />
          <input
            className="input"
            placeholder="you@company.com, team@company.com"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />
          <Button
            size="sm"
            icon={<Plus size={13} />}
            loading={create.isPending}
            disabled={!emails.trim()}
            onClick={() => create.mutate()}
          >
            Add schedule
          </Button>
        </div>
      )}
      {list.isPending && <LoadingState label="Loading…" />}
      {items.length === 0 && !list.isPending && (
        <p className="muted small">No schedules yet — reports arrive when the cadence is due.</p>
      )}
      <ul className="sched-list">
        {items.map((s: ReportSchedule) => (
          <li key={s.id}>
            <div>
              <strong>{s.frequency}</strong>
              <span className="sched-list__to">{s.recipients.join(', ')}</span>
              <span className="sched-list__last">
                {s.lastSentAt ? `Last sent ${new Date(s.lastSentAt).toLocaleDateString()}` : 'Not sent yet'}
              </span>
            </div>
            {canWrite && (
              <button aria-label="Delete schedule" onClick={() => remove.mutate(s.id)}>
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

export function ReportsPage() {
  useDocumentTitle('Reports');
  const [days, setDays] = useState(30);
  const [schedOpen, setSchedOpen] = useState(false);
  const query = useQuery(assistQueries.report(days));
  const toast = useToast();
  const r = query.data;

  const downloadCsv = async () => {
    const blob = await authDownload(`/api/v1/reports/enquiries?days=${days}&format=csv`);
    saveBlob(blob, `enquiry-report-${days}d.csv`);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="How the assistant is performing across conversations, leads and escalations."
        actions={
          <>
            <button className="status-select" onClick={() => setSchedOpen(true)}>
              <CalendarClock size={13} /> Schedules
            </button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={13} />}
              onClick={() => downloadCsv().catch((e) => toast({ title: 'Export failed', description: e.message, kind: 'error' }))}
            >
              Export CSV
            </Button>
            <Select
              value={String(days)}
              onChange={(v) => setDays(Number(v))}
              ariaLabel="Report window"
              size="sm"
              options={[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' },
              ]}
            />
          </>
        }
      />
      {query.isPending && <LoadingState label="Loading report…" />}
      {query.isError && <ErrorState message={query.error.message} />}
      {r && (
        <Suspense fallback={<CardSkeleton lines={6} />}>
          <div className="stat-grid">
            <StatTile label="Conversations" value={r.conversations.total} delta={fmtDelta(r.conversations.total, r.previous.conversations)} spark={r.messages.daily.map((d) => d.count)} />
            <StatTile label="Leads captured" value={r.leads.total} delta={fmtDelta(r.leads.total, r.previous.leads)} />
            <StatTile label="Open handoffs" value={r.handoffs.open} delta={fmtDelta(r.handoffs.total, r.previous.handoffs)} />
            <StatTile
              label="AI resolution rate"
              value={r.rates ? `${Math.round(r.rates.resolutionRate * 100)}%` : '—'}
              hint="Closed without human handoff"
            />
            <StatTile
              label="Escalation rate"
              value={r.rates ? `${Math.round(r.rates.escalationRate * 100)}%` : '—'}
              hint="Conversations needing a human"
            />
            <StatTile
              label="Avg first response"
              value={r.rates ? fmtSeconds(r.rates.avgFirstResponseSeconds) : '—'}
              hint="First visitor msg → first reply"
            />
            <StatTile
              label="CSAT"
              value={
                r.csat?.score != null ? `${Math.round(r.csat.score * 100)}%` : '—'
              }
              hint={r.csat ? `${r.csat.positive} positive · ${r.csat.negative} negative` : 'No feedback yet'}
            />
          </div>
          <div className="grid two">
            <ChartCard title="Messages per day" subtitle="All channels">
              <VolumeChart data={r.messages.daily} />
            </ChartCard>
            <ChartCard title="Conversations by channel" subtitle="Where visitors reach you">
              <ChannelDonut data={r.conversations.byChannel} />
            </ChartCard>
            <ChartCard title="Lead funnel" subtitle="Status across the window">
              <LeadFunnel data={r.leads.byStatus} />
            </ChartCard>
            <ChartCard title="Enquiry categories" subtitle="What visitors ask about">
              <StatusBars
                data={r.leads.byCategory.map((c) => ({ status: c.category, count: c.count }))}
                name="Category"
              />
            </ChartCard>
          </div>
        </Suspense>
      )}
      <SchedulesDrawer open={schedOpen} onClose={() => setSchedOpen(false)} />
    </>
  );
}
