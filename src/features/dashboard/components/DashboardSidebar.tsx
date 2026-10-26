import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../app/providers/auth-context';
import { useOrgContext } from '../../organizations/queries/use-org-context';

const PRODUCT_LABELS: Record<string, string> = {
  WYMASSIST: 'WymAssist AI',
  WYMINSIGHT: 'WymInsight AI',
  WYMFLOW: 'WymFlow AI',
};

export function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const org = useOrgContext();
  const activeProducts = org.status === 'ready' ? org.products.filter((p) => p.active) : [];

  return (
    <aside className="app-sidebar">
      <div className="brand">
        <span className="logo-mark" aria-hidden>
          W
        </span>
        WymNet
      </div>
      <nav className="app-nav" aria-label="Application">
        <NavLink to="/dashboard" end>
          Overview
        </NavLink>
        {activeProducts.length > 0 && <span className="nav-group">Products</span>}
        {activeProducts.map((p) => (
          <NavLink key={p.code} to={`/dashboard/products/${p.code.toLowerCase()}`}>
            {PRODUCT_LABELS[p.code] ?? p.name}
          </NavLink>
        ))}
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
