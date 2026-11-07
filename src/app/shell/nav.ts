import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Database,
  FileBarChart,
  Headset,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Settings,
  UserRound,
  Users,
  Workflow,
} from 'lucide-react';

export type ProductCode = 'WYMASSIST' | 'WYMINSIGHT' | 'WYMFLOW';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  perm?: string;
  end?: boolean;
  badge?: 'handoffs' | 'tasks';
  section: 'main' | ProductCode | 'org' | 'platform';
};

export const PRODUCT_META: Record<ProductCode, { name: string; home: string; icon: LucideIcon }> = {
  WYMASSIST: { name: 'WymAssist', home: '/dashboard/assist', icon: MessagesSquare },
  WYMINSIGHT: { name: 'WymInsight', home: '/dashboard/insight/datasets', icon: BarChart3 },
  WYMFLOW: { name: 'WymFlow', home: '/dashboard/flow/tasks', icon: Workflow },
};

export const SECTION_LABELS: Record<NavItem['section'], string> = {
  main: '',
  WYMASSIST: 'WymAssist',
  WYMINSIGHT: 'WymInsight',
  WYMFLOW: 'WymFlow',
  org: 'Organization',
  platform: 'Platform',
};

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true, section: 'main' },
  { to: '/dashboard/assist', label: 'Work queue', icon: Inbox, end: true, perm: 'conversation.read', section: 'WYMASSIST' },
  { to: '/dashboard/assist/conversations', label: 'Conversations', icon: MessagesSquare, perm: 'conversation.read', section: 'WYMASSIST' },
  { to: '/dashboard/assist/handoffs', label: 'Handoffs', icon: Headset, perm: 'handoff.read', badge: 'handoffs', section: 'WYMASSIST' },
  { to: '/dashboard/assist/leads', label: 'Leads', icon: UserRound, perm: 'lead.read', section: 'WYMASSIST' },
  { to: '/dashboard/assist/appointments', label: 'Appointments', icon: CalendarDays, perm: 'appointment.read', section: 'WYMASSIST' },
  { to: '/dashboard/assist/knowledge', label: 'Knowledge', icon: BookOpen, perm: 'knowledge.read', section: 'WYMASSIST' },
  { to: '/dashboard/assist/reports', label: 'Reports', icon: BarChart3, perm: 'report.read', section: 'WYMASSIST' },
  { to: '/dashboard/assist/settings', label: 'Studio', icon: Settings, perm: 'organization.update', section: 'WYMASSIST' },
  { to: '/dashboard/insight/datasets', label: 'Datasets', icon: Database, perm: 'insight.read', section: 'WYMINSIGHT' },
  { to: '/dashboard/insight/reports', label: 'Reports', icon: FileBarChart, perm: 'insight.read', section: 'WYMINSIGHT' },
  { to: '/dashboard/flow/tasks', label: 'My tasks', icon: ListChecks, perm: 'flow.read', badge: 'tasks', section: 'WYMFLOW' },
  { to: '/dashboard/flow/instances', label: 'Submissions', icon: ClipboardList, perm: 'flow.read', section: 'WYMFLOW' },
  { to: '/dashboard/flow/definitions', label: 'Workflows', icon: Workflow, perm: 'flow.read', section: 'WYMFLOW' },
  { to: '/dashboard/team', label: 'Team', icon: Users, perm: 'user.read', section: 'org' },
  { to: '/dashboard/billing', label: 'Billing', icon: CreditCard, perm: 'subscription.read', section: 'org' },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, section: 'org' },
  { to: '/dashboard/admin/organizations', label: 'Clients', icon: Building2, section: 'platform' },
  { to: '/dashboard/admin/subscriptions', label: 'Subscriptions', icon: CreditCard, section: 'platform' },
  { to: '/dashboard/admin/usage', label: 'Usage & audit', icon: Activity, section: 'platform' },
];

export function pageTitleFor(pathname: string): string {
  const match = [...NAV_ITEMS]
    .filter((i) => pathname === i.to || pathname.startsWith(i.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match?.label ?? 'Dashboard';
}

/** Longest-prefix match for page title + breadcrumbs. */
export function crumbsFor(pathname: string): { label: string; to?: string }[] {
  const match = [...NAV_ITEMS]
    .filter((i) => pathname === i.to || pathname.startsWith(i.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0];
  if (!match) return [{ label: 'Dashboard' }];
  const crumbs = match.to === '/dashboard'
    ? [{ label: 'Overview' }]
    : [
        { label: SECTION_LABELS[match.section] || 'Dashboard', to: match.section === 'org' || match.section === 'platform' || match.section === 'main' ? undefined : PRODUCT_META[match.section as ProductCode]?.home },
        { label: match.label, to: match.to },
      ];
  if (pathname !== match.to) crumbs.push({ label: 'Details', to: undefined });
  return crumbs;
}
