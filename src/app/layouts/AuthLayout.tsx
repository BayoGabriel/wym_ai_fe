import { Link, Outlet } from 'react-router-dom';
import { useLightTheme } from '../../shared/prefs/prefs';
import '../../features/marketing/styles/marketing.css';

export function AuthLayout() {
  useLightTheme();
  return (
    <div className="auth-shell">
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Link
          to="/"
          className="brand"
          style={{ justifyContent: 'center', marginBottom: 'var(--space-5)' }}
        >
          <img className="brand-mark" src="/brand/wymnet-logo.png" alt="" aria-hidden />
          WymNet
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
