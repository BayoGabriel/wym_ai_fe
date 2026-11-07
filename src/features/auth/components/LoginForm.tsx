import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Alert } from '../../../shared/components/Alert';
import { loginFormSchema } from '../schemas/auth-schemas';
import { useAuth } from '../../../app/providers/auth-context';
import { safeReturnTo } from '../../../app/router/route-utils';
import { mapSubmitError } from './form-errors';

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = loginFormSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({ email: fe.email?.[0], password: fe.password?.[0] });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await signIn(parsed.data);
      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
      navigate(safeReturnTo(returnTo), { replace: true });
    } catch (error) {
      const mapped = mapSubmitError(error);
      setFormError(mapped.formError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && <Alert>{formError}</Alert>}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <Button type="submit" loading={busy} style={{ width: '100%' }}>
        Sign in
      </Button>
      <p className="small muted" style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>
    </form>
  );
}
