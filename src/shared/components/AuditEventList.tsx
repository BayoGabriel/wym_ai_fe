export type AuditEventLike = {
  id: string;
  actorName?: string | null;
  actorEmail?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  metadata?: string | null;
  createdAt: string;
};

function summarizeMetadata(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const meta = JSON.parse(raw) as Record<string, unknown>;
    const parts: string[] = [];
    if (Array.isArray(meta.fields) && meta.fields.length) {
      parts.push(`fields: ${meta.fields.join(', ')}`);
    }
    if (meta.changes && typeof meta.changes === 'object') {
      parts.push(`changed: ${Object.keys(meta.changes as object).join(', ')}`);
    }
    if (meta.from !== undefined || meta.to !== undefined) {
      parts.push(`${String(meta.from ?? '—')} → ${String(meta.to ?? '—')}`);
    }
    if (meta.via === 'platform_admin') parts.push('via platform admin');
    return parts.length ? parts.join(' · ') : null;
  } catch {
    return null;
  }
}

/** Timeline of audit events — who did what, and when. */
export function AuditEventList({ events }: { events: AuditEventLike[] }) {
  if (!events.length) return <p className="muted">No activity recorded.</p>;
  return (
    <ul className="row-list">
      {events.map((e) => {
        const meta = summarizeMetadata(e.metadata);
        return (
          <li key={e.id}>
            <div className="row-main">
              <div className="row-title mono">{e.action}</div>
              <div className="row-sub">
                {e.actorName ?? e.actorEmail ?? 'system'}
                {e.resourceType ? ` · ${e.resourceType}` : ''}
                {e.resourceId ? ` · ${e.resourceId.slice(0, 8)}…` : ''}
                {meta ? ` · ${meta}` : ''}
              </div>
            </div>
            <span className="row-meta">{new Date(e.createdAt).toLocaleString()}</span>
          </li>
        );
      })}
    </ul>
  );
}
