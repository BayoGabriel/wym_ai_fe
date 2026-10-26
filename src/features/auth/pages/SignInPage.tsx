import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function SignInPage() {
  useDocumentTitle('Sign in');
  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)' }}>Sign in</h1>
      <p className="muted small" style={{ marginBottom: 'var(--space-5)' }}>
        Access your organization's workspace.
      </p>
      <LoginForm />
      <p className="small muted" style={{ marginTop: 'var(--space-5)', marginBottom: 0 }}>
        No account yet? <Link to="/register">Create your organization</Link>
      </p>
    </div>
  );
}
