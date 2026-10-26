import { SectionHead } from '../SectionHead';

const STEPS = [
  {
    title: 'Approve the knowledge it can use',
    body: 'Upload the documents your team already trusts — policies, guides, reference material. Nothing is answered from outside them.',
  },
  {
    title: 'Visitors ask on your website',
    body: 'A conversation starts for each visitor — no account needed — and questions are answered against your approved sources in seconds.',
  },
  {
    title: 'Enquiries become leads',
    body: 'When a visitor shares contact details, a lead is created with the full conversation attached. Follow-up starts informed, not cold.',
  },
  {
    title: 'People take over when it matters',
    body: 'A visitor can ask for a person at any time. Your staff claims the conversation, replies inside it, and resolves it.',
  },
];

export function HowItWorks() {
  return (
    <section className="section section--white">
      <div className="container">
        <SectionHead
          eyebrow="How it works"
          title="Four steps from your documents to a useful answer"
          lede="WymAssist is deliberately narrow: it does a small number of things against sources you control, and it knows when to get out of the way."
        />
        <ol className="steps">
          {STEPS.map((s) => (
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
  );
}
