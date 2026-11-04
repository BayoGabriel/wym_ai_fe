import { ButtonLink } from '../../../shared/components/Button';

export function FinalCta({
  title = 'Make your organization easier to reach, understand, and run.',
  body = 'Create a workspace, enable the products you need, and see what a working week looks like on WymNet.',
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
            Get started
          </ButtonLink>
          <ButtonLink to="/contact" variant="secondary" size="lg">
            Discuss your business needs
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
