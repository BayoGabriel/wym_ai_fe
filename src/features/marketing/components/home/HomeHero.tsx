import { ButtonLink } from '../../../../shared/components/Button';
import { Eyebrow } from '../SectionHead';
import { AssistMock } from '../mocks/AssistMock';

export function HomeHero() {
  return (
    <section className="hero container">
      <div className="hero-copy">
        <Eyebrow>Organizational AI by WymNet</Eyebrow>
        <h1 className="display display--hero">
          Your organization’s knowledge, answering for your customers.
        </h1>
        <p className="lede">
          WymAssist turns your approved documents into an assistant that answers visitor questions
          on your website — then captures the enquiries worth following up and hands over to your
          team when a person is needed.
        </p>
        <div className="cta-row">
          <ButtonLink to="/register" size="lg">
            Create your organization
          </ButtonLink>
          <ButtonLink to="/products/wymassist" variant="secondary" size="lg">
            See how WymAssist works
          </ButtonLink>
        </div>
        <p className="hero-note">
          Registration creates your organization workspace and admin account in one step.
        </p>
      </div>
      <AssistMock />
    </section>
  );
}
