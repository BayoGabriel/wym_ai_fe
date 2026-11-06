import { Link } from 'react-router-dom';
import { SectionHead } from '../SectionHead';
import { Reveal } from '../Reveal';

const FITS = [
  {
    title: 'Small & medium businesses',
    body: 'Support customers, understand performance, and organize internal processes — without hiring a dedicated team for each.',
  },
  {
    title: 'Customer-facing organizations',
    body: 'Retail, e-commerce, education, healthcare administration, and NGOs — anywhere people ask questions and expect timely, accurate answers.',
  },
  {
    title: 'Operations-heavy teams',
    body: 'Finance approvals, employee onboarding, procurement, document collection — any process that currently runs on follow-ups and forwarded emails.',
  },
  {
    title: 'Larger organizations',
    body: 'Multi-department tenancy with roles, permissions, audit events, and centrally managed product subscriptions.',
  },
];

export function FitSection() {
  return (
    <section className="section section--rule">
      <div className="container fit-grid">
        <Reveal>
          <figure className="frame frame--tall">
            <img
              src="/images/fit-workshop.jpg"
              alt="A tailor at work in his shop, sewing fabric at his machine"
              loading="lazy"
            />
            <figcaption>The organizations WymNet is built for</figcaption>
          </figure>
        </Reveal>
        <div>
          <SectionHead
            eyebrow="Who it’s for"
            title="Built for organizations that run on real work"
          />
          <div className="case-list case-list--compact">
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
      </div>
    </section>
  );
}
