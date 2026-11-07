import type { ReactNode } from 'react';
import './PageHeader.css';

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Small label above the title — product name, section, back link */
  eyebrow?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div className="page-head__text">
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
