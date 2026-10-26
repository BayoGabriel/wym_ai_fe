import { ButtonLink } from '../../../shared/components/Button';

export function FinalCta({
  title = 'Put your organization’s knowledge to work.',
  body = 'Create your workspace, approve your sources, and start answering customer questions with WymAssist.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="cta-band">
      <div className="container">
        <h2 className="display display--section">{title}</h2>
        <p>{body}</p>
        <div className="cta-row">
          <ButtonLink to="/register" size="lg">
            Create your organization
          </ButtonLink>
          <ButtonLink to="/contact" variant="secondary" size="lg">
            Talk to us first
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
