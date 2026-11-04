import { ButtonLink } from '../../../../shared/components/Button';
import { SectionHead } from '../SectionHead';

const STEPS = [
  {
    title: 'Create your organization',
    body: 'One registration creates your workspace and administrator account — no separate onboarding flow, no payment details.',
  },
  {
    title: 'Pick a product and load it',
    body: 'Documents for WymAssist, a spreadsheet for WymInsight, or a process definition for WymFlow — each starts from material you already have.',
  },
  {
    title: 'Put it to work',
    body: 'Embed the chat widget, read your first report, or run your first workflow — then add products when you’re ready for more.',
  },
];

export function GetStarted() {
  return (
    <section className="section section--white">
      <div className="container">
        <SectionHead eyebrow="Getting started" title="Three steps, no implementation project" />
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
            Get started
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
