import { SectionHead } from '../SectionHead';

const FAQS = [
  {
    q: 'What does WymNet actually sell?',
    a: 'Three products on one platform: WymAssist for customer support and communication, WymInsight for business intelligence and analytics, and WymFlow for process automation. You subscribe to the ones you need.',
  },
  {
    q: 'Do I have to subscribe to every product?',
    a: 'No. Each product is an independent subscription and works on its own. Running WymAssist alone is a complete deployment — adding WymInsight or WymFlow later is a benefit, never a requirement.',
  },
  {
    q: 'Does the AI make up answers?',
    a: 'No. WymAssist answers only from documents your team has uploaded, processed, and published. When a question falls outside your knowledge base, the assistant says so and can route the visitor to a human instead of guessing.',
  },
  {
    q: 'How do our teams and data stay separated from other customers?',
    a: 'Every client gets an isolated organization boundary: its own staff accounts, roles, permissions, branding, and subscriptions — with audit events recording sensitive actions.',
  },
  {
    q: 'How do we get started?',
    a: 'Create your organization for free, load the material the products work on — documents, spreadsheets, or process definitions — and talk to us about enabling the products you need.',
  },
];

export function FaqSection() {
  return (
    <section className="section section--white">
      <div className="container" style={{ maxWidth: '820px' }}>
        <SectionHead
          eyebrow="Questions"
          title="The things organizations ask before signing up"
        />
        <div className="faq">
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <span className="faq-icon" aria-hidden>
                  +
                </span>
              </summary>
              <div className="faq-body">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
