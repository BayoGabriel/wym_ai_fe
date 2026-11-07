import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus, Download, Kanban, Search, Table2, X } from 'lucide-react';
import { assistApi, type Lead } from '../api/assist-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ErrorState, EmptyState } from '../../../shared/components/States';
import { TableSkeleton } from '../../../shared/components/Skeleton';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useDebounced } from '../../../shared/utils/useDebounced';
import { useCan } from '../../../shared/auth/use-permission';
import { usePrefs } from '../../../shared/prefs/prefs';
import { useToast } from '../../../shared/components/toast-context';
import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { Drawer } from '../../../shared/components/Drawer';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { SegmentedControl } from '../../../shared/components/SegmentedControl';
import { Select } from '../../../shared/components/Select';
import { Dropdown } from '../../../shared/components/Dropdown';
import { LeadKanban } from '../components/LeadKanban';
import { LEAD_STAGES } from '../components/lead-stages';
import { LeadDetail } from '../components/LeadDetail';
import '../styles/leads.css';

const ALL_STATUSES = ['', ...LEAD_STAGES] as const;

function csvEscape(v: unknown) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(leads: Lead[]) {
  const head = ['name', 'email', 'phone', 'category', 'status', 'source', 'consent', 'created'];
  const rows = leads.map((l) =>
    [
      l.name,
      l.email,
      l.phone,
      l.enquiryCategory,
      l.status,
      l.source,
      l.consentToContact ? 'yes' : 'no',
      l.createdAt,
    ]
      .map(csvEscape)
      .join(',')
  );
  const blob = new Blob([head.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LeadsPage() {
  useDocumentTitle('Leads');
  const canWrite = useCan('lead.write');
  const toast = useToast();
  const qc = useQueryClient();
  const [prefs, setPref] = usePrefs();

  const [view, setView] = useState<'table' | 'kanban'>(
    (prefs.activeViews?.['leads:mode'] as 'table' | 'kanban') ?? 'kanban'
  );
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q, 220);
  const [selected, setSelected] = useState<string | null>(null);

  // In Kanban mode pull a big window of leads; table mode is paged server-side.
  const query = useQuery({
    queryKey: ['leads', view, status || 'all', debouncedQ],
    queryFn: () =>
      assistApi.listLeads({ status: status || undefined, q: debouncedQ || undefined, limit: view === 'kanban' ? 200 : 50 }),
    placeholderData: (prev) => prev,
  });

  const move = useMutation({
    mutationFn: ({ id, status: s }: { id: string; status: string }) =>
      assistApi.updateLead(id, { status: s }),
    onMutate: async ({ id, status: s }) => {
      await qc.cancelQueries({ queryKey: ['leads'] });
      const snapshots = qc.getQueriesData<{ items: Lead[] }>({ queryKey: ['leads'] });
      qc.setQueriesData<{ items: Lead[] }>({ queryKey: ['leads'] }, (old) =>
        old ? { ...old, items: old.items.map((l) => (l.id === id ? { ...l, status: s } : l)) } : old
      );
      return { snapshots };
    },
    onError: (e, _v, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      toast({ title: 'Move failed', description: e.message, kind: 'error' });
    },
    onSuccess: (_d, { status: s }) => {
      toast({ title: `Moved to ${s.toLowerCase()}`, kind: 'success' });
      void qc.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const savedViews = prefs.savedViews?.['leads'] ?? [];
  const applyView = (name: string) => {
    const v = savedViews.find((x) => x.name === name);
    if (!v) return;
    setStatus(v.filters.status ?? '');
    setQ(v.filters.q ?? '');
    setPref('activeViews', { ...prefs.activeViews, leads: name });
  };
  const saveView = () => {
    const name = window.prompt('Name this view');
    if (!name) return;
    const next = [
      ...savedViews.filter((v) => v.name !== name),
      { name, filters: { status, q } },
    ];
    setPref('savedViews', { ...prefs.savedViews, leads: next });
    setPref('activeViews', { ...prefs.activeViews, leads: name });
  };

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        key: 'name',
        header: 'Lead',
        render: (l) => (
          <>
            <div className="t-title">{l.name ?? 'Unnamed lead'}</div>
            <div className="t-sub">{l.email ?? l.phone ?? 'No contact details'}</div>
          </>
        ),
      },
      { key: 'category', header: 'Category', render: (l) => l.enquiryCategory ?? '—' },
      {
        key: 'status',
        header: 'Status',
        render: (l) => <StatusBadge status={l.status} />,
      },
      { key: 'source', header: 'Source', render: (l) => l.source.toLowerCase().replace(/_/g, ' ') },
      {
        key: 'created',
        header: 'Captured',
        render: (l) => new Date(l.createdAt).toLocaleDateString(),
      },
    ],
    []
  );

  const leads = query.data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Contact details visitors shared during conversations."
        actions={
          <>
            <SegmentedControl
              ariaLabel="View"
              size="sm"
              options={[
                { value: 'kanban', label: 'Board', icon: <Kanban size={13} /> },
                { value: 'table', label: 'Table', icon: <Table2 size={13} /> },
              ]}
              value={view}
              onChange={(v) => {
                setView(v as 'table' | 'kanban');
                setPref('activeViews', { ...prefs.activeViews, 'leads:mode': v });
              }}
            />
            <button className="status-select" onClick={() => exportCsv(leads)}>
              <Download size={13} /> Export
            </button>
          </>
        }
      />
      <div className="toolbar leads-toolbar">
        <Select
          ariaLabel="Status filter"
          size="sm"
          value={status}
          onChange={setStatus}
          options={ALL_STATUSES.map((s) => ({
            value: s,
            label: s ? s[0] + s.slice(1).toLowerCase() : 'All statuses',
          }))}
        />
        <div className="leads-search">
          <Search size={13} />
          <input placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && (
            <button aria-label="Clear" onClick={() => setQ('')}>
              <X size={12} />
            </button>
          )}
        </div>
        <div className="toolbar-end">
          {savedViews.length > 0 && (
            <Select
              ariaLabel="Saved views"
              size="sm"
              value={prefs.activeViews?.['leads'] ?? ''}
              onChange={applyView}
              options={[
                { value: '', label: 'Saved views…' },
                ...savedViews.map((v) => ({ value: v.name, label: v.name })),
              ]}
            />
          )}
          <Dropdown
            align="end"
            trigger={
              <button className="status-select" aria-label="View options">
                <BookmarkPlus size={13} /> Views
              </button>
            }
            items={[
              { type: 'item', label: 'Save current filters as view', onSelect: saveView },
              ...(savedViews.length
                ? savedViews.map((v) => ({
                    type: 'item' as const,
                    label: `Apply “${v.name}”`,
                    onSelect: () => applyView(v.name),
                  }))
                : [{ type: 'label' as const, label: 'No saved views yet' }]),
            ]}
          />
          <span className="muted small">{query.data ? `${query.data.total} leads` : ''}</span>
        </div>
      </div>

      {query.isPending && <TableSkeleton />}
      {query.isError && <ErrorState message={query.error.message} />}
      {query.data &&
        (leads.length === 0 ? (
          <EmptyState
            title={status || q ? 'No leads match' : 'No leads yet'}
            message={
              status || q
                ? 'Try widening the filters or clearing search.'
                : 'Leads appear when visitors share contact details — enable lead capture in Studio.'
            }
          />
        ) : view === 'kanban' ? (
          <LeadKanban
            leads={leads}
            onMove={(id, s) => canWrite && move.mutate({ id, status: s })}
            onOpen={setSelected}
          />
        ) : (
          <DataTable
            persistKey="leads"
            columns={columns}
            rows={leads}
            rowKey={(l) => l.id}
            onRowClick={(l) => setSelected(l.id)}
          />
        ))}

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Lead details"
        width={440}
      >
        {selected && <LeadDetail leadId={selected} />}
      </Drawer>
    </>
  );
}
