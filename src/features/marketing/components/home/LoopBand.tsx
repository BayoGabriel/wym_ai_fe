import { SectionHead } from '../SectionHead';
import '../../styles/mocks.css';

const STAGES = [
  {
    title: 'Communicate',
    body: 'WymAssist answers customer questions and captures the enquiries worth following up.',
  },
  {
    title: 'Understand',
    body: 'WymInsight turns the numbers your business produces into trends, forecasts, and readable reports.',
  },
  {
    title: 'Execute',
    body: 'WymFlow keeps approvals, requests, and documents moving through defined workflows.',
  },
  {
    title: 'Improve',
    body: 'Faster answers, clearer numbers, cleaner operations — the gains compound as your team works.',
  },
];

export function LoopBand() {
  return (
    <section className="section--dark section">
      <div className="container">
        <SectionHead
          eyebrow="One platform, one direction"
          title="Each product stands alone — together they compound"
          lede="Subscribe to one product or all three. They share your organization’s accounts, permissions, and audit trail, so every addition builds on what’s already working."
        />
        <div className="flow">
          {STAGES.map((s, i) => (
            <div key={s.title} className={`flow__stage${i === 3 ? ' flow__stage--active' : ''}`}>
              <div className="flow__num">{String(i + 1).padStart(2, '0')}</div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
