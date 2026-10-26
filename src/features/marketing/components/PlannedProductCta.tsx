import { ButtonLink } from '../../../shared/components/Button';

export function PlannedProductCta({ productName }: { productName: string }) {
  return (
    <section className="section section--rule">
      <div className="container">
        <h2 className="display display--section">Start with WymAssist today</h2>
        <p className="lede">
          The platform’s first product is available now — organizations that adopt it will be first
          in line for {productName}.
        </p>
        <div className="cta-row">
          <ButtonLink to="/products/wymassist">Explore WymAssist</ButtonLink>
          <ButtonLink to="/register" variant="secondary">
            Create your organization
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
