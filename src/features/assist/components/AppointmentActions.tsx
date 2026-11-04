const NEXT: Record<string, { label: string; status: string }[]> = {
  REQUESTED: [
    { label: 'Confirm', status: 'CONFIRMED' },
    { label: 'Cancel', status: 'CANCELLED' },
  ],
  CONFIRMED: [
    { label: 'Complete', status: 'COMPLETED' },
    { label: 'No-show', status: 'NO_SHOW' },
    { label: 'Cancel', status: 'CANCELLED' },
  ],
};

export function AppointmentActions({
  status,
  onTransition,
}: {
  status: string;
  onTransition: (next: string) => void;
}) {
  return (
    <div className="pill-list">
      {(NEXT[status] ?? []).map((n) => (
        <button key={n.status} className="pill" onClick={() => onTransition(n.status)}>
          {n.label}
        </button>
      ))}
    </div>
  );
}
