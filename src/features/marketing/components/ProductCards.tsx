import { Link } from 'react-router-dom';
import { StatusTag } from './SectionHead';
import { Icon } from './icons';
import type { IconName } from './icons';
import { PRODUCTS } from '../data/products';
import type { Product } from '../data/products';

const PRODUCT_ICON: Record<Product['code'], IconName> = {
  WYMASSIST: 'chat',
  WYMINSIGHT: 'chart',
  WYMFLOW: 'flow',
};

/** Rich product cards — used on the products overview and home page. */
export function ProductCards() {
  return (
    <div className="product-cards">
      {PRODUCTS.map((p) => (
        <Link key={p.code} to={`/products/${p.slug}`} className="product-card">
          <div className="product-card__top">
            <span className="icon-chip">
              <Icon name={PRODUCT_ICON[p.code]} size={22} />
            </span>
            <StatusTag status={p.status} />
          </div>
          <h3>{p.name}</h3>
          <div className="product-card__role">{p.role}</div>
          <p>{p.tagline}</p>
          <ul className="product-card__feats">
            {p.capabilities.slice(0, 3).map((c) => (
              <li key={c.title}>
                <Icon name="check" size={14} />
                {c.title}
              </li>
            ))}
          </ul>
          <span className="product-card__go">
            Explore {p.name}
            <Icon name="arrow" size={14} />
          </span>
        </Link>
      ))}
    </div>
  );
}
