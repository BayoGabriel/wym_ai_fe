import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '../../features/dashboard/components/DashboardSidebar';
import '../../features/dashboard/styles/dashboard.css';

export function DashboardLayout() {
  return (
    <div className="app-shell">
      <DashboardSidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
