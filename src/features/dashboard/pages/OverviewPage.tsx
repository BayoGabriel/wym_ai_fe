import { Suspense, lazy, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CalendarDays,
  Check,
  Globe,
  Headset,
  ListChecks,
  MessagesSquare,
  Palette,
  Settings2,
  SlidersHorizontal,
  UserRound,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../app/providers/auth-context';
import { useOrgContext } from '../../organizations/queries/use-org-context';
import { assistApi } from '../../assist/api/assist-api';
import { assistQueries } from '../../assist/queries';
import { usePrefs } from '../../../shared/prefs/prefs';
import { StatTile } from '../../../shared/components/StatTile';
import { Card } from '../../../shared/components/Card';
import { ChartCard } from '../../../shared/components/ChartCard';
import { EmptyState, ErrorState } from '../../../shared/components/States';
import { StatStripSkeleton } from '../../../shared/components/Skeleton';
import { SegmentedControl } from '../../../shared/components/SegmentedControl';
import { ProgressRing } from '../../../shared/components/ProgressRing';
import { Dropdown } from '../../../shared/components/Dropdown';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { AttentionQueue } from '../components/AttentionQueue';
import { PlatformOverview } from '../components/PlatformOverview';
import '../styles/overview.css';
import type { ReportShape } from '../components/OverviewCharts';

const VolumeChart = lazy(() =>
  import('../components/OverviewCharts').then((m) => ({ default: m.VolumeChart }))
);
const ChannelDonut = lazy(() =>
  import('../components/OverviewCharts').then((m) => ({ default: m.ChannelDonut }))
);
const LeadFunnel = lazy(() =>
  import('../components/OverviewCharts').then((m) => ({ default: m.LeadFunnel }))
);
const StatusBars = lazy(() =>
  import('../components/OverviewCharts').then((m) => ({ default: m.StatusBars }))
);

const WIDGETS = [
  { id: 'stats', label: 'Key metrics' },
  { id: 'attention', label: 'Needs attention' },
  { id: 'volume', label: 'Conversation volume' },
  { id: 'channels', label: 'Channel mix' },
  { id: 'funnel', label: 'Lead funnel' },
  { id: 'ops', label: 'Handoffs & appointments' },
  { id: 'setup', label: 'Setup progress' },
] as const;
type WidgetId = (typeof WIDGETS)[number]['id'];
const DEFAULT_ORDER = WIDGETS.map((w) => w.id);
const DEFAULT_HIDDEN: WidgetId[] = ['setup'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? null : 100;
  return Math.round(((cur - prev) / prev) * 100);
}

function SetupRing() {
  const config = useQuery(assistQueries.config);
  const settings = useQuery(assistQueries.settings);
  const knowledge = useQuery({
    queryKey: ['setup', 'knowledge-count'],
    queryFn: () => assistApi.listKnowledge({ status: 'ACTIVE' }),
    select: (d) => d.total,
  });
  const checks = useMemo(() => {
    const c = config.data;
    const s = settings.data;
    return [
      { label: 'Add knowledge', done: (knowledge.data ?? 0) > 0, to: '/dashboard/assist/knowledge', icon: BookOpen },
      { label: 'Enable public chat', done: !!c?.publicChatEnabled, to: '/dashboard/assist/settings', icon: MessagesSquare },
      { label: 'Set branding', done: !!(s?.primaryColor || s?.logoUrl), to: '/dashboard/assist/settings', icon: Palette },
      { label: 'Install the widget', done: (c?.allowedOrigins?.length ?? 0) > 0, to: '/dashboard/assist/settings', icon: Globe },
      { label: 'Invite your team', done: false, to: '/dashboard/team', icon: Users },
      { label: 'Test the bot', done: false, to: '/dashboard/assist', icon: Check },
    ];
  }, [config.data, settings.data, knowledge.data]);
  const done = checks.filter((c) => c.done).length;
  return (
    <Card title="Getting set up" subtitle={`${done} of ${checks.length} done`} className="ov-setup">
      <div className="ov-setup__row">
        <ProgressRing value={done / checks.length} size={72} label={`${Math.round((done / checks.length) * 100)}%`} />
        <ul className="ov-setup__list">
          {checks.map((c) => (
            <li key={c.label} className={c.done ? 'is-done' : ''}>
              <c.icon size={14} />
              <span>{c.label}</span>
              {!c.done && <Link to={c.to}>Set up</Link>}
              {c.done && <Check size={13} className="ov-setup__tick" />}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function OverviewPage() {
  useDocumentTitle('Overview');
  const { user } = useAuth();
  const org = useOrgContext();
  const [days, setDays] = useState<'7' | '30' | '90'>('30');
  const [prefs, setPref] = usePrefs();

  const order = (prefs.dashboardLayout?.order?.length
    ? prefs.dashboardLayout.order.filter((id): id is WidgetId => DEFAULT_ORDER.includes(id as WidgetId))
    : DEFAULT_ORDER) as WidgetId[];
  const hidden = new Set(prefs.dashboardLayout?.hidden ?? DEFAULT_HIDDEN);
  const orderedWidgets = [...order, ...DEFAULT_ORDER.filter((id) => !order.includes(id))];

  const report = useQuery({
    queryKey: ['overview', 'report', days],
    queryFn: () => assistApi.getEnquiryReport(Number(days)),
    staleTime: 60_000,
  });

  if (user?.platformAccess) return <PlatformOverview />;

  const r = report.data as ReportShape | undefined;
  const sparks = r?.messages.daily.map((d) => d.count) ?? [];
  const moveWidget = (id: WidgetId, dir: -1 | 1) => {
    const next = [...orderedWidgets];
    const i = next.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setPref('dashboardLayout', { order: next, hidden: [...hidden] });
  };
  const toggleWidget = (id: WidgetId) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPref('dashboardLayout', { order: orderedWidgets, hidden: [...next] });
  };

  const sections: Record<WidgetId, ReactNode> = {
    stats: report.isPending ? (
      <StatStripSkeleton tiles={5} />
    ) : r ? (
      <div className="ov-stats">
        <StatTile label="Conversations" value={r.conversations.total} delta={{ value: pctDelta(r.conversations.total, r.previous.conversations) ?? 0, label: 'vs prev' }} to="/dashboard/assist/conversations" icon={<MessagesSquare />} spark={sparks} />
        <StatTile label="Messages" value={r.messages.total} delta={{ value: pctDelta(r.messages.total, r.previous.messages) ?? 0, label: 'vs prev' }} icon={<ListChecks />} />
        <StatTile label="Leads" value={r.leads.total} delta={{ value: pctDelta(r.leads.total, r.previous.leads) ?? 0, label: 'vs prev' }} to="/dashboard/assist/leads" icon={<UserRound />} />
        <StatTile label="Open handoffs" value={r.handoffs.open} delta={{ value: pctDelta(r.handoffs.total, r.previous.handoffs) ?? 0, invert: true, label: 'vs prev' }} to="/dashboard/assist/handoffs" icon={<Headset />} />
        <StatTile label="Appointments" value={r.appointments.total} delta={{ value: pctDelta(r.appointments.total, r.previous.appointments) ?? 0, label: 'vs prev' }} to="/dashboard/assist/appointments" icon={<CalendarDays />} />
      </div>
    ) : null,
    attention: <AttentionQueue />,
    volume: (
      <ChartCard title="Conversation volume" subtitle="Messages per day" loading={report.isPending} empty={r && r.messages.total === 0 ? { title: 'No messages yet' } : undefined} height={240}>
        <Suspense fallback={null}>{r && <VolumeChart data={r.messages.daily} />}</Suspense>
      </ChartCard>
    ),
    channels: (
      <ChartCard title="Channel mix" subtitle="Where conversations come from" loading={report.isPending} empty={r && r.conversations.total === 0 ? { title: 'No conversations yet' } : undefined} height={240}>
        <div className="ov-donutwrap">
          <Suspense fallback={null}>{r && <ChannelDonut data={r.conversations.byChannel} />}</Suspense>
          <ul className="ov-legend">
            {r?.conversations.byChannel.map((c, i) => (
              <li key={c.channel}>
                <span className="ov-legend__swatch" style={{ background: `var(--chart-${(i % 8) + 1})` }} />
                {c.channel} <strong>{c.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      </ChartCard>
    ),
    funnel: (
      <ChartCard title="Lead funnel" subtitle="Leads by stage" loading={report.isPending} empty={r && r.leads.total === 0 ? { title: 'No leads yet' } : undefined} height={240}>
        <Suspense fallback={null}>{r && <LeadFunnel data={r.leads.byStatus} />}</Suspense>
      </ChartCard>
    ),
    ops: (
      <ChartCard title="Queues" subtitle="Handoffs & appointments by status" loading={report.isPending} height={240}>
        <div className="ov-ops">
          <Suspense fallback={null}>
            {r && <StatusBars data={r.handoffs.byStatus} name="Handoffs" />}
            {r && <StatusBars data={r.appointments.byStatus} name="Appointments" />}
          </Suspense>
        </div>
      </ChartCard>
    ),
    setup: <SetupRing />,
  };

  return (
    <>
      <div className="ov-head">
        <div>
          <h1 className="ov-title">
            {greeting()}, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="ov-sub">
            <span className="ov-live" aria-hidden /> Live · {org.status === 'ready' && org.organization ? org.organization.name : 'your workspace'} ·{' '}
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="ov-controls">
          <SegmentedControl
            ariaLabel="Report window"
            size="sm"
            options={[
              { value: '7', label: '7d' },
              { value: '30', label: '30d' },
              { value: '90', label: '90d' },
            ]}
            value={days}
            onChange={(v) => setDays(v)}
          />
          <Dropdown
            align="end"
            trigger={
              <button className="status-select ov-customize" type="button">
                <SlidersHorizontal size={13} /> Customize
              </button>
            }
            items={WIDGETS.map((w) => ({
              type: 'custom' as const,
              node: (
                <div className="ov-widgetrow" key={w.id}>
                  <label>
                    <input type="checkbox" checked={!hidden.has(w.id)} onChange={() => toggleWidget(w.id)} /> {w.label}
                  </label>
                  <span className="ov-widgetrow__btns">
                    <button aria-label="Move up" onClick={() => moveWidget(w.id, -1)}><ArrowUp size={12} /></button>
                    <button aria-label="Move down" onClick={() => moveWidget(w.id, 1)}><ArrowDown size={12} /></button>
                  </span>
                </div>
              ),
            }))}
          />
        </div>
      </div>
      {report.isError && <ErrorState message={report.error.message} onRetry={() => report.refetch()} />}
      {orderedWidgets
        .filter((id) => !hidden.has(id))
        .map((id) => (
          <section key={id} className={`ov-widget ov-widget--${id}`}>
            {sections[id]}
          </section>
        ))}
      {orderedWidgets.every((id) => hidden.has(id)) && (
        <EmptyState
          icon={<Settings2 size={18} />}
          title="Dashboard cleared"
          message="Turn widgets back on from Customize in the top right."
        />
      )}
    </>
  );
}
