const VARIANTS: Record<string, string> = {
  active: 'badge--active',
  trialing: 'badge--primary',
  pending: 'badge--warning',
  suspended: 'badge--warning',
  inactive: 'badge--muted',
  archived: 'badge--muted',
};

export function StatusBadge({ status }: { status: string }) {
  const variant = VARIANTS[status.toLowerCase()] ?? 'badge--muted';
  return <span className={`badge ${variant}`}>{status}</span>;
}
