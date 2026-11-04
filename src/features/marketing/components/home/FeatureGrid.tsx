import { SectionHead } from '../SectionHead';
import { Reveal } from '../Reveal';
import { Icon } from '../icons';
import type { IconName } from '../icons';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'book',
    title: 'AI answers grounded in your documents',
    body: 'WymAssist responds to customers strictly from the knowledge your team has approved — no invented claims wearing your brand.',
  },
  {
    icon: 'chat',
    title: 'Customer conversations, everywhere',
    body: 'A branded website widget plus WhatsApp, Messenger, Instagram, Telegram, and email — every enquiry lands in one inbox.',
  },
  {
    icon: 'chart',
    title: 'Analytics without a BI stack',
    body: 'WymInsight profiles spreadsheet uploads into KPIs, trends, forecasts, and plain-language summaries leadership can read directly.',
  },
  {
    icon: 'flow',
    title: 'Workflows that move themselves',
    body: 'WymFlow turns submissions into tracked instances with ordered approvals, reminders, and a permanent activity timeline.',
  },
  {
    icon: 'doc',
    title: 'Reports, not guesswork',
    body: 'Enquiry volumes, lead statuses, dataset analysis, and process timelines — exportable to CSV wherever the numbers need to go.',
  },
  {
    icon: 'shield',
    title: 'Enterprise-grade tenancy',
    body: 'Every organization gets isolated data, staff roles, permissions, audit events, and independent product subscriptions.',
  },
];

export function FeatureGrid() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow="What’s inside"
          title="Three jobs every organization has — handled properly"
          lede="Talking to customers, understanding performance, and running internal processes. Each product owns one job and does it end to end."
        />
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="feature-card">
                <span className="icon-chip">
                  <Icon name={f.icon} size={22} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
