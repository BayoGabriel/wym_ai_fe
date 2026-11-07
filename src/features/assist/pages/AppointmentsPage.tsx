import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  RefreshCw,
  Settings2,
  X,
} from 'lucide-react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { assistApi, type Appointment, type Availability } from '../api/assist-api';
import { assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Alert } from '../../../shared/components/Alert';
import { ErrorState, EmptyState } from '../../../shared/components/States';
import { TableSkeleton, CardSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { useToast } from '../../../shared/components/toast-context';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { SegmentedControl } from '../../../shared/components/SegmentedControl';
import { Drawer } from '../../../shared/components/Drawer';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import '../styles/calendar.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const NEXT: Record<string, { label: string; status: string }[]> = {
  REQUESTED: [
    { label: 'Confirm', status: 'CONFIRMED' },
    { label: 'Decline', status: 'CANCELLED' },
  ],
  CONFIRMED: [
    { label: 'Complete', status: 'COMPLETED' },
    { label: 'No-show', status: 'NO_SHOW' },
    { label: 'Cancel', status: 'CANCELLED' },
  ],
};

function Calendar({
  month,
  byDay,
  selected,
  onSelectDay,
  onMonth,
}: {
  month: Date;
  byDay: Map<string, Appointment[]>;
  selected: string | null;
  onSelectDay: (d: string) => void;
  onMonth: (d: Date) => void;
}) {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return (
    <Card className="cal" pad="none">
      <div className="cal__head">
        <button aria-label="Previous month" onClick={() => onMonth(addMonths(month, -1))}>
          <ChevronLeft size={15} />
        </button>
        <strong>{format(month, 'MMMM yyyy')}</strong>
        <button aria-label="Next month" onClick={() => onMonth(addMonths(month, 1))}>
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="cal__grid" role="grid">
        {DAY_LABELS.map((d) => (
          <div key={d} className="cal__dow">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const items = byDay.get(key) ?? [];
          return (
            <button
              key={key}
              role="gridcell"
              className={`cal__day${!isSameMonth(d, month) ? ' is-out' : ''}${isToday(d) ? ' is-today' : ''}${selected === key ? ' is-selected' : ''}`}
              onClick={() => onSelectDay(selected === key ? '' : key)}
            >
              <span className="cal__num">{d.getDate()}</span>
              {items.length > 0 && (
                <span className="cal__dots">
                  {items.slice(0, 3).map((a) => (
                    <i key={a.id} className={`cal__dot cal__dot--${a.status.toLowerCase()}`} />
                  ))}
                  {items.length > 3 && <span className="cal__more">+{items.length - 3}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function AppointmentCard({
  a,
  canWrite,
  onAct,
  onNotes,
}: {
  a: Appointment;
  canWrite: boolean;
  onAct: (id: string, next: string) => void;
  onNotes: (a: Appointment) => void;
}) {
  return (
    <div className="appt-card">
      <div className="appt-card__main">
        <div className="appt-card__name">{a.customerName}</div>
        <div className="appt-card__meta">
          <span>
            <CalendarDays size={11} /> {a.preferredDate}
          </span>
          <span>
            <Clock size={11} /> {a.preferredTime}
          </span>
          {a.reason && <span className="appt-card__reason">{a.reason}</span>}
        </div>
        <div className="appt-card__contact">
          {a.email ?? a.phone ?? 'no contact'} · {a.source.toLowerCase().replace(/_/g, ' ')}
        </div>
      </div>
      <div className="appt-card__side">
        <StatusBadge status={a.status} />
        {canWrite && (
          <div className="appt-card__actions">
            {(NEXT[a.status] ?? []).map((n) => (
              <button key={n.status} className="pill" onClick={() => onAct(a.id, n.status)}>
                {n.label}
              </button>
            ))}
            <button className="pill" onClick={() => onNotes(a)}>
              Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AvailabilityEditor({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const config = useQuery(assistQueries.config);
  const qc = useQueryClient();
  const existing = config.data?.availability;
  const [days, setDays] = useState<number[]>(existing?.days ?? [1, 2, 3, 4, 5]);
  const [open, setOpen] = useState(existing?.open ?? '09:00');
  const [close, setClose] = useState(existing?.close ?? '17:00');
  const [slot, setSlot] = useState(existing?.slotMinutes ?? 30);
  const [buffer, setBuffer] = useState(existing?.bufferMinutes ?? 0);
  const [blackout, setBlackout] = useState((existing?.blackoutDates ?? []).join(', '));

  const save = useMutation({
    mutationFn: () => {
      const availability: Availability = {
        days,
        open,
        close,
        slotMinutes: slot,
        bufferMinutes: buffer,
        blackoutDates: blackout
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      return assistApi.patchAssistantConfig({ availability });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['assist-config'] });
      toast({ title: 'Booking rules saved', kind: 'success' });
      onClose();
    },
    onError: (e) => toast({ title: 'Save failed', description: e.message, kind: 'error' }),
  });

  if (config.isPending) return <CardSkeleton lines={4} />;
  return (
    <div className="avail">
      <div className="avail__field">
        <label>Open days</label>
        <div className="avail__days">
          {DAY_LABELS.map((d, i) => (
            <button
              key={d}
              className={`avail__day${days.includes(i) ? ' is-on' : ''}`}
              onClick={() =>
                setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i].sort())
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="avail__row">
        <div className="avail__field">
          <label htmlFor="avail-open">Opens</label>
          <input id="avail-open" className="input" type="time" value={open} onChange={(e) => setOpen(e.target.value)} />
        </div>
        <div className="avail__field">
          <label htmlFor="avail-close">Closes</label>
          <input id="avail-close" className="input" type="time" value={close} onChange={(e) => setClose(e.target.value)} />
        </div>
      </div>
      <div className="avail__row">
        <div className="avail__field">
          <label htmlFor="avail-slot">Slot length (min)</label>
          <input id="avail-slot" className="input" type="number" min={5} max={480} value={slot} onChange={(e) => setSlot(Number(e.target.value))} />
        </div>
        <div className="avail__field">
          <label htmlFor="avail-buffer">Buffer (min)</label>
          <input id="avail-buffer" className="input" type="number" min={0} max={240} value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} />
        </div>
      </div>
      <div className="avail__field">
        <label htmlFor="avail-blackout">Blackout dates</label>
        <input
          id="avail-blackout"
          className="input"
          placeholder="2025-12-25, 2026-01-01"
          value={blackout}
          onChange={(e) => setBlackout(e.target.value)}
        />
        <p className="faint small">Comma-separated dates the assistant won't accept bookings for.</p>
      </div>
      <Alert kind="info">
        Public requests outside these rules are rejected with a clear message. Google/Outlook
        two-way sync is <strong>coming soon</strong>.
      </Alert>
      <div className="avail__foot">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>
          Save rules
        </Button>
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  useDocumentTitle('Appointments');
  const canWrite = useCan('appointment.write');
  const toast = useToast();
  const qc = useQueryClient();
  const [view, setView] = useState<'calendar' | 'queue'>('calendar');
  const [month, setMonth] = useState(() => new Date());
  const [day, setDay] = useState<string | null>(null);
  const [notesFor, setNotesFor] = useState<Appointment | null>(null);
  const [notesText, setNotesText] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);

  const range = useMemo(() => {
    const start = format(startOfMonth(month), 'yyyy-MM-dd');
    const end = format(endOfMonth(month), 'yyyy-MM-dd');
    return { from: start, to: end };
  }, [month]);

  const query = useQuery({
    queryKey: ['appointments', 'month', range.from],
    queryFn: () => assistApi.listAppointments({ from: range.from, to: range.to }),
  });
  const requested = useQuery({
    queryKey: ['appointments', 'queue'],
    queryFn: () => assistApi.listAppointments({ status: 'REQUESTED' }),
    refetchInterval: 30_000,
  });

  const act = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) =>
      assistApi.updateAppointment(id, { status: next }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Appointment updated', kind: 'success' });
    },
    onError: (e) => toast({ title: 'Update failed', description: e.message, kind: 'error' }),
  });
  const saveNotes = useMutation({
    mutationFn: () => assistApi.updateAppointment(notesFor!.id, { internalNotes: notesText }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appointments'] });
      setNotesFor(null);
      toast({ title: 'Notes saved', kind: 'success' });
    },
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data]);
  const byDay = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    for (const a of items) {
      const list = m.get(a.preferredDate) ?? [];
      list.push(a);
      m.set(a.preferredDate, list);
    }
    return m;
  }, [items]);
  const dayItems = day ? (byDay.get(day) ?? []) : [];
  const queue = requested.data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Requests collected by the assistant, on your calendar."
        actions={
          <>
            <SegmentedControl
              ariaLabel="View"
              size="sm"
              options={[
                { value: 'calendar', label: 'Calendar', icon: <CalendarDays size={13} /> },
                {
                  value: 'queue',
                  label: `Requests${queue.length ? ` (${queue.length})` : ''}`,
                  icon: <List size={13} />,
                },
              ]}
              value={view}
              onChange={(v) => setView(v as 'calendar' | 'queue')}
            />
            <button className="status-select" onClick={() => setRulesOpen(true)}>
              <Settings2 size={13} /> Booking rules
            </button>
          </>
        }
      />
      {act.isError && <Alert kind="error">{act.error.message}</Alert>}

      {view === 'calendar' ? (
        <div className="appt-grid">
          <div>
            {query.isPending ? (
              <CardSkeleton lines={6} />
            ) : (
              <Calendar month={month} byDay={byDay} selected={day} onSelectDay={setDay} onMonth={setMonth} />
            )}
            <p className="faint small" style={{ marginTop: 8 }}>
              <RefreshCw size={11} /> Google / Outlook calendar sync — coming soon.
            </p>
          </div>
          <Card
            title={day ? format(new Date(day + 'T00:00:00'), 'EEEE, MMMM d') : 'This month'}
            subtitle={
              day
                ? `${dayItems.length} appointment${dayItems.length === 1 ? '' : 's'}`
                : `${items.length} appointment${items.length === 1 ? '' : 's'} in ${format(month, 'MMMM')}`
            }
            pad="none"
            className="appt-daypanel"
          >
            <div className="appt-daylist">
              {(day ? dayItems : items).length === 0 && (
                <EmptyState
                  compact
                  icon={<CalendarDays size={16} />}
                  title="Nothing booked"
                  message={day ? 'No appointments this day.' : 'No appointments this month yet.'}
                />
              )}
              {(day ? dayItems : items).map((a) => (
                <AppointmentCard
                  key={a.id}
                  a={a}
                  canWrite={canWrite}
                  onAct={(id, next) => act.mutate({ id, next })}
                  onNotes={(x) => {
                    setNotesFor(x);
                    setNotesText(x.internalNotes ?? '');
                  }}
                />
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <>
          {requested.isPending && <TableSkeleton />}
          {requested.isError && <ErrorState message={requested.error.message} />}
          {requested.data &&
            (queue.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={18} />}
                title="No pending requests"
                message="When visitors ask to book, requests land here for confirmation."
              />
            ) : (
              <div className="appt-queue">
                {queue.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    a={a}
                    canWrite={canWrite}
                    onAct={(id, next) => act.mutate({ id, next })}
                    onNotes={(x) => {
                      setNotesFor(x);
                      setNotesText(x.internalNotes ?? '');
                    }}
                  />
                ))}
              </div>
            ))}
        </>
      )}

      <Drawer open={!!notesFor} onClose={() => setNotesFor(null)} title={`Notes — ${notesFor?.customerName ?? ''}`} width={420}>
        <label className="field">
          <span className="field-label">Internal notes</span>
          <textarea
            className="input"
            rows={6}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Only visible to your team…"
          />
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Button variant="secondary" size="sm" onClick={() => setNotesFor(null)} icon={<X size={13} />}>
            Cancel
          </Button>
          <Button size="sm" loading={saveNotes.isPending} onClick={() => saveNotes.mutate()}>
            Save notes
          </Button>
        </div>
      </Drawer>

      <Drawer open={rulesOpen} onClose={() => setRulesOpen(false)} title="Booking rules" width={440}>
        <AvailabilityEditor onClose={() => setRulesOpen(false)} />
      </Drawer>
    </>
  );
}
