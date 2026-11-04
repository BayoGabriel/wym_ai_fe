import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import type { Lead } from '../api/assist-api';
import { assistKeys, assistQueries } from '../queries';
import { useCan } from '../../../shared/auth/use-permission';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { StatusTag } from './StatusTag';
import { NotesPanel } from './NotesPanel';

const NEXT_STATUSES: Record<string, string[]> = {
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['CONVERTED', 'LOST'],
};

export function LeadDetail({ leadId }: { leadId: string }) {
  const canWrite = useCan('lead.write');
  const queryClient = useQueryClient();
  const lead = useQuery(assistQueries.lead(leadId));
  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assistKeys.lead(leadId) });
      void queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  if (lead.isPending) return <LoadingState label="Loading lead…" />;
  if (lead.isError) return <ErrorState message={lead.error.message} />;
  const l: Lead = lead.data;
  const next = NEXT_STATUSES[l.status] ?? [];

  return (
    <div>
      {act.isError && <Alert kind="error">{act.error.message}</Alert>}
      <section className="card">
        <div className="card-head">
          <h2>{l.name ?? 'Unnamed lead'}</h2>
          <StatusTag status={l.status} />
        </div>
        <dl className="detail-list">
          <dt>Email</dt>
          <dd>{l.email ?? '—'}</dd>
          <dt>Phone</dt>
          <dd>{l.phone ?? '—'}</dd>
          <dt>Category</dt>
          <dd>{l.enquiryCategory ?? '—'}</dd>
          <dt>Consent to contact</dt>
          <dd>{l.consentToContact ? 'Yes' : 'No'}</dd>
          {l.summary && (
            <>
              <dt>Summary</dt>
              <dd>{l.summary}</dd>
            </>
          )}
          {l.customFields &&
            Object.entries(l.customFields).map(([k, v]) => (
              <span key={k} style={{ display: 'contents' }}>
                <dt>{k}</dt>
                <dd>{String(v)}</dd>
              </span>
            ))}
        </dl>
        {canWrite && next.length > 0 && (
          <div className="pill-list" style={{ marginTop: 'var(--space-3)' }}>
            {next.map((s) => (
              <button
                key={s}
                className="pill"
                onClick={() => act.mutate(() => assistApi.updateLead(l.id, { status: s }))}
              >
                Mark {s.toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </section>
      <NotesPanel
        notes={l.notes ?? []}
        canWrite={canWrite}
        onAdd={(body) => act.mutate(() => assistApi.addLeadNote(l.id, body))}
      />
    </div>
  );
}
