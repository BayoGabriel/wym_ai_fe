import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Archive,
  ArrowLeft,
  Check,
  CircleDot,
  Filter,
  Handshake,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { assistApi, type Conversation, type Message } from '../api/assist-api';
import { assistKeys } from '../queries';
import { useAuth } from '../../../app/providers/auth-context';
import { useCan } from '../../../shared/auth/use-permission';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useDebounced } from '../../../shared/utils/useDebounced';
import { useToast } from '../../../shared/components/toast-context';
import { EmptyState, ErrorState } from '../../../shared/components/States';
import { CardSkeleton } from '../../../shared/components/Skeleton';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { Button } from '../../../shared/components/Button';
import { Drawer } from '../../../shared/components/Drawer';
import { Select } from '../../../shared/components/Select';
import { Avatar } from '../../../shared/components/Avatar';
import { SegmentedControl } from '../../../shared/components/SegmentedControl';
import { Kbd } from '../../../shared/components/Kbd';
import '../styles/inbox.css';

const CHANNEL_ICON: Record<string, typeof MessageSquare> = {
  WEB: MessageSquare,
  WHATSAPP: Phone,
  MESSENGER: Mail,
  INSTAGRAM: Mail,
  TELEGRAM: Send,
  EMAIL: Mail,
  API: MessageSquare,
};

function when(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

/* ---------------- Filters ---------------- */

export type InboxFilters = {
  status: string;
  channel: string;
  q: string;
  escalated: boolean;
  hasLead: boolean;
  mine: boolean;
};

const DEFAULT_FILTERS: InboxFilters = {
  status: '',
  channel: '',
  q: '',
  escalated: false,
  hasLead: false,
  mine: false,
};

function FilterBar({
  filters,
  onChange,
}: {
  filters: InboxFilters;
  onChange: (f: InboxFilters) => void;
}) {
  const { user } = useAuth();
  const set = (patch: Partial<InboxFilters>) => onChange({ ...filters, ...patch });
  return (
    <div className="inbox-filters">
      <div className="inbox-filters__search">
        <Search size={14} />
        <input
          placeholder="Search conversations…"
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
        />
        {filters.q && (
          <button aria-label="Clear search" onClick={() => set({ q: '' })}>
            <X size={12} />
          </button>
        )}
      </div>
      <SegmentedControl
        ariaLabel="Conversation status"
        size="sm"
        options={[
          { value: 'ACTIVE', label: 'Open' },
          { value: 'CLOSED', label: 'Closed' },
          { value: 'ARCHIVED', label: 'Archived' },
        ]}
        value={filters.status || 'ACTIVE'}
        onChange={(v) => set({ status: v })}
      />
      <div className="inbox-filters__row">
        <Select
          ariaLabel="Channel"
          value={filters.channel}
          onChange={(v) => set({ channel: v })}
          size="sm"
          options={[
            { value: '', label: 'All channels' },
            { value: 'WEB', label: 'Web' },
            { value: 'WHATSAPP', label: 'WhatsApp' },
            { value: 'MESSENGER', label: 'Messenger' },
            { value: 'INSTAGRAM', label: 'Instagram' },
            { value: 'TELEGRAM', label: 'Telegram' },
            { value: 'EMAIL', label: 'Email' },
            { value: 'API', label: 'API' },
          ]}
        />
        {user && (
          <button
            className={`inbox-chip${filters.mine ? ' is-on' : ''}`}
            onClick={() => set({ mine: !filters.mine })}
          >
            <UserCheck size={12} /> Mine
          </button>
        )}
        <button
          className={`inbox-chip${filters.escalated ? ' is-on' : ''}`}
          onClick={() => set({ escalated: !filters.escalated })}
        >
          <Handshake size={12} /> Escalated
        </button>
        <button
          className={`inbox-chip${filters.hasLead ? ' is-on' : ''}`}
          onClick={() => set({ hasLead: !filters.hasLead })}
        >
          <User size={12} /> Has lead
        </button>
      </div>
    </div>
  );
}

/* ---------------- List ---------------- */

function ConversationRow({
  c,
  active,
  onClick,
}: {
  c: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = CHANNEL_ICON[c.channel] ?? MessageSquare;
  return (
    <button
      className={`inbox-row${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-current={active || undefined}
    >
      <span className="inbox-row__icon">
        <Icon size={15} />
      </span>
      <span className="inbox-row__body">
        <span className="inbox-row__top">
          <span className="inbox-row__title">{c.title ?? 'Untitled conversation'}</span>
          <span className="inbox-row__time">{when(c.lastMessage?.createdAt ?? c.updatedAt)}</span>
        </span>
        <span className="inbox-row__preview">
          {c.lastMessage
            ? `${c.lastMessage.role === 'USER' ? '' : 'You: '}${c.lastMessage.content}`
            : 'No messages yet'}
        </span>
        <span className="inbox-row__meta">
          {c.openHandoff && (
            <span className="inbox-row__flag inbox-row__flag--hand">
              <Handshake size={10} /> {c.openHandoff.status === 'ASSIGNED' ? 'In progress' : 'Handoff'}
            </span>
          )}
          {c.leadId && (
            <span className="inbox-row__flag inbox-row__flag--lead">
              <User size={10} /> Lead
            </span>
          )}
          {c.tags?.slice(0, 2).map((t) => (
            <span key={t} className="inbox-row__flag">
              {t}
            </span>
          ))}
        </span>
      </span>
      {c.assignee && (
        <span className="inbox-row__avatar" title={c.assignee.name ?? 'Assigned'}>
          <Avatar name={c.assignee.name ?? '?'} size={18} />
        </span>
      )}
    </button>
  );
}

function ConversationList({
  items,
  selectedId,
  total,
  onSelect,
}: {
  items: Conversation[];
  selectedId?: string;
  total: number;
  onSelect: (id: string) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 74,
    overscan: 8,
  });
  if (items.length === 0) {
    return (
      <div className="inbox-list__empty">
        <EmptyState
          compact
          icon={<Filter size={16} />}
          title="Nothing here"
          message="No conversations match these filters."
        />
      </div>
    );
  }
  return (
    <div ref={parentRef} className="inbox-list__scroll">
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((v) => {
          const c = items[v.index];
          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${v.start}px)`,
              }}
            >
              <ConversationRow c={c} active={c.id === selectedId} onClick={() => onSelect(c.id)} />
            </div>
          );
        })}
      </div>
      <div className="inbox-list__foot">{total} conversations</div>
    </div>
  );
}

