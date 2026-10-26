import { ButtonLink } from '../../../shared/components/Button';
import { Eyebrow } from '../components/SectionHead';
import { env } from '../../../shared/config/env';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const HELPS = [
  'Which product you’re asking about — WymAssist, or a planned product',
  'A sentence about your organization and what you’d like it to do',
  'Whether you want a product walkthrough, pricing discussion, or both',
];

export function ContactPage() {
  useDocumentTitle(
    'Contact',
    'Get in touch with WymNet about WymAssist, pricing, or the planned WymInsight and WymFlow products.'
  );
  return (
    <>
      <header
        className="page-hero"
        style={{ borderBottom: 'none', paddingBottom: 'var(--space-8)' }}
      >
        <div className="container">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="display display--page">Talk to a person</h1>
          <p className="lede">
            Questions about the product, pricing, or whether WymNet fits your organization — email
            us and we’ll reply directly.
          </p>
        </div>
      </header>
      <section className="section" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="container">
          <div className="contact-row">
            <div>
              <div className="contact-label">Email</div>
              <a className="contact-value" href={`mailto:${env.VITE_CONTACT_EMAIL}`}>
                {env.VITE_CONTACT_EMAIL}
              </a>
              <div className="contact-label">Already have an account?</div>
              <div className="cta-row">
                <ButtonLink to="/sign-in" variant="secondary">
                  Sign in
                </ButtonLink>
                <ButtonLink to="/register" variant="secondary">
                  Create an organization
                </ButtonLink>
              </div>
            </div>
            <div>
              <div className="contact-label">What to include</div>
              <ul className="prose" style={{ marginTop: 'var(--space-3)', paddingLeft: '1.2em' }}>
                {HELPS.map((h) => (
                  <li
                    key={h}
                    style={{ marginBottom: 'var(--space-2)', color: 'var(--color-text-muted)' }}
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
