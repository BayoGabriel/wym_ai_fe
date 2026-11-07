import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, KeyRound, Laptop, LogOut, ShieldCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { assistApi } from '../api/assist-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { LoadingState } from '../../../shared/components/States';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Switch } from '../../../shared/components/Switch';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useAuth } from '../../../app/providers/auth-context';
import { useToast } from '../../../shared/components/toast-context';
import { useCan } from '../../../shared/auth/use-permission';
import '../styles/settings.css';

const NOTIFY_EVENTS = [
  { key: 'lead', label: 'New leads', description: 'When a visitor leaves contact details' },
  { key: 'handoff', label: 'Handoff requests', description: 'When a visitor asks for a human' },
  { key: 'appointment', label: 'Appointment requests', description: 'When a visitor asks to book' },
] as const;

function SessionsCard() {
  const toast = useToast();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['me-sessions'], queryFn: () => assistApi.listMySessions() });
  const revoke = useMutation({
    mutationFn: (id: string) => assistApi.revokeSession(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me-sessions'] });
      toast({ title: 'Session revoked', kind: 'success' });
    },
  });
  return (
    <Card title="Active sessions" subtitle="Signed-in sessions on this account — revoke any you don't recognize.">
      {query.isPending && <LoadingState label="Loading…" />}
      <ul className="sess-list">
        {(query.data?.items ?? []).map((s) => (
          <li key={s.id}>
            <Laptop size={15} />
            <div>
              <strong>Session</strong>
              <span className="faint small">
                signed in {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })} · expires{' '}
                {new Date(s.expiresAt).toLocaleDateString()}
              </span>
            </div>
            <button aria-label="Revoke" onClick={() => revoke.mutate(s.id)} disabled={revoke.isPending}>
              <Trash2 size={14} />
            </button>
          </li>
        ))}
        {query.data?.items.length === 0 && <p className="muted small">No other active sessions.</p>}
      </ul>
    </Card>
  );
}

function NotifyCard() {
  const toast = useToast();
  const query = useQuery({ queryKey: ['me-prefs'], queryFn: () => assistApi.getMyPreferences() });
  const save = useMutation({
    mutationFn: (body: Parameters<typeof assistApi.patchMyPreferences>[0]) =>
      assistApi.patchMyPreferences(body),
    onError: (e) => toast({ title: 'Save failed', description: e.message, kind: 'error' }),
  });
  const email = query.data?.notifyEmail ?? {};
  const inApp = query.data?.notifyInApp ?? {};
  const toggle = (scope: 'notifyEmail' | 'notifyInApp', key: string, v: boolean) =>
    save.mutate({ [scope]: { ...(scope === 'notifyEmail' ? email : inApp), [key]: v } });

  if (query.isPending) return <LoadingState label="Loading…" />;
  return (
    <Card title="Notifications" subtitle="What you get told about, and where.">
      <div className="pref-table">
        <div className="pref-row pref-row--head">
          <span />
          <span>Email</span>
          <span>In-app</span>
        </div>
        {NOTIFY_EVENTS.map((ev) => (
          <div key={ev.key} className="pref-row">
            <div>
              <strong>{ev.label}</strong>
              <span className="faint small">{ev.description}</span>
            </div>
            <Switch checked={email[ev.key] !== false} onChange={(v) => toggle('notifyEmail', ev.key, v)} aria-label={`Email — ${ev.label}`} />
            <Switch checked={inApp[ev.key] !== false} onChange={(v) => toggle('notifyInApp', ev.key, v)} aria-label={`In-app — ${ev.label}`} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivityCard() {
  const query = useQuery({ queryKey: ['audit-feed'], queryFn: () => assistApi.listAuditEvents(30) });
  return (
    <Card title="Recent activity" subtitle="What changed in this workspace — most recent first.">
      {query.isPending && <LoadingState label="Loading…" />}
      <ul className="activity-list">
        {(query.data?.items ?? []).map((a) => (
          <li key={a.id}>
            <div className="activity-list__main">
              <span className="activity-list__action">{a.action}</span>
              {a.resourceType && <span className="activity-list__res">{a.resourceType}</span>}
            </div>
            <div className="activity-list__meta">
              {a.actor ?? 'System'} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
            </div>
          </li>
        ))}
        {query.data?.items.length === 0 && <p className="muted small">No activity yet.</p>}
      </ul>
    </Card>
  );
}

export function SettingsPage() {
  useDocumentTitle('Settings');
  const { user, signOut } = useAuth();
  const toast = useToast();
  const canUpdateUser = useCan('user.update');
  const [name, setName] = useState(user?.name ?? '');
  const exportMut = useMutation({
    mutationFn: () => assistApi.exportMyData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `wymnet-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    onError: (e) => toast({ title: 'Export failed', description: e.message, kind: 'error' }),
  });

  return (
    <>
      <PageHeader title="Settings" subtitle="Your account, notifications and workspace data." />
      <div className="settings-grid">
        <Card title="Profile">
          <div className="settings-profile">
            <label className="field">
              <span className="field-label">Name</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Email</span>
              <input className="input" value={user?.email ?? ''} disabled />
            </label>
            <p className="faint small">Your email is managed by your organization admin.</p>
          </div>
        </Card>
        <Card title="Security">
          <div className="settings-sec">
            <p className="muted small">
              <KeyRound size={13} /> Change your password via the{' '}
              <a href="/forgot-password">reset-password flow</a>, or ask an admin
              {canUpdateUser ? ' — you can also edit it from Team.' : '.'}
            </p>
            <SessionsCard />
          </div>
        </Card>
        <NotifyCard />
        <ActivityCard />
        <Card title="Data & privacy">
          <p className="muted small">Download everything we hold on your account as JSON.</p>
          <Button variant="secondary" size="sm" icon={<Download size={13} />} loading={exportMut.isPending} onClick={() => exportMut.mutate()}>
            Export my data
          </Button>
        </Card>
        <Card title="Sign out">
          <Button variant="danger" size="sm" icon={<LogOut size={13} />} onClick={() => void signOut()}>
            Sign out
          </Button>
          <p className="faint small" style={{ marginTop: 8 }}>
            <ShieldCheck size={11} /> Sessions are revoked server-side on sign-out.
          </p>
        </Card>
      </div>
    </>
  );
}
