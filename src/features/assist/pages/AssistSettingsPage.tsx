import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../shared/components/PageHeader';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { useAuth } from '../../../app/providers/auth-context';
import { AssistantConfigForm } from '../components/AssistantConfigForm';
import { BrandingForm } from '../components/BrandingForm';
import { IntakeFieldsEditor } from '../components/IntakeFieldsEditor';
import { EmbedSnippet } from '../components/EmbedSnippet';
import { AuditEventList } from '../../../shared/components/AuditEventList';
import { listOrganizationAuditEvents } from '../../organizations/organizations-api';
import { ErrorState, LoadingState } from '../../../shared/components/States';

const TABS = [
  { key: 'behavior', label: 'Behavior' },
  { key: 'intake', label: 'Intake fields' },
  { key: 'branding', label: 'Business profile' },
  { key: 'embed', label: 'Install on website' },
  { key: 'activity', label: 'Activity' },
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
      {tab === 'activity' && <OrgActivity />}
    </>
  );
}

/** Change history for this organization — includes edits made by the platform team. */
function OrgActivity() {
  const { user } = useAuth();
  const orgId = user?.organizationId;
  const events = useQuery({
    queryKey: ['organizations', orgId, 'audit-events'],
    queryFn: () => listOrganizationAuditEvents(orgId!, 100),
    enabled: !!orgId,
  });

  return (
    <section className="card">
      <div className="card-head">
        <h2>Account activity</h2>
        <span className="card-note">
          Changes made to your account and configuration — by your team or by our platform staff.
        </span>
      </div>
      {events.isPending && <LoadingState label="Loading activity…" />}
      {events.isError && <ErrorState message={events.error.message} />}
      {events.data && <AuditEventList events={events.data} />}
    </section>
  );
}
