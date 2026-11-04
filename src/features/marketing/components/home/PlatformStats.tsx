import { Reveal } from '../Reveal';

const STATS = [
  { num: '3', label: 'Independent products — support, analytics, and automation' },
  { num: '24/7', label: 'Coverage — WymAssist answers even when your team is offline' },
  { num: '1', label: 'Script tag puts the chat widget on any website' },
  { num: '0', label: 'Invented answers — responses come only from approved knowledge' },
];

export function PlatformStats() {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="stat-band">
            {STATS.map((s) => (
              <div key={s.num} className="stat">
                <div className="stat__num">{s.num}</div>
                <div className="stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
