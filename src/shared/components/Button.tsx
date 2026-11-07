import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

const classFor = (variant: ButtonVariant, size: ButtonSize, className = '') =>
  ['btn', `btn--${variant}`, size !== 'md' ? `btn--${size}` : '', className]
    .filter(Boolean)
    .join(' ');

export function Spinner({ size = 14 }: { size?: number }) {
  return <span className="btn-spinner" style={{ width: size, height: size }} aria-hidden />;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className,
  icon,
  iconRight,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={classFor(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

export function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: ButtonProps & { label: string }) {
  return (
    <button
      className={classFor(variant, size, `btn--icononly ${className ?? ''}`)}
      aria-label={label}
      title={label}
      {...rest}
    />
  );
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  children,
  className,
  icon,
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <Link to={to} className={classFor(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}
