import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function RegisterPage() {
  useDocumentTitle('Create account');
  return (
    <div className="card" style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)' }}>Create your account</h1>
      <p className="muted small" style={{ marginBottom: 'var(--space-5)' }}>
        Registering creates your organization workspace and an administrator account.
      </p>
      <RegisterForm />
      <p className="small muted" style={{ marginTop: 'var(--space-5)', marginBottom: 0 }}>
        Already have an account? <Link to="/sign-in">Sign in</Link>
      </p>
    </div>
  );
}
