import type { Message } from '../api/assist-api';

const LABEL: Record<Message['role'], string> = {
  USER: 'Visitor',
  ASSISTANT: 'Assistant',
  AGENT: 'Agent',
  SYSTEM: 'System',
};

export function ChatThread({ messages }: { messages: Message[] }) {
  return (
    <div className="thread">
      {messages
        .filter((m) => m.role !== 'SYSTEM')
        .map((m) => (
          <div key={m.id} className={`msg msg--${m.role.toLowerCase()}`}>
            <div className="msg-content">{m.content}</div>
            <div className="msg-meta">
              {LABEL[m.role]} · {new Date(m.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      {messages.length === 0 && <p className="muted">No messages yet.</p>}
    </div>
  );
}
