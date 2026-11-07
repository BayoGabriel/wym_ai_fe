import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import './Alert.css';

const ICONS = {
  error: <XCircle size={16} />,
  success: <CheckCircle2 size={16} />,
  info: <Info size={16} />,
  warning: <AlertTriangle size={16} />,
};

export function Alert({
  kind = 'error',
  title,
  children,
  icon = true,
}: {
  kind?: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  children: ReactNode;
  icon?: boolean;
}) {
  return (
    <div className={`alert alert--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {icon && <span className="alert__icon">{ICONS[kind]}</span>}
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        {children}
      </div>
    </div>
  );
}
