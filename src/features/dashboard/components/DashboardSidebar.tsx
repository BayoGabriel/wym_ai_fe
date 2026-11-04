import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../app/providers/auth-context';
import { useOrgContext } from '../../organizations/queries/use-org-context';
import { useCan } from '../../../shared/auth/use-permission';
import { assistApi } from '../../assist/api/assist-api';
import { flowApi } from '../../flow/api';

const ASSIST_LINKS: { to: string; label: string; perm: string; badge?: 'handoffs' }[] = [
  { to: '/dashboard/assist/conversations', label: 'Conversations', perm: 'conversation.read' },
  { to: '/dashboard/assist/handoffs', label: 'Handoffs', perm: 'handoff.read', badge: 'handoffs' },
  { to: '/dashboard/assist/leads', label: 'Leads', perm: 'lead.read' },
  { to: '/dashboard/assist/appointments', label: 'Appointments', perm: 'appointment.read' },
  { to: '/dashboard/assist/knowledge', label: 'Knowledge', perm: 'knowledge.read' },
  { to: '/dashboard/assist/reports', label: 'Reports', perm: 'report.read' },
  { to: '/dashboard/assist/settings', label: 'Settings', perm: 'organization.update' },
];

function useQueueCounts() {
  const canHandoffs = useCan('handoff.read');
  const canFlow = useCan('flow.read');
  const handoffs = useQuery({
    queryKey: ['nav', 'open-handoffs'],
    queryFn: () => assistApi.listHandoffs({ status: 'QUEUED' }),
    enabled: canHandoffs,
    staleTime: 30_000,
    select: (d) => d.total,
  });
  const tasks = useQuery({
    queryKey: ['nav', 'pending-tasks'],
    queryFn: () => flowApi.listTasks({ mine: true, status: 'PENDING' }),
    enabled: canFlow,
    staleTime: 30_000,
    select: (d) => d.total,
  });
  return { handoffs: handoffs.data ?? 0, tasks: tasks.data ?? 0 };
}

function OrgContextBox() {
  const org = useOrgContext();
  if (org.status !== 'ready' || !org.organization) return null;
  const active = org.products.filter((p) => p.active).length;
  return (
    <div className="rail-org">
      <div className="rail-org-name">{org.organization.name}</div>
      <div className="rail-org-sub">
        {active === 0 ? 'No products enabled' : `${active} product${active === 1 ? '' : 's'} enabled`}
      </div>
    </div>
  );
}

export function DashboardSidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const { user, signOut } = useAuth();
  const org = useOrgContext();
  const canTeam = useCan('user.read');
  const canInsight = useCan('insight.read');
  const canFlow = useCan('flow.read');
  const counts = useQueueCounts();
  const activeProducts = org.status === 'ready' ? org.products.filter((p) => p.active) : [];
  const hasAssist = activeProducts.some((p) => p.code === 'WYMASSIST');
  const hasInsight = activeProducts.some((p) => p.code === 'WYMINSIGHT') && canInsight;
  const hasFlow = activeProducts.some((p) => p.code === 'WYMFLOW') && canFlow;

  return (
    <aside className={`app-sidebar${open ? ' open' : ''}`} aria-label="Application navigation">
      <div className="brand">
        <span className="logo-mark" aria-hidden>
          W
        </span>
        WymNet
      </div>
      <OrgContextBox />
      <nav className="app-nav" aria-label="Application" onClick={onClose}>
        <NavLink to="/dashboard" end>
          Overview
        </NavLink>
        {hasAssist && (
          <>
            <span className="nav-group">WymAssist AI</span>
            <NavLink to="/dashboard/assist" end>
              Work queue
            </NavLink>
            {ASSIST_LINKS.map((l) => (
              <NavItem key={l.to} {...l} badgeCount={l.badge === 'handoffs' ? counts.handoffs : 0} />
            ))}
          </>
        )}
        {hasInsight && (
          <>
            <span className="nav-group">WymInsight AI</span>
            <NavLink to="/dashboard/insight/datasets">Datasets</NavLink>
            <NavLink to="/dashboard/insight/reports">Reports</NavLink>
          </>
        )}
        {hasFlow && (
          <>
            <span className="nav-group">WymFlow AI</span>
            <NavLink to="/dashboard/flow/tasks">
              My tasks
              {counts.tasks > 0 && (
                <span className="count-chip count-chip--alert">{counts.tasks}</span>
              )}
            </NavLink>
            <NavLink to="/dashboard/flow/instances">Submissions</NavLink>
            <NavLink to="/dashboard/flow/definitions">Workflows</NavLink>
          </>
        )}
        {canTeam && (
          <>
            <span className="nav-group">Organization</span>
            <NavLink to="/dashboard/team">Team</NavLink>
          </>
        )}
        {user?.platformAccess && (
          <>
            <span className="nav-group">Platform</span>
            <NavLink to="/dashboard/admin/organizations">Clients</NavLink>
            <NavLink to="/dashboard/admin/subscriptions">Subscriptions</NavLink>
            <NavLink to="/dashboard/admin/usage">Usage &amp; audit</NavLink>
          </>
        )}
      </nav>
      {user && (
        <div className="user-box">
          <div className="user-name">{user.name}</div>
          <div className="user-email">{user.email}</div>
          <button className="signout" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

function NavItem({
  to,
  label,
  perm,
  badgeCount,
}: {
  to: string;
  label: string;
  perm: string;
  badgeCount?: number;
}) {
  const allowed = useCan(perm);
  if (!allowed) return null;
  return (
    <NavLink to={to}>
      {label}
      {badgeCount ? <span className="count-chip count-chip--alert">{badgeCount}</span> : null}
    </NavLink>
  );
}
