import { Suspense, useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { pageTitleFor } from './nav';
import { CommandPalette } from './CommandPalette';
import { useShortcuts } from './useShortcuts';
import { ShortcutsModal } from './ShortcutsModal';
import { useApplyPrefs, usePrefs } from '../../shared/prefs/prefs';
import { useTenantAccent } from '../../shared/theme/useTenantAccent';
import { useDocumentTitle } from '../../shared/utils/useDocumentTitle';
import { useAuth } from '../providers/auth-context';
import { endImpersonation } from '../../shared/auth/impersonation';
import { ShieldAlert } from 'lucide-react';
import './shell.css';
import '../../features/dashboard/styles/dashboard.css';

export function AppShell() {
  const [prefs, setPref] = usePrefs();
  const { user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const { pathname } = useLocation();

  useApplyPrefs();
  useTenantAccent();
  useDocumentTitle(pageTitleFor(pathname));

  const toggleCollapse = useCallback(
    () => setPref('sidebarCollapsed', !prefs.sidebarCollapsed),
    [prefs.sidebarCollapsed, setPref]
  );

  useShortcuts({
    onPalette: () => setPaletteOpen(true),
    onCheatsheet: () => setCheatsheetOpen(true),
    onToggleSidebar: toggleCollapse,
  });

  return (
    <div className="app-shell" data-density={prefs.density} data-collapsed={prefs.sidebarCollapsed || undefined}>
      {navOpen && (
        <button className="shell-scrim" aria-label="Close menu" onClick={() => setNavOpen(false)} />
      )}
      <Sidebar
        open={navOpen}
        collapsed={prefs.sidebarCollapsed}
        onClose={() => setNavOpen(false)}
        onToggleCollapse={toggleCollapse}
      />
      {user?.impersonatedBy && (
        <div className="imp-banner" role="alert">
          <ShieldAlert size={13} />
          Viewing as {user.name ?? user.email} — actions are audited.
          <button onClick={() => void endImpersonation()}>Exit view-as</button>
        </div>
      )}
      <main className="shell-main">
        <Topbar
          onMenu={() => setNavOpen(true)}
          onPalette={() => setPaletteOpen(true)}
          onShortcuts={() => setCheatsheetOpen(true)}
        />
        <div className="shell-content">
          <Suspense fallback={<div className="shell-page-loading" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutsModal open={cheatsheetOpen} onClose={() => setCheatsheetOpen(false)} />
    </div>
  );
}
