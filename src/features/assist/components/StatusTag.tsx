export function StatusTag({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span className={`stag stag--${key}`}>
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')}
    </span>
  );
}
