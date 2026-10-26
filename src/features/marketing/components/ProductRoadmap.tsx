import { Link } from 'react-router-dom';
import { Eyebrow } from './SectionHead';
import '../styles/mocks.css';

export function ProductRoadmap({ name, items }: { name: string; items: string[] }) {
  return (
    <section className="section--dark section">
      <div className="container">
        <Eyebrow>Planned scope</Eyebrow>
        <h2 className="display display--section" style={{ marginTop: 'var(--space-2)' }}>
          Where {name} is headed
        </h2>
        <p className="lede" style={{ color: 'var(--color-dark-text-muted)', maxWidth: '60ch' }}>
          These capabilities are designed and documented, and will build on the same organization,
          permission, and audit foundation as WymAssist. They are not available for use yet.
        </p>
        <div className="flow">
          {items.map((r, i) => (
            <div key={r} className="flow__stage">
              <div className="flow__num">{String(i + 1).padStart(2, '0')}</div>
              <h4>{r}</h4>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--color-dark-text-muted)', fontSize: 'var(--text-sm)' }}>
          <Link to="/contact" style={{ color: 'var(--color-accent)' }}>
            Contact us
          </Link>{' '}
          to hear when this product is available.
        </p>
      </div>
    </section>
  );
}
