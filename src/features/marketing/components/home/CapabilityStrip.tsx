import { Icon } from '../icons';
import type { IconName } from '../icons';

const ITEMS: { icon: IconName; label: string }[] = [
  { icon: 'book', label: 'Grounded answers' },
  { icon: 'lead', label: 'Lead capture' },
  { icon: 'handoff', label: 'Human handoff' },
  { icon: 'calendar', label: 'Appointment requests' },
  { icon: 'widget', label: 'Embeddable widget' },
  { icon: 'chart', label: 'Dataset analytics' },
  { icon: 'flow', label: 'Approval workflows' },
  { icon: 'shield', label: 'Role-based access' },
  { icon: 'inbox', label: 'Conversation inbox' },
  { icon: 'lock', label: 'Tenant isolation' },
  { icon: 'doc', label: 'CSV & PDF ingestion' },
  { icon: 'globe', label: 'Multi-organization' },
];

/** Infinite marquee of platform capabilities — the honest "logo strip". */
export function CapabilityStrip() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="cap-strip" aria-hidden>
      <div className="cap-strip__track">
        {doubled.map((item, i) => (
          <span key={i} className="cap-strip__item">
            <Icon name={item.icon} size={15} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
