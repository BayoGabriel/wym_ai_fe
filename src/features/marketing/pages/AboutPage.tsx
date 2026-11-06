import { Eyebrow, SectionHead } from '../components/SectionHead';
import { FinalCta } from '../components/FinalCta';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const PRINCIPLES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'book',
    title: 'Approved knowledge only',
    body: 'An assistant that speaks for an organization should only say what that organization has approved. Grounding in your documents is a design rule, not a feature toggle.',
  },
  {
    icon: 'handoff',
    title: 'People stay in charge',
    body: 'AI handles the questions it can; a person takes the conversations that need one. Handoff is part of the product, not an apology for it.',
  },
  {
    icon: 'shield',
    title: 'Honest product status',
    body: 'We label what is available and what is on the roadmap. You should never have to guess which parts of this website describe working software.',
  },
  {
    icon: 'flow',
    title: 'One platform, several jobs',
    body: 'WymAssist, WymInsight, and WymFlow share the same organization, permission, and audit foundation — not three disconnected tools.',
  },
];

export function AboutPage() {
  useDocumentTitle(
    'About WymNet — Practical AI for Organizations',
    'WymNet AI Solutions & Automation builds practical AI software for customer communication, business analytics, and process automation on one platform.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>About WymNet</Eyebrow>
          <h1 className="display display--page">
            Practical AI for organizations that have real work to do
          </h1>
          <p className="lede">
            Most business software promises transformation. WymNet focuses on the unglamorous,
            essential work — answering customers, reading your own data, and moving internal
            processes — and does it properly.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container about-intro">
          <div className="prose">
            <p>
              <strong>WymNet AI Solutions &amp; Automation</strong> is a technology platform for
              customer communication, business intelligence, and workflow automation. It is
              multi-tenant by design: every client organization gets isolated data, its own staff
              roles, and its own product subscriptions — so one platform serves many organizations
              without rebuilding anything for each one.
            </p>
            <p>
              Three products run on that foundation, and all three are live today.{' '}
              <strong>WymAssist</strong> answers customer questions from your approved documents,
              captures leads, takes appointment requests, and hands off to your staff.{' '}
              <strong>WymInsight</strong> turns uploaded datasets into profiles, trends, forecasts,
              and reports your leadership can read. <strong>WymFlow</strong> runs forms, approvals,
              and internal workflows with a full audit trail.
            </p>
            <p>
              We serve small and medium businesses, customer-facing organizations, educational
              institutions, healthcare administrators, NGOs, and larger enterprises — any
              organization that would rather have working software than a slogan.
            </p>
          </div>
          <Reveal delay={80}>
            <figure className="frame frame--tall">
              <img
                src="/images/about-team.webp"
                alt="Two colleagues working together at a laptop in an office library"
                loading="lazy"
              />
              <figcaption>Built for the people doing the work</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <SectionHead eyebrow="How we build" title="Four principles behind the products" />
          <div className="feature-grid">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <div className="feature-card">
                  <span className="icon-chip">
                    <Icon name={p.icon} size={22} />
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
