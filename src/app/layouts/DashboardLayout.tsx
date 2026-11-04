import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardSidebar } from '../../features/dashboard/components/DashboardSidebar';
import '../../features/dashboard/styles/dashboard.css';

const TITLES: [string, string][] = [
  ['/dashboard/assist/conversations', 'Conversations'],
  ['/dashboard/assist/handoffs', 'Handoffs'],
  ['/dashboard/assist/leads', 'Leads'],
  ['/dashboard/assist/appointments', 'Appointments'],
  ['/dashboard/assist/knowledge', 'Knowledge'],
  ['/dashboard/assist/reports', 'Reports'],
  ['/dashboard/assist/settings', 'Settings'],
  ['/dashboard/assist', 'Work queue'],
  ['/dashboard/insight/datasets', 'Datasets'],
  ['/dashboard/insight/reports', 'Insight reports'],
  ['/dashboard/flow/tasks', 'My tasks'],
  ['/dashboard/flow/instances', 'Submissions'],
  ['/dashboard/flow/definitions', 'Workflows'],
  ['/dashboard/team', 'Team'],
  ['/dashboard/admin/organizations', 'Client accounts'],
  ['/dashboard/admin/subscriptions', 'Subscriptions'],
  ['/dashboard/admin/usage', 'Usage & audit'],
  ['/dashboard', 'Overview'],
];

function pageTitle(pathname: string) {
  const hit = TITLES.find(([p]) => pathname === p || (p !== '/dashboard' && pathname.startsWith(p + '/')));
  return hit?.[1] ?? 'Dashboard';
}

export function DashboardLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <div className="app-shell">
      {navOpen && <button className="rail-scrim" aria-label="Close menu" onClick={() => setNavOpen(false)} />}
      <DashboardSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <main className="app-main">
        <header className="app-topbar">
          <button className="menu-btn" aria-label="Open menu" aria-expanded={navOpen} onClick={() => setNavOpen(true)}>
            ☰
          </button>
          <div className="crumb">
            WymNet <span aria-hidden>·</span> <strong>{pageTitle(pathname)}</strong>
          </div>
        </header>
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
