import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export function Card({
  title,
  subtitle,
  actions,
  pad = 'md',
  hover,
  className,
  children,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  pad?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}) {
  const cls = [
    'ui-card',
    `ui-card--pad-${pad}`,
    hover ? 'ui-card--hover' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section className={cls} {...rest}>
      {(title || actions) && (
        <header className="ui-card__head">
          <div className="ui-card__titles">
            {title && <h2 className="ui-card__title">{title}</h2>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
