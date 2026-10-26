import { Link } from 'react-router-dom';
import { StatusTag } from './SectionHead';
import { PRODUCTS } from '../data/products';

/** Editorial product list — name, role, honest status, and a way in. */
export function ProductLines() {
  return (
    <div>
      {PRODUCTS.map((p) => (
        <Link key={p.code} to={`/products/${p.slug}`} className="product-line">
          <div>
            <StatusTag status={p.status} />
            <h3 className="product-line__name">{p.name}</h3>
            <p className="product-line__body">{p.summary}</p>
          </div>
          <span className="product-line__arrow" aria-hidden>
            →
          </span>
        </Link>
      ))}
    </div>
  );
}
