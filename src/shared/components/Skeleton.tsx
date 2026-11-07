import './Skeleton.css';

export function Skeleton({ w, h = 12, rounded }: { w?: string | number; h?: number; rounded?: boolean }) {
  return (
    <span
      className={`sk${rounded ? ' sk--round' : ''}`}
      style={{ width: w ?? '100%', height: h, display: 'block' }}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card card--pad0" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}
        >
          <Skeleton w={`${88 - (i % 3) * 18}%`} h={13} />
        </div>
      ))}
    </div>
  );
}

/** Card-shaped loading placeholder matching StatTile/Card silhouettes. */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card" aria-busy="true">
      <Skeleton w="40%" h={14} />
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} w={`${92 - i * 16}%`} h={12} />
        ))}
      </div>
    </div>
  );
}

export function StatStripSkeleton({ tiles = 4 }: { tiles?: number }) {
  return (
    <div className="stat-grid" aria-busy="true">
      {Array.from({ length: tiles }).map((_, i) => (
        <div key={i} className="stat-card">
          <Skeleton w="55%" h={11} />
          <div style={{ marginTop: 8 }}>
            <Skeleton w="38%" h={20} />
          </div>
        </div>
      ))}
    </div>
  );
}
