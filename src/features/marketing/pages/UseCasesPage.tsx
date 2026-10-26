import { Eyebrow, StatusTag } from '../components/SectionHead';
import { FinalCta } from '../components/FinalCta';
import { ASSIST_CASES, PLANNED_CASES } from '../data/use-cases';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function UseCasesPage() {
  useDocumentTitle(
    'Use cases',
    'Concrete scenarios where WymNet products fit: answering from approved knowledge, capturing leads, escalating to staff, and future analytics and workflows.'
  );
  return (
    <>
      <header className="page-hero">
        <div className="container">
          <Eyebrow>Use cases</Eyebrow>
          <h1 className="display display--page">Where WymNet fits in a real organization</h1>
          <p className="lede">
            Each scenario below describes the problem, the relevant capability, and the practical
            value — with product availability marked honestly.
          </p>
        </div>
      </header>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Eyebrow>Available with WymAssist</Eyebrow>
          <div className="case-list" style={{ marginTop: 'var(--space-4)' }}>
            {ASSIST_CASES.map((c) => (
              <div key={c.title} className="case-row">
                <h3>{c.title}</h3>
                <div>
                  <p>
                    <strong>The problem.</strong> {c.problem}
                  </p>
                  <p>
                    <strong>The value.</strong> {c.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Eyebrow>On the roadmap</Eyebrow>
          <div className="case-list" style={{ marginTop: 'var(--space-4)' }}>
            {PLANNED_CASES.map((c) => (
              <div key={c.title} className="case-row">
                <div>
                  <h3>{c.title}</h3>
                  <StatusTag status="planned" />
                </div>
                <div>
                  <p>{c.body}</p>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-faint)',
                    }}
                  >
                    {c.product} — planned, not yet available.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
