import { ButtonLink } from '../../../shared/components/Button';
import { Eyebrow, SectionHead } from '../components/SectionHead';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/icons';
import { env } from '../../../shared/config/env';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const COVERS = [
  {
    title: 'Your use cases',
    body: 'Which products interest you and the problems you’re trying to solve — customer support, reporting, internal processes, or all three.',
  },
  {
    title: 'Your content and data',
    body: 'The documents, datasets, or processes the products will work on — and roughly how much of it there is.',
  },
  {
    title: 'Expected volume',
    body: 'Roughly how many conversations, datasets, workflows, and team members you expect — enough for us to size the engagement sensibly.',
  },
];

const INCLUDED = [
  'Your own isolated organization workspace',
  'Staff accounts with role-based permissions and audit events',
  'Every product you enable, complete — no feature tiers',
  'WymAssist: knowledge base, chat widget, lead capture, handoff, appointments, reports',
  'WymInsight: dataset uploads, profiling, trends, forecasts, AI summaries, CSV export',
  'WymFlow: workflow definitions, submissions, approvals, documents, reminders, timelines',
  'WymNet-managed product entitlements — subscribe per product',
];

const STEPS = [
  {
    title: 'Register — free, no card',
    body: 'Create your organization workspace and admin account in one step. Nothing is charged and nothing expires while you evaluate.',
  },
  {
    title: 'We scope it together',
    body: 'A short conversation about your use cases, data volume, and expected traffic produces terms sized to your organization.',
  },
  {
    title: 'Products are enabled',
    body: 'WymNet activates the products you agreed on. Each is its own subscription — a single product is a complete deployment.',
  },
];

export function PricingPage() {
  useDocumentTitle(
    'Pricing — Talk to Us About Terms',
    'WymNet does not publish a fixed price list. Tell us about your organization and we will scope terms for WymAssist, WymInsight, or WymFlow together.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="display display--page">Pricing is a conversation, not a table</h1>
          <p className="lede">
            WymNet doesn’t publish a fixed price list. Deployments differ in conversation volume,
            data size, workflow count, and team size, so we scope terms with each organization
            directly. Creating an organization takes minutes and asks for no payment details.
          </p>
          <div className="cta-row" style={{ marginTop: 'var(--space-6)' }}>
            <ButtonLink to="/register" size="lg">
              Create your organization
            </ButtonLink>
            <a className="btn btn--secondary btn--lg" href={`mailto:${env.VITE_CONTACT_EMAIL}`}>
              Email us about pricing
            </a>
          </div>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="How engagement works"
              title="Three steps from signup to live"
            />
          </Reveal>
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
      <section className="section section--white">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="What’s included"
              title="Every deployment ships with the full platform"
              lede="These aren’t add-ons or tiers — they’re the product. What varies with scope is capacity and support, not features."
            />
          </Reveal>
          <Reveal delay={80}>
            <ul className="check-list">
              {INCLUDED.map((i) => (
                <li key={i}>
                  <Icon name="check" size={16} />
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal>
            <Eyebrow>What we’ll ask</Eyebrow>
            <h2
              className="display display--section"
              style={{ margin: 'var(--space-2) 0 var(--space-6)' }}
            >
              Three things shape a deployment
            </h2>
          </Reveal>
          <ol className="steps">
            {COVERS.map((c) => (
              <li key={c.title}>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="lede" style={{ marginTop: 'var(--space-6)' }}>
            Write to <a href={`mailto:${env.VITE_CONTACT_EMAIL}`}>{env.VITE_CONTACT_EMAIL}</a> with
            a sentence or two about your organization — we’ll take it from there.
          </p>
        </div>
      </section>
    </>
  );
}
