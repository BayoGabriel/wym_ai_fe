import { ButtonLink } from '../../../../shared/components/Button';
import { AssistMock } from '../mocks/AssistMock';
import { Icon } from '../icons';
import { Reveal } from '../Reveal';
import '../../styles/mocks.css';

export function HomeHero() {
  return (
    <div className="hero-wrap">
      <section className="hero container">
        <div className="hero-copy">
          <Reveal>
            <span className="spec-tag">WymNet AI Solutions &amp; Automation</span>
            <h1 className="display display--hero" style={{ marginTop: 'var(--space-5)' }}>
              Answer every customer. Understand your numbers.{' '}
              <span className="em-accent">Automate the busywork.</span>
            </h1>
            <p className="lede">
              WymNet builds practical AI software for organizations that deal with customers, data,
              and processes every day. WymAssist handles customer conversations, WymInsight turns
              business data into readable analysis, and WymFlow keeps internal approvals moving —
              all on one secure platform.
            </p>
            <div className="cta-row">
              <ButtonLink to="/register" size="lg">
                Get started
              </ButtonLink>
              <ButtonLink to="/products" variant="secondary" size="lg">
                Explore the products
              </ButtonLink>
            </div>
          </Reveal>
          <ul className="hero-proof">
            <li>
              <Icon name="check" size={15} />
              AI answers grounded in your approved documents
            </li>
            <li>
              <Icon name="shield" size={15} />
              Isolated data, roles &amp; audit for every organization
            </li>
            <li>
              <Icon name="handoff" size={15} />
              Each product works — and is priced — on its own
            </li>
          </ul>
        </div>
        <Reveal delay={120}>
          <div className="hero-mock">
            <AssistMock />
            <div className="mock-float mock-float--lead" aria-hidden>
              <span className="mock-float__icon mock-float__icon--green">
                <Icon name="lead" size={16} />
              </span>
              <span>
                <strong>New lead captured</strong>
                Contact details + full conversation
              </span>
            </div>
            <div className="mock-float mock-float--resolved" aria-hidden>
              <span className="mock-float__icon mock-float__icon--amber">
                <Icon name="handoff" size={16} />
              </span>
              <span>
                <strong>Handed to staff</strong>
                Amara joined the conversation
              </span>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
