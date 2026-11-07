import type { ReactNode } from 'react';
import { Button } from './Button';
import './States.css';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state-box">
      <Spinner label={label} />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  action,
  onRetry,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div className="state-box" role="alert">
      <span className="state-icon state-icon--error" aria-hidden>
        !
      </span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  compact,
}: {
  /** Illustration slot — pass a Lucide icon or custom graphic */
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`state-box${compact ? ' state-box--compact' : ''}`}>
      {icon && (
        <span className="state-icon" aria-hidden>
          {icon}
        </span>
      )}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
