import { Link, useParams } from 'react-router-dom';
import { Eyebrow, StatusTag } from '../components/SectionHead';
import { AssistMock } from '../components/mocks/AssistMock';
import { ProductRoadmap } from '../components/ProductRoadmap';
import { PlannedProductCta } from '../components/PlannedProductCta';
import { FinalCta } from '../components/FinalCta';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import '../styles/mocks.css';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = PRODUCTS.find((p) => p.slug === slug);

  useDocumentTitle(product?.name ?? 'Product', product?.summary);

  if (!product) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="display display--page">Product not found</h1>
          <p className="lede">That product page doesn’t exist.</p>
          <Link to="/products">← Back to all products</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>{product.role}</Eyebrow>
          <h1 className="display display--page">{product.name}</h1>
          <p className="product-sub">
            <StatusTag status={product.status} />
            {product.tagline}
          </p>
          <p className="lede">{product.pageIntro}</p>
        </div>
      </header>
      {product.status === 'available' && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <AssistMock />
          </div>
        </section>
      )}
      <section className="section section--white">
        <div className="container">
          <ol className="steps">
            {product.capabilities.map((c) => (
              <li key={c.title}>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      {product.roadmap && <ProductRoadmap name={product.name} items={product.roadmap} />}
      {product.status === 'available' ? (
        <FinalCta />
      ) : (
        <PlannedProductCta productName={product.name} />
      )}
    </>
  );
}
