import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assistQueries } from '../../assist/queries';
import { assistApi } from '../../assist/api/assist-api';
import { useCan } from '../../../shared/auth/use-permission';

type Check = { label: string; done: boolean; to: string };

/** Real setup-state checklist for a WymAssist organization. */
export function SetupChecklist() {
  const canConfig = useCan('organization.update');
  const canKnowledge = useCan('knowledge.read');
  const config = useQuery({ ...assistQueries.config, enabled: canConfig });
  const knowledge = useQuery({
    queryKey: ['knowledge', 'setup-probe'],
    queryFn: () => assistApi.listKnowledge({ status: 'ACTIVE', page: 1 }),
    enabled: canKnowledge,
    select: (d) => d.total,
  });
  if (!canConfig || !config.data) return null;

  const c = config.data;
  const checks: Check[] = [
    { label: 'Assistant enabled for your website', done: !!c.publicChatEnabled, to: '/dashboard/assist/settings' },
    { label: 'Allowed website origins configured', done: (c.allowedOrigins?.length ?? 0) > 0, to: '/dashboard/assist/settings' },
    { label: 'Knowledge base has active content', done: (knowledge.data ?? 0) > 0, to: '/dashboard/assist/knowledge' },
    { label: 'Lead capture turned on', done: !!c.leadCaptureEnabled, to: '/dashboard/assist/settings' },
    { label: 'Human escalation available', done: !!c.escalationEnabled, to: '/dashboard/assist/settings' },
  ];
  const done = checks.filter((x) => x.done).length;
  if (done === checks.length) return null;

  return (
    <section className="card">
      <div className="card-head">
        <h2>Set up WymAssist</h2>
        <span className="card-note">
          {done}/{checks.length} complete
        </span>
      </div>
      <div className="check-list">
        {checks.map((x) => (
          <div key={x.label} className={`check-item ${x.done ? 'done' : 'todo'}`}>
            <span className="check-dot" aria-hidden>
              ✓
            </span>
            <span className="check-label">{x.label}</span>
            {!x.done && <Link to={x.to}>Configure</Link>}
          </div>
        ))}
      </div>
    </section>
  );
}
