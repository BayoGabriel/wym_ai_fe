import { ButtonLink } from '../../../../shared/components/Button';
import { SectionHead } from '../SectionHead';

const STEPS = [
  {
    title: 'Create your organization',
    body: 'One registration creates your workspace and administrator account — no separate onboarding flow.',
  },
  {
    title: 'Load your approved knowledge',
    body: 'Upload the documents your assistant should answer from, and review what it may use.',
  },
  {
    title: 'Put it on your website',
    body: 'Connect WymAssist to your site through the public chat API. An embeddable widget is on the way.',
  },
];

export function GetStarted() {
  return (
    <section className="section section--white">
      <div className="container">
        <SectionHead eyebrow="Getting started" title="From registration to a working assistant" />
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
        <div className="cta-row">
          <ButtonLink to="/register" size="lg">
            Create your organization
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
