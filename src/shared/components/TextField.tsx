import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ label, error, hint, id, ...rest }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={error ? 'input input--invalid' : 'input'}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...rest}
      />
      {error && (
        <span className="field__error" id={`${inputId}-error`} role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span className="field__hint" id={`${inputId}-hint`}>
          {hint}
        </span>
      )}
    </div>
  );
}