/* ---------------- Thread ---------------- */

function SourceChips({ sources }: { sources?: { knowledgeItemId?: string; chunkId?: string }[] }) {
  if (!sources?.length) return null;
  return (
    <span className="msg-sources">
      {sources.map((s, i) => (
        <a
          key={i}
          className="msg-source"
          href={`/dashboard/assist/knowledge?item=${s.knowledgeItemId ?? ''}`}
          onClick={(e) => e.preventDefault()}
          title="Source from knowledge base"
        >
          <CircleDot size={9} /> {s.knowledgeItemId ? `KB ${s.knowledgeItemId.slice(0, 4)}` : 'KB'}
        </a>
      ))}
    </span>
  );
}

function Thread({ messages, loading }: { messages: Message[]; loading?: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);
  return (
    <div className="inbox-thread">
      {messages
        .filter((m) => m.role !== 'SYSTEM')
        .map((m) => (
          <div key={m.id} className={`msg msg--${m.role.toLowerCase()}`}>
            <div className="msg-bubble">
              {m.content}
              {m.role === 'ASSISTANT' && (
                <div className="msg-tags">
                  <span className={`msg-tag ${m.grounded ? 'msg-tag--ok' : 'msg-tag--warn'}`}>
                    {m.grounded ? 'Grounded' : 'Ungrounded'}
                  </span>
                  <SourceChips sources={m.metadata?.sources ?? m.sources} />
                  {m.feedback && (
                    <span className="msg-tag">
                      {m.feedback === 'up' ? <ThumbsUp size={10} /> : <ThumbsDown size={10} />}
                      {m.feedback === 'up' ? 'Helpful' : 'Not helpful'}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="msg-meta">
              {m.role === 'USER' ? 'Visitor' : m.role === 'AGENT' ? 'Agent' : 'Assistant'} ·{' '}
              {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
            </div>
          </div>
        ))}
      {loading && <div className="inbox-thread__loading">Loading…</div>}
      <div ref={endRef} />
    </div>
  );
}

function Composer({
  handoff,
  userId,
  onReply,
  onTakeover,
  onHandBack,
  busy,
}: {
  handoff?: { id: string; status: string } | null;
  userId?: string;
  onReply: (text: string) => void;
  onTakeover: () => void;
  onHandBack: () => void;
  busy?: boolean;
}) {
  const [text, setText] = useState('');
  const mine = handoff?.status === 'ASSIGNED';
  if (!handoff) {
    return (
      <div className="inbox-composer inbox-composer--cta">
        <p>Assistant is replying automatically.</p>
        <Button size="sm" onClick={onTakeover} icon={<Handshake size={13} />}>
          Take over
        </Button>
      </div>
    );
  }
  if (handoff.status === 'QUEUED' || handoff.status === 'REQUESTED') {
    return (
      <div className="inbox-composer inbox-composer--cta">
        <p>A visitor is waiting for a human.</p>
        <Button size="sm" onClick={onTakeover} loading={busy} icon={<UserCheck size={13} />}>
          Claim this handoff
        </Button>
      </div>
    );
  }
  if (!mine || !userId) return null;
  return (
    <form
      className="inbox-composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) {
          onReply(text.trim());
          setText('');
        }
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply as agent… (Enter to send, Shift+Enter for newline)"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) {
              onReply(text.trim());
              setText('');
            }
          }
        }}
      />
      <div className="inbox-composer__foot">
        <button type="button" className="inbox-handback" onClick={onHandBack} disabled={busy}>
          <Check size={12} /> Hand back to AI
        </button>
        <Button type="submit" size="sm" loading={busy} icon={<Send size={12} />}>
          Send
        </Button>
      </div>
    </form>
  );
}

