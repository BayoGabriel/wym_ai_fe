import { Link, Outlet } from 'react-router-dom';
import '../../features/marketing/styles/marketing.css';

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Link
          to="/"
          className="brand"
          style={{ justifyContent: 'center', marginBottom: 'var(--space-5)' }}
        >
          <span className="logo-mark" aria-hidden>
            W
          </span>
          WymNet
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
