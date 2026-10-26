const DOCS = [
  { name: 'Return & refund policy', type: 'Policy · PDF', status: 'Approved' },
  { name: 'Service catalogue 2025', type: 'Reference · DOCX', status: 'Approved' },
  { name: 'Onboarding playbook', type: 'Guide · Text', status: 'Approved' },
];

export function MockKnowledge() {
  return (
    <div className="mock-knowledge">
      <div className="mock-label">Approved knowledge</div>
      {DOCS.map((d) => (
        <div key={d.name} className="mock-doc">
          <div>
            <div className="mock-doc__name">{d.name}</div>
            <div className="mock-doc__type">{d.type}</div>
          </div>
          <span className="mock-chip">{d.status}</span>
        </div>
      ))}
      <div className="mock-label" style={{ marginTop: 'var(--space-5)' }}>
        Retrieval
      </div>
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        Answers are built only from sources your team has approved — never from the open internet.
      </p>
    </div>
  );
}
