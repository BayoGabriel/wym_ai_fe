import { ButtonLink } from '../../../shared/components/Button';
import { Eyebrow } from '../components/SectionHead';
import { env } from '../../../shared/config/env';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const COVERS = [
  {
    title: 'Your use case',
    body: 'What you want the assistant to answer, and for whom — support, pre-sales, member services, or something else.',
  },
  {
    title: 'Your knowledge base',
    body: 'The documents and policies the assistant should work from, and how often they change.',
  },
  {
    title: 'Expected volume',
    body: 'Roughly how many visitor conversations and team members you expect — enough for us to size the engagement sensibly.',
  },
];

export function PricingPage() {
  useDocumentTitle(
    'Pricing',
    'WymNet does not publish fixed pricing. Tell us about your organization and we will work out terms together.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="display display--page">Pricing is a conversation, not a table</h1>
          <p className="lede">
            WymNet doesn’t publish a fixed price list. WymAssist deployments differ in knowledge
            volume, conversation volume, and team size, so we scope terms with each organization
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
      <section className="section section--white">
        <div className="container">
          <Eyebrow>What we’ll ask</Eyebrow>
          <h2
            className="display display--section"
            style={{ margin: 'var(--space-2) 0 var(--space-6)' }}
          >
            Three things shape a deployment
          </h2>
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
