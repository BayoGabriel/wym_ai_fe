import { Link, useParams } from 'react-router-dom';
import { ButtonLink } from '../../../shared/components/Button';
import { Eyebrow, StatusTag } from '../components/SectionHead';
import { AssistMock } from '../components/mocks/AssistMock';
import { ProductRoadmap } from '../components/ProductRoadmap';
import { FinalCta } from '../components/FinalCta';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import '../styles/mocks.css';

const CAP_ICONS: Record<string, IconName> = {
  WYMASSIST: 'chat',
  WYMINSIGHT: 'chart',
  WYMFLOW: 'flow',
};
const CARD_ICONS: IconName[] = ['spark', 'widget', 'lead', 'handoff', 'calendar', 'shield'];
const PROBLEM_ICONS: IconName[] = ['inbox', 'bolt', 'chart', 'doc', 'flow'];
const BENEFIT_ICONS: IconName[] = ['check', 'bolt', 'lead', 'chart', 'shield'];

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = PRODUCTS.find((p) => p.slug === slug);

  useDocumentTitle(
    product ? product.detail.seoTitle : 'Product',
    product ? product.detail.seoDescription : undefined
  );

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

  const d = product.detail;

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
          <div className="cta-row">
            <ButtonLink to="/register" size="lg">
              Get started
            </ButtonLink>
            <ButtonLink to="/contact" variant="secondary" size="lg">
              Request a demo
            </ButtonLink>
          </div>
        </div>
      </header>

      {product.code === 'WYMASSIST' && (
        <section className="section" style={{ paddingTop: 'var(--space-8)' }}>
          <div className="container">
            <Reveal>
              <AssistMock />
            </Reveal>
          </div>
        </section>
      )}

      <section className="section section--white">
        <div className="container">
          <Reveal>
            <Eyebrow>The problem</Eyebrow>
            <h2
              className="display display--section"
              style={{ margin: 'var(--space-2) 0 var(--space-3)' }}
            >
              {d.problem.title}
            </h2>
            <p className="lede" style={{ margin: '0 0 var(--space-6)' }}>
              {d.problem.lede}
            </p>
          </Reveal>
          <div className="feature-grid">
            {d.problem.points.map((p, i) => (
              <Reveal key={p.title} delay={i * 50}>
                <div className="feature-card">
                  <span className="icon-chip">
                    <Icon name={PROBLEM_ICONS[i % PROBLEM_ICONS.length]} size={22} />
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container prose">
          <Reveal>
            <Eyebrow>The solution</Eyebrow>
            <h2 className="display display--section" style={{ margin: 'var(--space-2) 0 var(--space-5)' }}>
              {d.solution.title}
            </h2>
            {d.solution.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section--white" id="capabilities">
        <div className="container">
          <Reveal>
            <Eyebrow>Core capabilities</Eyebrow>
            <h2 className="display display--section" style={{ margin: '0 0 var(--space-6)' }}>
              What {product.name} does
            </h2>
          </Reveal>
          <div className="feature-grid">
            {product.capabilities.map((c, i) => (
              <Reveal key={c.title} delay={i * 50}>
                <div className="feature-card">
                  <span className="icon-chip">
                    <Icon name={CARD_ICONS[i % CARD_ICONS.length] ?? CAP_ICONS[product.code]} size={22} />
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="display display--section" style={{ margin: '0 0 var(--space-6)' }}>
              {d.howItWorks.title}
            </h2>
            {d.howItWorks.lede && (
              <p className="lede" style={{ marginBottom: 'var(--space-6)' }}>
                {d.howItWorks.lede}
              </p>
            )}
          </Reveal>
          <ol className="steps">
            {d.howItWorks.steps.map((s) => (
              <li key={s.title}>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <Reveal>
            <Eyebrow>Use cases</Eyebrow>
            <h2 className="display display--section" style={{ margin: '0 0 var(--space-6)' }}>
              {d.useCases.title}
            </h2>
            {d.useCases.lede && (
              <p className="lede" style={{ marginBottom: 'var(--space-6)' }}>
                {d.useCases.lede}
              </p>
            )}
          </Reveal>
          <div className="case-cards">
            {d.useCases.items.map((u, i) => (
              <Reveal key={u.industry} delay={i * 50}>
                <div className="case-card">
                  <span className="icon-chip">
                    <Icon name={CAP_ICONS[product.code]} size={22} />
                  </span>
                  <h3>{u.industry}</h3>
                  <p className="case-p">{u.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--rule">
        <div className="container">
          <Reveal>
            <Eyebrow>Business benefits</Eyebrow>
            <h2 className="display display--section" style={{ margin: '0 0 var(--space-6)' }}>
              {d.benefits.title}
            </h2>
            {d.benefits.lede && (
              <p className="lede" style={{ marginBottom: 'var(--space-6)' }}>
                {d.benefits.lede}
              </p>
            )}
          </Reveal>
          <div className="case-list">
            {d.benefits.items.map((b, i) => (
              <Reveal key={b.title} delay={i * 40}>
                <div className="case-row">
                  <h3>
                    <Icon
                      name={BENEFIT_ICONS[i % BENEFIT_ICONS.length]}
                      size={18}
                      style={{ color: 'var(--color-primary)', marginRight: 'var(--space-2)' }}
                    />
                    {b.title}
                  </h3>
                  <p>{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          <Reveal>
            <Eyebrow>At a glance</Eyebrow>
            <h2 className="display display--section" style={{ margin: '0 0 var(--space-6)' }}>
              The specifics
            </h2>
            <dl className="spec-table">
              {d.specs.map((s) => (
                <div key={s.label} className="spec-row">
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {product.roadmap && <ProductRoadmap name={product.name} items={product.roadmap} />}

      <section className="section section--white">
        <div className="container" style={{ maxWidth: '820px' }}>
          <Reveal>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="display display--section" style={{ margin: '0 0 var(--space-6)' }}>
              What organizations ask before adopting {product.name}
            </h2>
          </Reveal>
          <div className="faq">
            {d.faqs.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <span className="faq-icon" aria-hidden>
                    +
                  </span>
                </summary>
                <div className="faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FinalCta title={d.cta.title} body={d.cta.body} />
    </>
  );
}
