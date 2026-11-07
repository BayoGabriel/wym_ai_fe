import type { ReactNode } from 'react';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { EmptyState } from './States';
import './ChartCard.css';

export function ChartCard({
  title,
  subtitle,
  actions,
  loading,
  empty,
  height = 260,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  empty?: { title: string; message?: string };
  height?: number;
  children: ReactNode;
}) {
  return (
    <Card title={title} subtitle={subtitle} actions={actions} className="ui-chartcard">
      {loading ? (
        <div className="ui-chartcard__loading" style={{ height }} aria-busy="true">
          <Skeleton h={height - 20} />
        </div>
      ) : empty ? (
        <div className="ui-chartcard__empty" style={{ height }}>
          <EmptyState title={empty.title} message={empty.message} compact />
        </div>
      ) : (
        <div className="ui-chartcard__body" style={{ height }}>
          {children}
        </div>
      )}
    </Card>
  );
}
