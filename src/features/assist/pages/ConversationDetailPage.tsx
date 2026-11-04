import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import { assistKeys, assistQueries } from '../queries';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';
import { LoadingState, ErrorState } from '../../../shared/components/States';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import { StatusTag } from '../components/StatusTag';
import { ChatThread } from '../components/ChatThread';

export function ConversationDetailPage() {
  const { id = '' } = useParams();
  useDocumentTitle('Conversation');
  const canWrite = useCan('conversation.update');
  const queryClient = useQueryClient();

  const conversation = useQuery({
    queryKey: assistKeys.conversation(id),
    queryFn: () => assistApi.getConversation(id),
  });
  const messages = useQuery(assistQueries.messages(id));

  const close = useMutation({
    mutationFn: () => assistApi.updateConversation(id, { status: 'CLOSED' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assistKeys.conversation(id) });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  if (conversation.isPending) return <LoadingState label="Loading conversation…" />;
  if (conversation.isError) return <ErrorState message={conversation.error.message} />;
  const conv = conversation.data;

  return (
    <>
      <PageHeader
        title={conv.title ?? 'Conversation'}
        subtitle={`${conv.channel} · started ${new Date(conv.createdAt).toLocaleString()}`}
        actions={
          <>
            <StatusTag status={conv.status} />
            {canWrite && conv.status === 'ACTIVE' && (
              <Button variant="secondary" loading={close.isPending} onClick={() => close.mutate()}>
                Close conversation
              </Button>
            )}
          </>
        }
      />
      {close.isError && <Alert kind="error">{close.error.message}</Alert>}
      <div className="split split--right">
        <section className="card">
          {messages.isPending && <LoadingState label="Loading messages…" />}
          {messages.isError && <ErrorState message={messages.error.message} />}
          {messages.data && <ChatThread messages={messages.data.items} />}
          {messages.data && (
            <p className="faint small" style={{ marginBottom: 0, marginTop: 'var(--space-4)' }}>
              {messages.data.total} messages · refreshes every 8s
            </p>
          )}
        </section>
        <aside>
          <section className="card">
            <div className="card-head">
              <h2>Details</h2>
            </div>
            <dl className="detail-list">
              <dt>ID</dt>
              <dd className="mono">{conv.id.slice(0, 13)}…</dd>
              <dt>Channel</dt>
              <dd>{conv.channel}</dd>
              <dt>Status</dt>
              <dd>
                <StatusTag status={conv.status} />
              </dd>
              <dt>Started</dt>
              <dd>{new Date(conv.createdAt).toLocaleString()}</dd>
              <dt>Updated</dt>
              <dd>{new Date(conv.updatedAt).toLocaleString()}</dd>
            </dl>
          </section>
          <section className="card">
            <div className="card-head">
              <h2>Related</h2>
            </div>
            <ul className="row-list">
              <li>
                <div className="row-main">
                  <div className="row-sub">
                    <Link to="/dashboard/assist/handoffs">Handoffs for this conversation →</Link>
                  </div>
                </div>
              </li>
              <li>
                <div className="row-main">
                  <div className="row-sub">
                    <Link to="/dashboard/assist/leads">Leads captured →</Link>
                  </div>
                </div>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
