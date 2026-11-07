import type { ReactNode } from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import './Tabs.css';

export type TabDef = { value: string; label: ReactNode; count?: number; icon?: ReactNode };

export function Tabs({
  tabs,
  value,
  onChange,
  children,
  className,
}: {
  tabs: TabDef[];
  value: string;
  onChange: (v: string) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <RadixTabs.Root
      className={`ui-tabs-root${className ? ` ${className}` : ''}`}
      value={value}
      onValueChange={onChange}
    >
      <RadixTabs.List className="ui-tabs" aria-label="Sections">
        {tabs.map((t) => (
          <RadixTabs.Trigger key={t.value} className="ui-tab" value={t.value}>
            {t.icon}
            {t.label}
            {t.count !== undefined && <span className="ui-tab__count">{t.count}</span>}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixTabs.Content className="ui-tabpanel" value={value}>
      {children}
    </RadixTabs.Content>
  );
}
