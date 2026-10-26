export function MockConversation() {
  return (
    <div className="mock-chat">
      <div className="mock-label">Visitor conversation</div>
      <div className="mock-msg mock-msg--visitor">
        What's your policy on returning equipment after a lease ends?
      </div>
      <div className="mock-msg mock-msg--assistant">
        <span className="mock-msg__from">WymAssist</span>
        Leased equipment can be returned within 30 days of the term ending. Collection is arranged
        through your account manager at no charge for items under 25 kg.
        <span className="mock-source">Return &amp; refund policy</span>
      </div>
      <div className="mock-msg mock-msg--visitor">
        Great — can someone call me about extending the lease instead?
      </div>
      <div className="mock-lead">
        <strong>Lead captured</strong> — visitor left contact details; enquiry linked to this
        conversation for follow-up.
      </div>
      <div className="mock-msg mock-msg--assistant">
        <span className="mock-msg__from">WymAssist</span>
        I've passed your request to the team — someone will reach out about the extension.
      </div>
      <div className="mock-handoff">Handed to a person · team member joined the conversation</div>
      <div className="mock-msg mock-msg--agent">
        <span className="mock-msg__from">Amara — Support</span>
        Hi! I can see your question about the lease. Happy to walk through the extension options
        with you here.
      </div>
    </div>
  );
}
