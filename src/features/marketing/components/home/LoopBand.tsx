import { SectionHead } from '../SectionHead';
import '../../styles/mocks.css';

const STAGES = [
  {
    title: 'Knowledge in',
    body: 'Your approved documents become the only source the assistant may use.',
  },
  {
    title: 'Question answered',
    body: 'The visitor gets a specific answer, tied to the source it came from.',
  },
  {
    title: 'Enquiry captured',
    body: 'Contact details and context are recorded as a lead for your team.',
  },
  {
    title: 'Human finishes',
    body: 'Staff see the same thread, reply in place, and close the loop.',
  },
];

export function LoopBand() {
  return (
    <section className="section--dark section">
      <div className="container">
        <SectionHead
          eyebrow="One connected loop"
          title="Nothing is a dead end — every conversation lands somewhere useful"
          lede="Most website chats end in a transcript nobody reads. WymAssist turns each one into an answered question, a lead, or a conversation your team owns."
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
