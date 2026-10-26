import { Link } from 'react-router-dom';
import { SectionHead } from '../SectionHead';

const FITS = [
  {
    title: 'Teams drowning in repeat questions',
    body: 'Support and operations staff answering the same policy, pricing, and process questions every week — the questions your documents already settle.',
  },
  {
    title: 'Organizations whose knowledge lives in documents',
    body: 'Policies, guides, and catalogues that are accurate but unreadable to customers. WymAssist makes them conversational.',
  },
  {
    title: 'Businesses that can’t afford a wrong answer',
    body: 'When an AI speaks for your organization, it should only say what you approved. Grounding and audit are built in, not bolted on.',
  },
];

export function FitSection() {
  return (
    <section className="section section--rule">
      <div className="container">
        <SectionHead eyebrow="Who it’s for" title="Built for organizations, not demos" />
        <div className="case-list">
          {FITS.map((f) => (
            <div key={f.title} className="case-row">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/use-cases">See the use cases in detail →</Link>
        </p>
      </div>
    </section>
  );
}