/* ---------------- Context panel ---------------- */

function ContextPanel({
  conv,
  onClose,
  onArchive,
  onAssign,
  users,
}: {
  conv: Conversation;
  onClose?: () => void;
  onArchive: () => void;
  onAssign: (userId: string | null) => void;
  users: { id: string; name: string }[];
}) {
  const canWrite = useCan('conversation.update');
  return (
    <aside className="inbox-context">
      <div className="inbox-context__head">
        <h3>{conv.title ?? 'Conversation'}</h3>
        {onClose && (
          <button className="inbox-iconbtn" onClick={onClose} aria-label="Close panel">
            <X size={14} />
          </button>
        )}
      </div>
      <dl className="inbox-context__facts">
        <div>
          <dt>Channel</dt>
          <dd>{conv.channel}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <StatusBadge status={conv.status} />
          </dd>
        </div>
        <div>
          <dt>Started</dt>
          <dd>{format(new Date(conv.createdAt), 'MMM d, HH:mm')}</dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>
            {canWrite ? (
              <Select
                ariaLabel="Assignee"
                size="sm"
                value={conv.assignedTo ?? ''}
                onChange={(v) => onAssign(v || null)}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...users.map((u) => ({ value: u.id, label: u.name })),
                ]}
              />
            ) : conv.assignee ? (
              conv.assignee.name
            ) : (
              '—'
            )}
          </dd>
        </div>
      </dl>
      {conv.tags && conv.tags.length > 0 && (
        <div className="inbox-context__section">
          <div className="inbox-context__label">Tags</div>
          <div className="inbox-context__tags">
            {conv.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      )}
      <div className="inbox-context__section">
        <div className="inbox-context__label">Linked</div>
        {conv.leadId && <a href={`/dashboard/assist/leads`} className="inbox-context__link">View lead →</a>}
        {conv.openHandoff && (
          <a href={`/dashboard/assist/handoffs`} className="inbox-context__link">
            Handoff ({conv.openHandoff.status.toLowerCase()}) →
          </a>
        )}
        {!conv.leadId && !conv.openHandoff && (
          <span className="inbox-context__empty">No linked records</span>
        )}
      </div>
      {canWrite && conv.status === 'ACTIVE' && (
        <div className="inbox-context__section">
          <Button variant="secondary" size="sm" onClick={onArchive} icon={<Archive size={13} />}>
            Archive conversation
          </Button>
        </div>
      )}
    </aside>
  );
}

