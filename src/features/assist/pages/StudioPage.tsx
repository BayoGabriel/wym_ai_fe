import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquarePlus, ShieldCheck, Paintbrush } from 'lucide-react';
import { assistApi, type Guardrails, type WidgetAppearance } from '../api/assist-api';
import { assistQueries, assistKeys } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ErrorState, LoadingState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { useToast } from '../../../shared/components/toast-context';
import { Tabs } from '../../../shared/components/Tabs';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select';
import { Switch } from '../../../shared/components/Switch';
import { useOrgContext } from '../../organizations/queries/use-org-context';
import { AssistantConfigForm } from '../components/AssistantConfigForm';
import { BrandingForm } from '../components/BrandingForm';
import { IntakeFieldsEditor } from '../components/IntakeFieldsEditor';
import { EmbedSnippet } from '../components/EmbedSnippet';
import '../styles/studio.css';

const TABS = [
  { value: 'identity', label: 'Identity & behavior' },
  { value: 'widget', label: 'Widget', icon: <Paintbrush size={13} /> },
  { value: 'intake', label: 'Intake form' },
  { value: 'guardrails', label: 'Guardrails', icon: <ShieldCheck size={13} /> },
  { value: 'install', label: 'Install' },
] as const;

function TextList({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="studio-taglist">
        {values.map((v, i) => (
          <span key={i} className="studio-tag">
            {v}
            <button aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((_, j) => j !== i))}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="studio-taginput">
        <input
          className="input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              e.preventDefault();
              onChange([...values, draft.trim()]);
              setDraft('');
            }
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (draft.trim()) {
              onChange([...values, draft.trim()]);
              setDraft('');
            }
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function GuardrailsEditor() {
  const config = useQuery(assistQueries.config);
  const qc = useQueryClient();
  const toast = useToast();
  const g = (config.data?.guardrails ?? {}) as Guardrails;
  const [fallback, setFallback] = useState(g.fallbackMessage ?? '');
  const [triggers, setTriggers] = useState<string[]>(g.escalationTriggers ?? []);
  const [restricted, setRestricted] = useState<string[]>(g.restrictedTopics ?? []);
  const [medical, setMedical] = useState(!!g.medicalSafetyMode);

  const save = useMutation({
    mutationFn: () =>
      assistApi.patchAssistantConfig({
        guardrails: {
          fallbackMessage: fallback || undefined,
          escalationTriggers: triggers,
          restrictedTopics: restricted,
          medicalSafetyMode: medical,
        },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: assistKeys.config });
      toast({ title: 'Guardrails saved', kind: 'success' });
    },
    onError: (e) => toast({ title: 'Save failed', description: e.message, kind: 'error' }),
  });

  if (config.isPending) return <LoadingState label="Loading…" />;
  return (
    <Card title="Guardrails" subtitle="What the assistant must never do — enforced in the AI prompt.">
      <div className="studio-form">
        <label className="field">
          <span className="field-label">Fallback message</span>
          <textarea
            className="input"
            rows={3}
            value={fallback}
            onChange={(e) => setFallback(e.target.value)}
            placeholder="Shown when the assistant can't answer from knowledge…"
          />
        </label>
        <TextList label="Escalation triggers" values={triggers} onChange={setTriggers} placeholder="e.g. legal, refund, complaint" />
        <TextList label="Restricted topics" values={restricted} onChange={setRestricted} placeholder="e.g. politics, competitors" />
        <Switch
          checked={medical}
          onChange={setMedical}
          label="Medical safety mode"
          hint="Forbids diagnosis, prescriptions and dosage advice; always recommends a clinician."
        />
        <div>
          <Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>
            Save guardrails
          </Button>
        </div>
      </div>
    </Card>
  );
}

function WidgetEditor() {
  const config = useQuery(assistQueries.config);
  const settings = useQuery(assistQueries.settings);
  const qc = useQueryClient();
  const toast = useToast();
  const w = (config.data?.widgetAppearance ?? {}) as WidgetAppearance;
  const [position, setPosition] = useState(w.position ?? 'right');
  const [shape, setShape] = useState(w.shape ?? 'rounded');
  const [size, setSize] = useState(w.size ?? 'comfortable');
  const [mode, setMode] = useState(w.mode ?? 'light');
  const [greeting, setGreeting] = useState(w.greeting ?? '');

  const save = useMutation({
    mutationFn: () =>
      assistApi.patchAssistantConfig({
        widgetAppearance: { position, shape, size, mode, greeting: greeting || undefined },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: assistKeys.config });
      toast({ title: 'Widget appearance saved', kind: 'success' });
    },
    onError: (e) => toast({ title: 'Save failed', description: e.message, kind: 'error' }),
  });

  if (config.isPending) return <LoadingState label="Loading…" />;
  const accent = settings.data?.primaryColor ?? '#0b5c40';
  return (
    <div className="studio-widget">
      <Card title="Widget appearance" subtitle="How the launcher and chat panel look on your site.">
        <div className="studio-form">
          <Select ariaLabel="Launcher position" value={position} onChange={(v) => setPosition(v as typeof position)} options={[{ value: 'right', label: 'Bottom right' }, { value: 'left', label: 'Bottom left' }]} />
          <Select ariaLabel="Launcher shape" value={shape} onChange={(v) => setShape(v as typeof shape)} options={[{ value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }, { value: 'circle', label: 'Circle' }]} />
          <Select ariaLabel="Density" value={size} onChange={(v) => setSize(v as typeof size)} options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} />
          <Select ariaLabel="Color mode" value={mode} onChange={(v) => setMode(v as typeof mode)} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'auto', label: 'Match system' }]} />
          <label className="field">
            <span className="field-label">Greeting</span>
            <input className="input" value={greeting} onChange={(e) => setGreeting(e.target.value)} placeholder="Hi! How can we help?" />
          </label>
          <div>
            <Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>Save appearance</Button>
          </div>
        </div>
      </Card>
      <Card title="Preview" className="studio-preview">
        <div className="studio-preview__site">
          <div className={`studio-bubble studio-bubble--${position} studio-bubble--${size}`} style={{ background: accent, borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '8px' : '20px' }}>
            <MessageSquarePlus size={size === 'compact' ? 16 : 20} color="#fff" />
          </div>
          <div className={`studio-panel studio-panel--${mode === 'dark' ? 'dark' : 'light'}`} style={{ borderTopColor: accent }}>
            <div className="studio-panel__head" style={{ background: accent }}>
              {settings.data?.logoUrl && <img src={settings.data.logoUrl} alt="" />}
              {config.data?.assistantName ?? 'Assistant'}
            </div>
            <div className="studio-panel__body">
              <div className="studio-panel__msg">{greeting || config.data?.welcomeMessage || 'Hi! How can we help?'}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function StudioPage() {
  useDocumentTitle('Assistant Studio');
  const canUpdate = useCan('organization.update');
  const org = useOrgContext();
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('identity');

  if (!canUpdate) {
    return <ErrorState title="Insufficient permissions" message="Ask an administrator for organization.update access." />;
  }

  return (
    <>
      <PageHeader
        title="Assistant Studio"
        subtitle={`Everything that shapes how ${org.status === 'ready' && org.organization ? org.organization.name : 'your'} assistant behaves, looks and collects information.`}
      />
      <Tabs tabs={[...TABS]} value={tab} onChange={(v) => setTab(v as typeof tab)} />
      <div className="studio-body">
        {tab === 'identity' && <AssistantConfigForm />}
        {tab === 'widget' && <WidgetEditor />}
        {tab === 'intake' && (
          <div className="studio-intake">
            <IntakeFieldsEditor />
            <BrandingForm />
          </div>
        )}
        {tab === 'guardrails' && <GuardrailsEditor />}
        {tab === 'install' && <EmbedSnippet />}
      </div>
    </>
  );
}
