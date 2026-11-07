import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, adminKeys } from '../api/admin-api';
import type { AdminOrgOverview } from '../api/admin-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { Select } from '../../../shared/components/Select';
import { TextField } from '../../../shared/components/TextField';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { StatusTag } from '../../assist/components/StatusTag';
import { AssistantConfigForm } from '../../assist/components/AssistantConfigForm';
import { BrandingForm } from '../../assist/components/BrandingForm';
import { IntakeFieldsEditor } from '../../assist/components/IntakeFieldsEditor';
import { AuditEventList } from '../../../shared/components/AuditEventList';
import { useToast } from '../../../shared/components/toast-context';
import { Dropdown } from '../../../shared/components/Dropdown';
import { Eye, Wand2 } from 'lucide-react';
import { startImpersonation } from '../../../shared/auth/impersonation';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'config', label: 'Assistant configuration' },
  { key: 'intake', label: 'Intake fields' },
  { key: 'branding', label: 'Business profile' },
  { key: 'activity', label: 'Activity' },
] as const;

const ORG_STATUSES = ['pending', 'active', 'suspended', 'archived'];
const SUB_STATUSES = ['trialing', 'active', 'suspended', 'cancelled', 'expired'];

const toOptions = (xs: string[]) =>
  xs.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

export function AdminOrganizationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('overview');
  const [confirm, setConfirm] = useState<'suspend' | 'activate' | 'delete' | null>(null);
  const overview = useQuery({
    queryKey: adminKeys.orgOverview(id),
    queryFn: () => adminApi.getOrgOverview(id),
    enabled: !!id,
  });
  useDocumentTitle(overview.data?.organization.name ?? 'Client');

  const org = overview.data?.organization;

  const applyTemplate = (template: 'dental_clinic' | 'salon' | 'saas_support') =>
    lifecycle.mutate(async () => {
      const res = await adminApi.applyTemplate(org!.id, template);
      toast({
        title: `Template applied — ${res.faqsCreated} starter FAQs added`,
        kind: 'success',
      });
    });

  const lifecycle = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      if (confirm === 'delete') {
        void queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
        toast({ title: `${org?.name} deleted`, kind: 'success' });
        navigate('/dashboard/admin/organizations');
        return;
      }
      void queryClient.invalidateQueries({ queryKey: adminKeys.orgOverview(id) });
      void queryClient.invalidateQueries({ queryKey: adminKeys.orgAudit(id) });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
      toast({
        title:
          confirm === 'suspend'
            ? `${org?.name} suspended — their team can't sign in`
            : `${org?.name} is active again`,
        kind: 'success',
      });
      setConfirm(null);
    },
    onError: (e) => {
      toast({ title: 'Action failed', description: e.message, kind: 'error' });
      setConfirm(null);
    },
  });

  const runConfirm = () => {
    if (!org || !confirm) return;
    if (confirm === 'delete') lifecycle.mutate(() => adminApi.deleteOrganization(org.id));
    else
      lifecycle.mutate(() =>
        adminApi.setOrganizationStatus(org.id, confirm === 'suspend' ? 'suspended' : 'active')
      );
  };

  return (
    <>
      <PageHeader
        title={org?.name ?? 'Client account'}
        subtitle={
          <>
            <Link to="/dashboard/admin/organizations">← Clients</Link>
            {org && <span className="muted"> · {org.slug}</span>}
          </>
        }
        actions={
          org ? (
            <div className="pill-list" style={{ alignItems: 'center' }}>
              <StatusTag status={org.status.toUpperCase()} />
              {org.status !== 'archived' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirm(org.status === 'active' ? 'suspend' : 'activate')}
                >
                  {org.status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                icon={<Eye size={13} />}
                onClick={async () => {
                  try {
                    const imp = await adminApi.impersonate(org.id);
                    startImpersonation(imp.accessToken);
                  } catch (e) {
                    toast({
                      title: 'View-as failed',
                      description: e instanceof Error ? e.message : 'No active users to view as',
                      kind: 'error',
                    });
                  }
                }}
              >
                View as
              </Button>
              <Dropdown
                trigger={
                  <button className="status-select">
                    <Wand2 size={13} /> Template
                  </button>
                }
                items={[
                  { type: 'label', label: 'Apply an industry template' },
                  { type: 'item', label: 'Dental clinic', onSelect: () => applyTemplate('dental_clinic') },
                  { type: 'item', label: 'Salon & beauty', onSelect: () => applyTemplate('salon') },
                  { type: 'item', label: 'SaaS support', onSelect: () => applyTemplate('saas_support') },
                ]}
              />
              <Button variant="danger" size="sm" onClick={() => setConfirm('delete')}>
                Delete client
              </Button>
            </div>
          ) : undefined
        }
      />
      {overview.isPending && <LoadingState label="Loading client…" />}
      {overview.isError && <ErrorState message={overview.error.message} />}
      {overview.data && (
        <>
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
          {tab === 'overview' && <OverviewTab data={overview.data} />}
          {tab === 'config' && <AssistantConfigForm orgId={id} />}
          {tab === 'intake' && <IntakeFieldsEditor orgId={id} />}
          {tab === 'branding' && <BrandingForm orgId={id} />}
          {tab === 'activity' && <ActivityTab orgId={id} />}
        </>
      )}

      <ConfirmDialog
        open={confirm === 'suspend' || confirm === 'activate'}
        title={
          confirm === 'suspend' ? `Suspend ${org?.name}?` : `Activate ${org?.name}?`
        }
        body={
          confirm === 'suspend' ? (
            <p>
              Everyone at <strong>{org?.name}</strong> will immediately lose access — their
              assistant stops answering and their team can't sign in until you re-activate
              the account. Nothing is deleted.
            </p>
          ) : (
            <p>
              <strong>{org?.name}</strong> and their team will regain full access right away.
            </p>
          )
        }
        confirmLabel={confirm === 'suspend' ? 'Suspend account' : 'Activate account'}
        danger={confirm === 'suspend'}
        loading={lifecycle.isPending}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title={`Delete ${org?.name} permanently?`}
        body={
          <p>
            This permanently removes <strong>{org?.name}</strong> — their users,
            conversations, leads, knowledge and settings.{' '}
            <strong>This can't be undone.</strong>
          </p>
        }
        confirmLabel="Delete permanently"
        danger
        loading={lifecycle.isPending}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}

function OverviewTab({ data }: { data: AdminOrgOverview }) {
  const queryClient = useQueryClient();
  const org = data.organization;
  const [form, setForm] = useState({ name: org.name, slug: org.slug, status: org.status });
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: adminKeys.orgOverview(org.id) });
    void queryClient.invalidateQueries({ queryKey: adminKeys.orgAudit(org.id) });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
  };

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: invalidate,
    onError: (e) => setError(e.message),
  });

  const saveIdentity = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    act.mutate(() =>
      adminApi.updateOrganization(org.id, {
        name: form.name,
        slug: form.slug,
        status: form.status,
      })
    );
  };

  return (
    <>
      {error && <Alert kind="error">{error}</Alert>}
      <div className="split">
        <form className="card" onSubmit={saveIdentity}>
          <h2 className="section-title">Organization</h2>
          <div className="form-grid">
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
            <div className="field">
              <span className="field__label">Status</span>
              <Select
                value={form.status}
                onChange={(status) => setForm({ ...form, status })}
                options={toOptions(ORG_STATUSES)}
                ariaLabel="Organization status"
              />
            </div>
          </div>
          <div className="field">
            <span className="field__label">Widget public key</span>
            <code className="mono muted">{org.publicKey ?? '—'}</code>
            <span className="field__hint">
              Created {new Date(org.createdAt).toLocaleString()}
            </span>
          </div>
          <Button type="submit" loading={act.isPending}>
            Save organization
          </Button>
        </form>

        <section className="card">
          <h2 className="section-title">Products</h2>
          <ul className="row-list">
            {data.products.map((p) => (
              <li key={p.productId}>
                <div className="row-main">
                  <div className="row-title">{p.name}</div>
                  <div className="row-sub mono">{p.code}</div>
                </div>
                <StatusTag status={p.status.toUpperCase()} />
              </li>
            ))}
            {data.products.length === 0 && (
              <li className="muted">No products assigned.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="card card--pad0">
        <div className="card-head" style={{ padding: 'var(--space-3) var(--space-4) 0' }}>
          <h2>Subscriptions</h2>
          <span className="card-note">{data.subscriptions.length} total</span>
        </div>
        <div className="table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th>Started</th>
                <th>Ends</th>
                <th className="num">Change status</th>
              </tr>
            </thead>
            <tbody>
              {data.subscriptions.map((s) => (
                <tr key={s.id} style={{ cursor: 'default' }}>
                  <td>
                    <div className="t-title">{s.productName ?? s.productCode ?? '—'}</div>
                    <div className="t-sub mono">{s.productCode}</div>
                  </td>
                  <td>
                    <StatusTag status={s.status.toUpperCase()} />
                  </td>
                  <td className="muted">{new Date(s.startAt).toLocaleDateString()}</td>
                  <td className="muted">
                    {s.endAt ? new Date(s.endAt).toLocaleDateString() : 'Open-ended'}
                  </td>
                  <td className="num">
                    <Select
                      size="sm"
                      value={s.status}
                      disabled={act.isPending}
                      onChange={(status) =>
                        act.mutate(() => adminApi.updateSubscription(s.id, { status }))
                      }
                      options={toOptions(SUB_STATUSES)}
                      ariaLabel="Change subscription status"
                    />
                  </td>
                </tr>
              ))}
              {data.subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No subscriptions — use the Subscriptions page to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Team members</h2>
          <span className="card-note">{data.users.length} users</span>
        </div>
        <ul className="row-list">
          {data.users.map((u) => (
            <li key={u.id}>
              <div className="row-main">
                <div className="row-title">{u.name}</div>
                <div className="row-sub">{u.email}</div>
              </div>
              <StatusTag status={u.status.toUpperCase()} />
            </li>
          ))}
          {data.users.length === 0 && <li className="muted">No users in this account.</li>}
        </ul>
      </section>
    </>
  );
}

function ActivityTab({ orgId }: { orgId: string }) {
  const events = useQuery({
    queryKey: adminKeys.orgAudit(orgId),
    queryFn: () => adminApi.listAuditEvents(100, orgId),
  });
  return (
    <section className="card">
      <div className="card-head">
        <h2>Change history</h2>
        <span className="card-note">
          Every change made to this account — by the client or the platform.
        </span>
      </div>
      {events.isPending && <LoadingState label="Loading activity…" />}
      {events.isError && <ErrorState message={events.error.message} />}
      {events.data && <AuditEventList events={events.data} />}
    </section>
  );
}
