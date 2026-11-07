import type { ReactNode } from 'react';
import './SegmentedControl.css';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  ariaLabel,
}: {
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}) {
  return (
    <div className={`ui-segmented${size === 'sm' ? ' ui-segmented--sm' : ''}`} role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          className={`ui-segmented__btn${o.value === value ? ' is-active' : ''}`}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