/* ---------------- Page ---------------- */

export function InboxPage() {
  useDocumentTitle('Conversations');
  const { id: selectedId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const canWrite = useCan('handoff.write');
  const [filters, setFilters] = useState<InboxFilters>(DEFAULT_FILTERS);
  const [contextOpen, setContextOpen] = useState(false);
  const debouncedQ = useDebounced(filters.q, 220);

  const listParams = useMemo(
    () => ({
      status: filters.status || undefined,
      channel: filters.channel || undefined,
      q: debouncedQ || undefined,
      escalated: filters.escalated || undefined,
      hasLead: filters.hasLead || undefined,
      assignedTo: filters.mine && user ? user.id : undefined,
      limit: 200,
    }),
    [filters, debouncedQ, user]
  );

  const list = useQuery({
    queryKey: ['inbox', 'conversations', listParams],
    queryFn: () => assistApi.listConversations(listParams),
    refetchInterval: 10_000,
    placeholderData: (prev) => prev,
  });

  const selected = list.data?.items.find((c) => c.id === selectedId) ?? null;
  const messages = useQuery({
    queryKey: assistKeys.messages(selectedId!),
    queryFn: () => assistApi.listMessages(selectedId!),
    enabled: !!selectedId,
    refetchInterval: 8000,
  });
  const users = useQuery({
    queryKey: assistKeys.users,
    queryFn: () => assistApi.listUsers(),
    staleTime: 60_000,
  });

  // "New messages" indicator: compare latest id across polls.
  const [newBanner, setNewBanner] = useState(false);
  const lastSeen = useRef<string | null>(null);
  useEffect(() => {
    const items = messages.data?.items;
    if (!items?.length) return;
    const latest = items[items.length - 1].id;
    if (lastSeen.current && lastSeen.current !== latest) setNewBanner(true);
    lastSeen.current = latest;
  }, [messages.data]);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['inbox'] });
    if (selectedId) void qc.invalidateQueries({ queryKey: assistKeys.messages(selectedId) });
  };

  const takeover = useMutation({
    mutationFn: () =>
      selected?.openHandoff
        ? assistApi.claimHandoff(selected.openHandoff.id)
        : assistApi.createHandoff({ conversationId: selectedId! }),
    onSuccess: invalidate,
    onError: (e) => toast({ title: 'Takeover failed', description: e.message, kind: 'error' }),
  });
  const reply = useMutation({
    mutationFn: (text: string) =>
      assistApi.replyToHandoff(selected!.openHandoff!.id, text),
    onSuccess: invalidate,
    onError: (e) => toast({ title: 'Reply failed', description: e.message, kind: 'error' }),
  });
  const handBack = useMutation({
    mutationFn: () => assistApi.resolveHandoff(selected!.openHandoff!.id),
    onSuccess: () => {
      invalidate();
      toast({
        title: 'Handed back to the assistant',
        description: 'Teach the bot from this resolution?',
        kind: 'success',
        action: {
          label: 'Teach',
          onClick: () => navigate('/dashboard/assist/knowledge?new=1'),
        },
      });
    },
    onError: (e) => toast({ title: 'Resolve failed', description: e.message, kind: 'error' }),
  });
  const patchConv = useMutation({
    mutationFn: (body: Parameters<typeof assistApi.updateConversation>[1]) =>
      assistApi.updateConversation(selectedId!, body),
    onSuccess: invalidate,
    onError: (e) => toast({ title: 'Update failed', description: e.message, kind: 'error' }),
  });

  const select = (id: string) => {
    setNewBanner(false);
    navigate(`/dashboard/assist/conversations/${id}`);
  };

  const mobileThread = !!selectedId; // on small screens show thread when selected

  return (
    <div className="inbox">
      {list.isPending ? (
        <CardSkeleton lines={4} />
      ) : (
        <FilterBar filters={filters} onChange={(f) => { setFilters(f); }} />
      )}
      {list.isError && <ErrorState message={list.error.message} />}
      {list.data && (
        <div className={`inbox-grid${mobileThread ? ' inbox-grid--thread' : ''}`}>
          <section className="inbox-pane inbox-pane--list" aria-label="Conversation list">
            <ConversationList
              items={list.data.items}
              selectedId={selectedId}
              total={list.data.total}
              onSelect={select}
            />
          </section>
          <section className="inbox-pane inbox-pane--thread" aria-label="Conversation thread">
            {selected ? (
              <>
                <header className="inbox-thread__head">
                  <button
                    className="inbox-iconbtn inbox-back"
                    onClick={() => navigate('/dashboard/assist/conversations')}
                    aria-label="Back to list"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <div>
                    <div className="inbox-thread__title">
                      {selected.title ?? 'Untitled conversation'}
                    </div>
                    <div className="inbox-thread__sub">
                      {selected.channel} · <StatusBadge status={selected.status} />
                    </div>
                  </div>
                  <button
                    className="inbox-iconbtn"
                    onClick={() => setContextOpen(true)}
                    aria-label="Conversation details"
                  >
                    <Filter size={14} />
                  </button>
                </header>
                {newBanner && (
                  <button className="inbox-new" onClick={() => { setNewBanner(false); messages.refetch(); }}>
                    New messages ↓
                  </button>
                )}
                <Thread messages={messages.data?.items ?? []} loading={messages.isPending} />
                {selected.status === 'ACTIVE' && canWrite !== false && (
                  <Composer
                    handoff={selected.openHandoff}
                    userId={user?.id}
                    busy={takeover.isPending || reply.isPending}
                    onReply={(t) => reply.mutate(t)}
                    onTakeover={() => takeover.mutate()}
                    onHandBack={() => handBack.mutate()}
                  />
                )}
              </>
            ) : (
              <EmptyState
                icon={<MessageSquare size={18} />}
                title="Select a conversation"
                message="Pick a conversation from the list to read the thread."
              />
            )}
          </section>
          <Drawer open={contextOpen && !!selected} onClose={() => setContextOpen(false)} width={300} title="Details">
            {selected && (
              <ContextPanel
                conv={selected}
                onAssign={(uid) => patchConv.mutate({ assignedTo: uid })}
                onArchive={() => {
                  patchConv.mutate({ status: 'ARCHIVED' });
                  navigate('/dashboard/assist/conversations');
                }}
                users={(users.data ?? []).filter((u) => u.status === 'active')}
              />
            )}
          </Drawer>
          <div className="inbox-pane inbox-pane--context">
            {selected ? (
              <ContextPanel
                conv={selected}
                onAssign={(uid) => patchConv.mutate({ assignedTo: uid })}
                onArchive={() => {
                  patchConv.mutate({ status: 'ARCHIVED' });
                  navigate('/dashboard/assist/conversations');
                }}
                users={(users.data ?? []).filter((u) => u.status === 'active')}
              />
            ) : (
              <EmptyState
                compact
                icon={<User size={16} />}
                title="Context"
                message="Customer details, linked records and assignment live here."
              />
            )}
          </div>
        </div>
      )}
      <p className="inbox-hint">
        Tip: press <Kbd>/</Kbd> to search, <Kbd>g c</Kbd> anytime to get here.
      </p>
    </div>
  );
}
