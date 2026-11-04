import { SectionHead } from '../SectionHead';

const STEPS = [
  {
    title: 'Create your organization',
    body: 'One registration gives you an isolated workspace and an administrator account — no card, no commitment while you evaluate.',
  },
  {
    title: 'Enable the products you need',
    body: 'Each product is its own subscription. Start with the one that solves today’s problem and add others when they make sense.',
  },
  {
    title: 'Load what the products work on',
    body: 'Your documents for WymAssist, your spreadsheet exports for WymInsight, your process definitions for WymFlow. Each works on material you already have.',
  },
  {
    title: 'Your team works in one dashboard',
    body: 'Conversations, reports, and workflows share the same staff accounts, roles, and audit trail — nothing new to administer.',
  },
];

export function HowItWorks() {
  return (
    <section className="section section--white">
      <div className="container">
        <SectionHead
          eyebrow="How it works"
          title="From registration to a running system — without a project team"
          lede="WymNet is deliberately practical: each product works on material your organization already has, and the platform underneath handles the accounts, permissions, and audit."
        />
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.title}>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
