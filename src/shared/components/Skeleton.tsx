export function Skeleton({ w, h = 12 }: { w?: string | number; h?: number }) {
  return <span className="sk" style={{ width: w ?? '100%', height: h, display: 'block' }} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card card--pad0" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--ws-border, #e2e6e3)' }}>
          <Skeleton w={`${88 - (i % 3) * 18}%`} h={13} />
        </div>
      ))}
    </div>
  );
}
