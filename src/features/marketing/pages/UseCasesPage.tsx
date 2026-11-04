import { Link } from 'react-router-dom';
import { Eyebrow } from '../components/SectionHead';
import { FinalCta } from '../components/FinalCta';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';
import { USE_CASE_GROUPS } from '../data/use-cases';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

const CASE_ICONS: IconName[] = ['book', 'chat', 'lead', 'handoff', 'doc', 'chart'];
const GROUP_ICON: IconName[] = ['chat', 'chart', 'flow'];

export function UseCasesPage() {
  useDocumentTitle(
    'Use Cases — AI Customer Support, Analytics & Automation',
    'Real scenarios where WymNet products fit: grounded customer answers, lead capture, human handoff, spreadsheet analytics, forecasts, and approval workflows.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>Use cases</Eyebrow>
          <h1 className="display display--page">Where WymNet fits in a real organization</h1>
          <p className="lede">
            Each scenario below describes the problem, the relevant capability, and the practical
            value — everything on this page is working software, not a roadmap.
          </p>
        </div>
      </header>
      {USE_CASE_GROUPS.map((g, gi) => (
        <section key={g.slug} className={`section${gi % 2 === 1 ? ' section--white' : ''}`}>
          <div className="container">
            <Eyebrow>
              {g.product} — {g.tagline}
            </Eyebrow>
            <div className="case-cards" style={{ marginTop: 'var(--space-4)' }}>
              {g.cases.map((c, i) => (
                <Reveal key={c.title} delay={i * 60}>
                  <div className="case-card">
                    <span className="icon-chip">
                      <Icon name={CASE_ICONS[i % CASE_ICONS.length] ?? GROUP_ICON[gi]} size={22} />
                    </span>
                    <h3>{c.title}</h3>
                    <p className="case-p">
                      <strong>The problem.</strong> {c.problem}
                    </p>
                    <p className="case-p" style={{ marginBottom: 0 }}>
                      <strong>The value.</strong> {c.value}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <p style={{ marginTop: 'var(--space-6)' }}>
              <Link to={`/products/${g.slug}`}>Explore {g.product} →</Link>
            </p>
          </div>
        </section>
      ))}
      <FinalCta />
    </>
  );
}
