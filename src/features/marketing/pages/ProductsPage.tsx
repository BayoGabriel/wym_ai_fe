import { Eyebrow, SectionHead } from '../components/SectionHead';
import { ProductCards } from '../components/ProductCards';
import { FinalCta } from '../components/FinalCta';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const PLATFORM: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'lock',
    title: 'Isolated organizations',
    body: 'Every client’s data, documents, and conversations live behind their own organization boundary — nothing leaks between tenants.',
  },
  {
    icon: 'shield',
    title: 'Roles & permissions',
    body: 'Administrators, staff, and platform operators each see exactly what their role allows. Permissions are enforced on every request.',
  },
  {
    icon: 'spark',
    title: 'Full audit trail',
    body: 'Every sensitive action — approvals, assignments, configuration changes — is recorded with who did it and when.',
  },
  {
    icon: 'gear',
    title: 'Independent subscriptions',
    body: 'Each product is its own entitlement. An organization runs WymAssist alone, adds WymInsight later, and never pays for what it doesn’t use.',
  },
];

export function ProductsPage() {
  useDocumentTitle(
    'Products — WymAssist, WymInsight & WymFlow',
    'WymNet products: WymAssist for knowledge-grounded customer support, WymInsight for business intelligence and analytics, and WymFlow for process automation.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>Product family</Eyebrow>
          <h1 className="display display--page">
            Three products, three jobs, <span className="grad-text">one platform</span>
          </h1>
          <p className="lede">
            WymAssist handles customer communication. WymInsight turns business data into decisions.
            WymFlow organizes internal processes. Each is a standalone subscription on the same
            secure, audited foundation — take what you need, add more when you’re ready.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <Reveal>
            <ProductCards />
          </Reveal>
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <SectionHead
            eyebrow="The shared platform"
            title="What every product inherits"
            lede="You don’t re-buy infrastructure with each product. The tenancy, security, and audit layer underneath is the same for all three."
          />
          <div className="feature-grid">
            {PLATFORM.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="feature-card">
                  <span className="icon-chip">
                    <Icon name={f.icon} size={22} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
