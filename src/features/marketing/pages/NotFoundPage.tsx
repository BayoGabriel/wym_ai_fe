import { Link } from 'react-router-dom';
import { ButtonLink } from '../../../shared/components/Button';
import { Eyebrow } from '../components/SectionHead';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <section className="page-hero" style={{ borderBottom: 'none' }}>
      <div className="container">
        <Eyebrow>404</Eyebrow>
        <h1 className="display display--page">This page doesn’t exist</h1>
        <p className="lede">The address may be wrong, or the page has moved.</p>
        <div className="cta-row">
          <ButtonLink to="/">Back to home</ButtonLink>
          <ButtonLink to="/products" variant="secondary">
            Browse products
          </ButtonLink>
        </div>
        <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
          Looking for something specific? <Link to="/contact">Contact us</Link>.
        </p>
      </div>
    </section>
  );
}
