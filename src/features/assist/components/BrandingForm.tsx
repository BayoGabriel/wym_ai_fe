import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import type { OrgSettings } from '../api/assist-api';
import { assistKeys } from '../queries';
import { adminApi, adminKeys } from '../../admin/api/admin-api';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { PresetSelectField } from '../../../shared/components/PresetSelectField';
import { BUSINESS_CATEGORY_OPTIONS } from '../data/presets';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState } from '../../../shared/components/States';

export function BrandingForm({ orgId }: { orgId?: string } = {}) {
  const query = useQuery({
    queryKey: orgId ? adminKeys.orgOverview(orgId) : assistKeys.settings,
    queryFn: async () =>
      orgId
        ? (await adminApi.getOrgOverview(orgId)).settings
        : assistApi.getOrgSettings(),
  });
  if (query.isPending) return <LoadingState label="Loading settings…" />;
  return <BrandingFormInner initial={query.data ?? {}} orgId={orgId} />;
}

function BrandingFormInner({ initial, orgId }: { initial: OrgSettings; orgId?: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<OrgSettings>(initial);

  const save = useMutation({
    mutationFn: () =>
      orgId ? adminApi.patchOrgSettings(orgId, form) : assistApi.patchOrgSettings(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orgId ? adminKeys.orgOverview(orgId) : assistKeys.settings,
      });
      if (orgId) {
        void queryClient.invalidateQueries({ queryKey: adminKeys.orgAudit(orgId) });
      }
    },
  });

  const set = (key: keyof OrgSettings) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <form
      className="card"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <h2 className="section-title">Business profile &amp; branding</h2>
      {save.isError && <Alert kind="error">{save.error.message}</Alert>}
      {save.isSuccess && <Alert kind="success">Saved.</Alert>}
      <div className="form-grid">
        <TextField
          label="Business name"
          value={form.businessName ?? ''}
          onChange={set('businessName')}
        />
        <PresetSelectField
          label="Business category"
          value={form.businessCategory ?? ''}
          options={BUSINESS_CATEGORY_OPTIONS}
          onChange={(v) => setForm({ ...form, businessCategory: v })}
          customPlaceholder="e.g. Logistics company"
        />
        <TextField label="Website" value={form.website ?? ''} onChange={set('website')} />
        <TextField
          label="Contact email"
          type="email"
          value={form.contactEmail ?? ''}
          onChange={set('contactEmail')}
        />
        <TextField
          label="Contact phone"
          value={form.contactPhone ?? ''}
          onChange={set('contactPhone')}
        />
        <TextField label="Logo URL" value={form.logoUrl ?? ''} onChange={set('logoUrl')} />
        <TextField
          label="Primary color"
          value={form.primaryColor ?? ''}
          onChange={set('primaryColor')}
          placeholder="#0b5c40"
        />
        <TextField
          label="Secondary color"
          value={form.secondaryColor ?? ''}
          onChange={set('secondaryColor')}
        />
        <TextField
          label="WhatsApp phone number ID"
          value={form.whatsappPhoneNumberId ?? ''}
          onChange={set('whatsappPhoneNumberId')}
          hint="Meta Cloud API phone_number_id — binds inbound WhatsApp to this organization"
        />
        <TextField
          label="Facebook Page ID"
          value={form.messengerPageId ?? ''}
          onChange={set('messengerPageId')}
          hint="Binds inbound Messenger messages from this page to this organization"
        />
        <TextField
          label="Instagram account ID"
          value={form.instagramAccountId ?? ''}
          onChange={set('instagramAccountId')}
          hint="Instagram professional account ID — binds inbound DMs to this organization"
        />
        <TextField
          label="Telegram bot token"
          value={form.telegramBotToken ?? ''}
          onChange={set('telegramBotToken')}
          hint="From @BotFather — point the bot's webhook at /api/v1/webhooks/telegram/<token>"
        />
        <TextField
          label="Inbound email address"
          type="email"
          value={form.inboundEmailAddress ?? ''}
          onChange={set('inboundEmailAddress')}
          hint="Dedicated inbound address — mail to it becomes an assistant conversation"
        />
      </div>
      <Button type="submit" loading={save.isPending} style={{ marginTop: 'var(--space-4)' }}>
        Save settings
      </Button>
    </form>
  );
}
