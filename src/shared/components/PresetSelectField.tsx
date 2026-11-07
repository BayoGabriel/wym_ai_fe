import { useId, useState } from 'react';
import { Select } from './Select';

type Props = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  hint?: string;
  customPlaceholder?: string;
};

const CUSTOM = '__custom__';

/**
 * Select with predefined options plus a "Custom…" choice that reveals a
 * free-text input. Existing non-preset values open in custom mode.
 */
export function PresetSelectField({
  label,
  value,
  options,
  onChange,
  hint,
  customPlaceholder,
}: Props) {
  const autoId = useId();
  const [customMode, setCustomMode] = useState(() => !!value && !options.includes(value));
  const selectValue = customMode ? CUSTOM : options.includes(value) ? value : '';

  const handleSelect = (next: string) => {
    if (next === CUSTOM) {
      setCustomMode(true);
      if (options.includes(value)) onChange('');
    } else {
      setCustomMode(false);
      onChange(next);
    }
  };

  return (
    <div className="field">
      <span className="field__label" id={autoId}>
        {label}
      </span>
      <Select
        value={selectValue}
        onChange={handleSelect}
        ariaLabel={label}
        placeholder="Select…"
        options={[
          ...options.map((o) => ({ value: o, label: o })),
          { value: CUSTOM, label: 'Custom…' },
        ]}
      />
      {customMode && (
        <input
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={customPlaceholder}
          aria-label={`${label} (custom)`}
        />
      )}
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}
