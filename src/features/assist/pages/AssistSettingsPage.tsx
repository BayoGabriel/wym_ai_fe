import { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { AssistantConfigForm } from '../components/AssistantConfigForm';
import { BrandingForm } from '../components/BrandingForm';
import { IntakeFieldsEditor } from '../components/IntakeFieldsEditor';
import { EmbedSnippet } from '../components/EmbedSnippet';
import { ErrorState } from '../../../shared/components/States';

const TABS = [
  { key: 'behavior', label: 'Behavior' },
  { key: 'intake', label: 'Intake fields' },
  { key: 'branding', label: 'Business profile' },
  { key: 'embed', label: 'Install on website' },
] as const;

export function AssistSettingsPage() {
  useDocumentTitle('Assistant settings');
  const canUpdate = useCan('organization.update');
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('behavior');

  if (!canUpdate) {
    return (
      <ErrorState
        title="Insufficient permissions"
        message="Ask an administrator for organization.update access."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Assistant settings"
        subtitle="Configure how the assistant behaves, looks, and collects information."
      />
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'behavior' && <AssistantConfigForm />}
      {tab === 'intake' && <IntakeFieldsEditor />}
      {tab === 'branding' && <BrandingForm />}
      {tab === 'embed' && <EmbedSnippet />}
    </>
  );
}
