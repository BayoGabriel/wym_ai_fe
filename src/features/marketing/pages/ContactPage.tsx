import { ButtonLink } from '../../../shared/components/Button';
import { Eyebrow } from '../components/SectionHead';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/icons';
import { env } from '../../../shared/config/env';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const HELPS = [
  'Which product you’re asking about — WymAssist, WymInsight, or WymFlow',
  'A sentence about your organization and what you’d like it to do',
  'Whether you want a product walkthrough, pricing discussion, or both',
];

export function ContactPage() {
  useDocumentTitle(
    'Contact WymNet — Request a Demo or Ask a Question',
    'Get in touch with WymNet about WymAssist, WymInsight, WymFlow, pricing, or a product demonstration.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="display display--page">Talk to a person</h1>
          <p className="lede">
            Questions about the products, a demonstration, pricing, or whether WymNet fits your
            organization — email us and we’ll reply directly.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <div className="contact-row">
            <Reveal>
              <div className="feature-card" style={{ padding: 'var(--space-8)' }}>
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
            </Reveal>
            <Reveal delay={100}>
              <div className="case-card">
                <span className="icon-chip">
                  <Icon name="chat" size={22} />
                </span>
                <div className="contact-label" style={{ marginTop: 'var(--space-4)' }}>
                  What to include
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {HELPS.map((h) => (
                    <li
                      key={h}
                      style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-2) 0',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-sm)',
                        lineHeight: 1.6,
                      }}
                    >
                      <Icon
                        name="check"
                        size={16}
                        style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
