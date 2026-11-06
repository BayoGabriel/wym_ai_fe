import { Link } from 'react-router-dom';
import { ButtonLink } from '../../../shared/components/Button';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <section className="notfound">
      <div className="container">
        <div className="notfound__text">
          <p className="notfound__code" aria-label="Error 404">
            <span aria-hidden>4</span>
            <img src="/brand/wymnet-logo.png" alt="" aria-hidden />
            <span aria-hidden>4</span>
          </p>
          <h1 className="display display--page">This page drifted out of orbit</h1>
          <p className="lede">
            The address may be wrong, or the page has moved. Let’s get you back to familiar
            territory.
          </p>
          <div className="cta-row">
            <ButtonLink to="/" size="lg">
              Back to home
            </ButtonLink>
            <ButtonLink to="/products" variant="secondary" size="lg">
              Browse products
            </ButtonLink>
          </div>
          <p className="notfound__hint">
            Still lost? <Link to="/contact">Contact us</Link> and we’ll point you in the right
            direction.
          </p>
        </div>
        <div className="notfound__figure" aria-hidden>
          <img src="/brand/wymnet-woman.webp" alt="" />
        </div>
      </div>
    </section>
  );
}
