import { Eyebrow } from './SectionHead';
import '../styles/mocks.css';

export function ProductRoadmap({ name, items }: { name: string; items: string[] }) {
  return (
    <section className="section--dark section">
      <div className="container">
        <Eyebrow>On the roadmap</Eyebrow>
        <h2 className="display display--section" style={{ marginTop: 'var(--space-2)' }}>
          Where {name} goes next
        </h2>
        <p className="lede" style={{ color: 'var(--color-dark-text-muted)', maxWidth: '60ch' }}>
          The product works today. These are the next integrations and capabilities on the same
          organization, permission, and audit foundation.
        </p>
        <div className="flow">
          {items.map((r, i) => (
            <div key={r} className="flow__stage">
              <div className="flow__num">{String(i + 1).padStart(2, '0')}</div>
              <h4>{r}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
