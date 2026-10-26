import { Link } from 'react-router-dom';
import { Eyebrow, StatusTag } from '../components/SectionHead';
import { FinalCta } from '../components/FinalCta';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function ProductsPage() {
  useDocumentTitle(
    'Products',
    'WymNet products: WymAssist for knowledge-grounded customer conversations, plus planned WymInsight analytics and WymFlow automation.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>Product family</Eyebrow>
          <h1 className="display display--page">
            Three products, one platform — at different stages
          </h1>
          <p className="lede">
            WymAssist is available now. WymInsight and WymFlow are documented product directions on
            the same foundation, listed here so you can see where the platform is going — not sold
            as if they already exist.
          </p>
        </div>
      </header>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {PRODUCTS.map((p) => (
            <Link key={p.code} to={`/products/${p.slug}`} className="product-line">
              <div>
                <StatusTag status={p.status} />
                <h2 className="product-line__name">{p.name}</h2>
                <p
                  style={{
                    margin: '0 0 var(--space-2)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {p.role}
                </p>
                <p className="product-line__body">{p.tagline}</p>
              </div>
              <span className="product-line__arrow" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
