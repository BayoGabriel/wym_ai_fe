import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assistApi } from '../api/assist-api';
import type { KnowledgeItem } from '../api/assist-api';
import { useCan } from '../../../shared/auth/use-permission';
import { StatusTag } from './StatusTag';

export function KnowledgeTable({ items }: { items: KnowledgeItem[] }) {
  const canWrite = useCan('knowledge.write');
  const queryClient = useQueryClient();
  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
  });

  return (
    <table className="ops-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Source</th>
          <th>Status</th>
          {canWrite && <th></th>}
        </tr>
      </thead>
      <tbody>
        {items.map((k) => (
          <tr key={k.id}>
            <td>{k.title}</td>
            <td className="muted">{k.category}</td>
            <td className="muted">{k.sourceType}</td>
            <td>
              <StatusTag status={k.status} />
            </td>
            {canWrite && (
              <td>
                <div className="pill-list">
                  {k.status === 'DRAFT' && (
                    <button
                      className="pill"
                      onClick={() =>
                        act.mutate(() => assistApi.updateKnowledge(k.id, { status: 'ACTIVE' }))
                      }
                    >
                      Publish
                    </button>
                  )}
                  {k.status === 'ACTIVE' && (
                    <button
                      className="pill"
                      onClick={() =>
                        act.mutate(() => assistApi.updateKnowledge(k.id, { status: 'ARCHIVED' }))
                      }
                    >
                      Archive
                    </button>
                  )}
                  {k.status === 'DRAFT' && k.sourceType === 'PDF' && (
                    <button
                      className="pill"
                      onClick={() => act.mutate(() => assistApi.processKnowledge(k.id))}
                    >
                      Process
                    </button>
                  )}
                  {k.status === 'ARCHIVED' && (
                    <button
                      className="pill"
                      onClick={() =>
                        act.mutate(() => assistApi.updateKnowledge(k.id, { status: 'DRAFT' }))
                      }
                    >
                      Restore
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
