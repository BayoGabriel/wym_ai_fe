import type { ReactNode } from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import './Dropdown.css';

export type DropdownItem =
  | { type: 'item'; label: ReactNode; icon?: ReactNode; onSelect?: () => void; danger?: boolean; disabled?: boolean; shortcut?: string }
  | { type: 'separator' }
  | { type: 'label'; label: ReactNode }
  | { type: 'custom'; node: ReactNode };

export function Dropdown({
  trigger,
  items,
  align = 'end',
  side = 'bottom',
  width,
}: {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  width?: number;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          className="ui-menu"
          align={align}
          side={side}
          sideOffset={6}
          style={width ? { width } : undefined}
        >
          {items.map((item, i) => {
            if (item.type === 'separator') return <Menu.Separator key={i} className="ui-menu__sep" />;
            if (item.type === 'label')
              return (
                <Menu.Label key={i} className="ui-menu__label">
                  {item.label}
                </Menu.Label>
              );
            if (item.type === 'custom')
              return (
                <div key={i} className="ui-menu__custom">
                  {item.node}
                </div>
              );
            return (
              <Menu.Item
                key={i}
                className={`ui-menu__item${item.danger ? ' ui-menu__item--danger' : ''}`}
                disabled={item.disabled}
                onSelect={item.onSelect}
              >
                {item.icon && <span className="ui-menu__icon">{item.icon}</span>}
                <span className="ui-menu__text">{item.label}</span>
                {item.shortcut && <span className="ui-menu__shortcut">{item.shortcut}</span>}
              </Menu.Item>
            );
          })}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
