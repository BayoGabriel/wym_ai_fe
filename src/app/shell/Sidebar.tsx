import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from '../providers/auth-context';
import { useOrgContext } from '../../features/organizations/queries/use-org-context';
import { useCan } from '../../shared/auth/use-permission';
import { assistApi } from '../../features/assist/api/assist-api';
import { flowApi } from '../../features/flow/api';
import { Tooltip } from '../../shared/components/Tooltip';
import { NAV_ITEMS, SECTION_LABELS, type NavItem } from './nav';

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

function SectionNav({
  items,
  collapsed,
  counts,
  onNavigate,
}: {
  items: NavItem[];
  collapsed: boolean;
  counts: { handoffs: number; tasks: number };
  onNavigate?: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const badge = item.badge ? counts[item.badge] : 0;
        const link = (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `rail-link${isActive ? ' is-active' : ''}`}
          >
            <item.icon className="rail-link__icon" aria-hidden />
            <span className="rail-link__label">{item.label}</span>
            {badge > 0 && <span className="rail-link__badge">{badge}</span>}
          </NavLink>
        );
        return collapsed ? (
          <Tooltip key={item.to} content={item.label} side="right">
            {link}
          </Tooltip>
        ) : (
          link
        );
      })}
    </>
  );
}

export function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}) {
  const { user } = useAuth();
  const org = useOrgContext();
  const counts = useQueueCounts();
  const canInsight = useCan('insight.read');
  const canFlow = useCan('flow.read');

  const activeProducts = org.status === 'ready' ? org.products.filter((p) => p.active) : [];
  const hasProduct = (code: string) => activeProducts.some((p) => p.code === code);

  const visible = NAV_ITEMS.filter((item) => {
    if (item.section === 'platform') return !!user?.platformAccess;
    if (item.section === 'WYMASSIST' && !hasProduct('WYMASSIST')) return false;
    if (item.section === 'WYMINSIGHT' && (!hasProduct('WYMINSIGHT') || !canInsight)) return false;
    if (item.section === 'WYMFLOW' && (!hasProduct('WYMFLOW') || !canFlow)) return false;
    if (item.perm && !user?.permissions.includes(item.perm)) return false;
    return true;
  });

  const sections: NavItem['section'][] = ['main', 'WYMASSIST', 'WYMINSIGHT', 'WYMFLOW', 'org', 'platform'];

  return (
    <aside className={`rail${open ? ' open' : ''}${collapsed ? ' rail--collapsed' : ''}`} aria-label="Application navigation">
      <div className="rail-brand">
        <img className="rail-brand__mark" src="/brand/wymnet-logo.png" alt="" aria-hidden />
        <span className="rail-brand__name">WymNet</span>
      </div>
      {org.status === 'ready' && org.organization && (
        <div className="rail-org">
          <span className="rail-org__mono" aria-hidden>
            {org.organization.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="rail-org__text">
            <div className="rail-org__name">{org.organization.name}</div>
            <div className="rail-org__sub">
              {activeProducts.length === 0
                ? 'No products enabled'
                : `${activeProducts.length} product${activeProducts.length === 1 ? '' : 's'} enabled`}
            </div>
          </div>
        </div>
      )}
      <nav className="rail-nav" aria-label="Application">
        {sections.map((section) => {
          const items = visible.filter((i) => i.section === section);
          if (!items.length) return null;
          return (
            <div className="rail-section" key={section}>
              {SECTION_LABELS[section] && (
                <div className="rail-section__label">{SECTION_LABELS[section]}</div>
              )}
              <SectionNav items={items} collapsed={collapsed} counts={counts} onNavigate={onClose} />
            </div>
          );
        })}
      </nav>
      <button
        className="rail-collapse"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        <span className="rail-link__label">{collapsed ? 'Expand' : 'Collapse'}</span>
      </button>
    </aside>
  );
}
