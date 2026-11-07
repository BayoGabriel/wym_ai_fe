import { useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import './Combobox.css';

export type ComboboxOption = { value: string; label: string; hint?: string; icon?: ReactNode };

export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No matches',
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="ui-select ui-combobox" aria-label={ariaLabel}>
        <span className={selected ? '' : 'ui-combobox__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown size={14} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="ui-menu ui-combobox__content" align="start" sideOffset={4}>
          <Command>
            <Command.Input className="ui-combobox__input" placeholder={searchPlaceholder} autoFocus />
            <Command.List className="ui-combobox__list">
              <Command.Empty className="ui-combobox__empty">{emptyText}</Command.Empty>
              {options.map((o) => (
                <Command.Item
                  key={o.value}
                  value={`${o.label} ${o.value}`}
                  className="ui-menu__item ui-combobox__item"
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {o.icon}
                  <span className="ui-menu__text">
                    {o.label}
                    {o.hint && <span className="ui-combobox__hint">{o.hint}</span>}
                  </span>
                  {o.value === value && <Check size={14} className="ui-select__check" style={{ position: 'static' }} />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
