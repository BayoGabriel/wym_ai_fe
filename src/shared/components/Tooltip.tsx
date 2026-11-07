import type { ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import './Tooltip.css';

/** Mount once at app root — every Tooltip shares the provider's delay. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={250} skipDelayDuration={100}>
      {children}
    </RadixTooltip.Provider>
  );
}

export function Tooltip({
  content,
  children,
  side = 'top',
  kbd,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  kbd?: string;
}) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className="ui-tooltip" side={side} sideOffset={6}>
          {content}
          {kbd && <span className="ui-tooltip__kbd">{kbd}</span>}
          <RadixTooltip.Arrow className="ui-tooltip__arrow" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
