import * as RadixSwitch from '@radix-ui/react-switch';
import './Switch.css';

export function Switch({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const sw = (
    <RadixSwitch.Root
      className="ui-switch"
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={label}
    >
      <RadixSwitch.Thumb className="ui-switch__thumb" />
    </RadixSwitch.Root>
  );
  if (!label) return sw;
  return (
    <label className="ui-switch-row">
      {sw}
      <span className="ui-switch-row__text">
        {label}
        {hint && <span className="ui-switch-row__hint">{hint}</span>}
      </span>
    </label>
  );
}
