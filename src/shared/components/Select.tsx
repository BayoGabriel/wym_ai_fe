import type { ReactNode } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import './Select.css';

export type SelectOption = { value: string; label: ReactNode; disabled?: boolean };

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  ariaLabel,
  size = 'md',
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={`ui-select${size === 'sm' ? ' ui-select--sm' : ''}`}
        aria-label={ariaLabel}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown size={14} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="ui-menu ui-select__content" position="popper" sideOffset={4}>
          <RadixSelect.Viewport>
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                className="ui-menu__item ui-select__item"
                value={o.value}
                disabled={o.disabled}
              >
                <RadixSelect.ItemText className="ui-menu__text">{o.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ui-select__check">
                  <Check size={14} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
