import { Link, useParams } from 'react-router-dom';
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
import { NotesPanel } from '../components/NotesPanel';
import { ReplyComposer } from '../components/ReplyComposer';

export function HandoffDetailPage() {
  const { id = '' } = useParams();
  useDocumentTitle('Handoff');
  const canWrite = useCan('handoff.write');
  const queryClient = useQueryClient();

  const handoff = useQuery(assistQueries.handoff(id));
  const messages = useQuery({
    ...assistQueries.messages(handoff.data?.conversationId ?? ''),
    enabled: !!handoff.data?.conversationId,
  });

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assistKeys.handoff(id) });
      void queryClient.invalidateQueries({ queryKey: ['handoffs'] });
      if (handoff.data?.conversationId) {
        void queryClient.invalidateQueries({
          queryKey: assistKeys.messages(handoff.data.conversationId),
        });
      }
    },
  });

  if (handoff.isPending) return <LoadingState label="Loading handoff…" />;
  if (handoff.isError) return <ErrorState message={handoff.error.message} />;
  const h = handoff.data;
  const active = h.status === 'QUEUED' || h.status === 'ASSIGNED' || h.status === 'REQUESTED';

  return (
    <>
      <PageHeader
        title="Human handoff"
        subtitle={h.reason ?? 'Visitor requested a human agent'}
        actions={
          <>
            <StatusTag status={h.status} />
            {canWrite && h.status === 'QUEUED' && (
              <Button
                variant="secondary"
                onClick={() => act.mutate(() => assistApi.claimHandoff(h.id))}
              >
                Claim
              </Button>
            )}
            {canWrite && active && (
              <>
                <Button onClick={() => act.mutate(() => assistApi.resolveHandoff(h.id))}>
                  Resolve
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => act.mutate(() => assistApi.cancelHandoff(h.id))}
                >
                  Cancel
                </Button>
              </>
            )}
          </>
        }
      />
      {act.isError && <Alert kind="error">{act.error.message}</Alert>}
      <div className="split split--right">
        <section className="card">
          <div className="card-head">
            <h2>Conversation</h2>
            <Link to={`/dashboard/assist/conversations/${h.conversationId}`} className="small">
              Full thread →
            </Link>
          </div>
          {messages.isPending && <LoadingState label="Loading messages…" />}
          {messages.data && <ChatThread messages={messages.data.items} />}
          {canWrite && active && (
            <ReplyComposer
              placeholder="Reply to the visitor as a human agent…"
              submitLabel="Send reply"
              busy={act.isPending}
              onSubmit={(text) => act.mutate(() => assistApi.replyToHandoff(h.id, text))}
            />
          )}
        </section>
        <NotesPanel
          notes={h.notes ?? []}
          canWrite={canWrite}
          onAdd={(body) => act.mutate(() => assistApi.addHandoffNote(h.id, body))}
        />
      </div>
    </>
  );
}
