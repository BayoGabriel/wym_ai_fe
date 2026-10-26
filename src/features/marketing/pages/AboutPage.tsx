import { Eyebrow } from '../components/SectionHead';
import { FinalCta } from '../components/FinalCta';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const PRINCIPLES = [
  {
    title: 'Approved knowledge only',
    body: 'An assistant that speaks for an organization should only say what that organization has approved. Grounding in your documents is a design rule, not a feature toggle.',
  },
  {
    title: 'People stay in charge',
    body: 'AI handles the questions it can; a person takes the conversations that need one. Handoff is part of the product, not an apology for it.',
  },
  {
    title: 'Honest product status',
    body: 'We label what is available and what is planned. You should never have to guess which parts of this website describe working software.',
  },
  {
    title: 'One platform, several jobs',
    body: 'WymAssist, and the planned WymInsight and WymFlow, share the same organization, permission, and audit foundation — not three disconnected tools.',
  },
];

export function AboutPage() {
  useDocumentTitle(
    'About',
    'WymNet builds software that makes organizational knowledge useful — starting with WymAssist, an AI assistant grounded in approved knowledge.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>About WymNet</Eyebrow>
          <h1 className="display display--page">
            Software that makes organizational knowledge useful
          </h1>
          <p className="lede">
            Most organizations already own the answers their customers and staff need — they’re just
            locked inside documents, inboxes, and people’s heads. WymNet builds products that put
            that knowledge to work.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container prose">
          <p>
            <strong>WymNet AI Solutions &amp; Automation</strong> is a technology platform for
            organizational AI, business intelligence, and workflow automation. The first product,
            WymAssist, is live: it answers visitor questions on your website using the documents
            your team approves, captures the enquiries worth following up, and hands conversations
            to staff when a person should take over.
          </p>
          <p>
            Two further products are designed on the same foundation: WymInsight, for analytics and
            reporting over organizational data, and WymFlow, for forms, approvals, and workflow
            automation. Both are planned — you’ll see them labelled as such wherever they appear on
            this site, because we don’t present roadmap work as finished software.
          </p>
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <Eyebrow>How we build</Eyebrow>
          <h2
            className="display display--section"
            style={{ margin: 'var(--space-2) 0 var(--space-6)' }}
          >
            Four principles behind the products
          </h2>
          <ol className="steps">
            {PRINCIPLES.map((p) => (
              <li key={p.title}>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
