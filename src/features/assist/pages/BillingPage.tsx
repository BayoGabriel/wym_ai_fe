import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp, Users, MessageSquare, Sparkles, BookOpen } from 'lucide-react';
import { assistApi } from '../api/assist-api';
import { PageHeader } from '../../../shared/components/PageHeader';
import { ErrorState, LoadingState } from '../../../shared/components/States';
import { Card } from '../../../shared/components/Card';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { Alert } from '../../../shared/components/Alert';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';
import { useCan } from '../../../shared/auth/use-permission';
import '../styles/billing.css';

function UsageBar({ label, used, max, icon }: { label: string; used: number; max: number | null; icon: React.ReactNode }) {
  const pct = max ? Math.min(100, Math.round((used / max) * 100)) : 0;
  return (
    <div className="usage-bar">
      <div className="usage-bar__head">
        <span className="usage-bar__label">{icon}{label}</span>
        <span className="usage-bar__num">{max ? `${used.toLocaleString()} / ${max.toLocaleString()}` : `${used.toLocaleString()} · unlimited`}</span>
      </div>
      {max ? (
        <div className="usage-bar__track">
          <div className={`usage-bar__fill${pct > 85 ? ' is-high' : ''}`} style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <div className="usage-bar__track"><div className="usage-bar__fill" style={{ width: '4%' }} /></div>
      )}
    </div>
  );
}

export function BillingPage() {
  useDocumentTitle('Billing');
  const canRead = useCan('subscription.read');
  const query = useQuery({ queryKey: ['billing'], queryFn: () => assistApi.getBillingSummary(), enabled: canRead });

  if (!canRead) return <ErrorState title="Insufficient permissions" message="Ask an administrator for subscription.read access." />;
  if (query.isPending) return <LoadingState label="Loading billing…" />;
  if (query.isError) return <ErrorState message={query.error.message} />;

  const { subscriptions, usage, plans } = query.data!;
  const sub = subscriptions[0];
  const trial = sub?.trialDaysLeft;

  return (
    <>
      <PageHeader title="Billing" subtitle="Your plan, usage, and trial status." />
      {trial != null && (
        <Alert kind={trial <= 7 ? 'warning' : 'info'}>
          <strong>{trial} day{trial === 1 ? '' : 's'} left</strong> in your trial of {sub.planName ?? sub.productName}.
          Add a payment method or talk to us to keep your assistant running.
        </Alert>
      )}
      <div className="billing-grid">
        <Card title="Current plan" subtitle={sub ? `${sub.productName ?? 'WymAssist'} · ${sub.status}` : 'No active subscription'}>
          {sub ? (
            <div className="billing-plan">
              <div className="billing-plan__name">{sub.planName ?? 'Custom'}</div>
              <div className="billing-plan__price">
                {sub.monthlyPriceCents != null ? `$${(sub.monthlyPriceCents / 100).toFixed(0)}/mo` : 'Contact us'}
              </div>
              <StatusBadge status={sub.status} />
            </div>
          ) : (
            <p className="muted">No subscription yet — your trial starts when the assistant is activated.</p>
          )}
        </Card>
        <Card title="Usage this month" subtitle="Against your plan limits">
          <div className="billing-usage">
            <UsageBar label="Team seats" used={usage.seats ?? 0} max={sub?.maxSeats ?? null} icon={<Users size={13} />} />
            <UsageBar label="Conversations" used={usage['conversation.created'] ?? 0} max={sub?.maxMonthlyConversations ?? null} icon={<MessageSquare size={13} />} />
            <UsageBar label="AI messages" used={usage['ai.message'] ?? 0} max={sub?.maxMonthlyAiMessages ?? null} icon={<Sparkles size={13} />} />
            <UsageBar label="Knowledge items" used={usage['knowledge.created'] ?? 0} max={sub?.maxKnowledgeItems ?? null} icon={<BookOpen size={13} />} />
          </div>
        </Card>
      </div>
      <Card title="Available plans" subtitle="Upgrade or downgrade — billing is handled by WymNet, no self-serve checkout yet.">
        <div className="billing-plans">
          {plans.map((p) => (
            <div key={p.code} className={`billing-plancard${sub?.planCode === p.code ? ' is-current' : ''}`}>
              <div className="billing-plancard__name">{p.name}</div>
              <div className="billing-plancard__price">${(p.monthlyPriceCents / 100).toFixed(0)}<span>/mo</span></div>
              <ul>
                <li>{p.maxSeats ? `${p.maxSeats} seats` : 'Unlimited seats'}</li>
                <li>{p.maxMonthlyConversations ? `${p.maxMonthlyConversations.toLocaleString()} conversations/mo` : 'Unlimited conversations'}</li>
                <li>{p.maxKnowledgeItems ? `${p.maxKnowledgeItems} knowledge items` : 'Unlimited knowledge'}</li>
              </ul>
              {sub?.planCode === p.code ? (
                <span className="billing-plancard__current">Current plan</span>
              ) : (
                <a className="billing-plancard__cta" href="mailto:billing@wymnet.ai?subject=Plan%20change">Talk to us</a>
              )}
            </div>
          ))}
        </div>
        <p className="faint small"><TrendingUp size={11} /> Usage counters are sampled monthly — limits are enforced on write operations.</p>
      </Card>
      <Card title="Payment method">
        <p className="muted"><CreditCard size={13} /> Card management is coming soon — today billing changes go through your WymNet account manager.</p>
      </Card>
    </>
  );
}
