import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Alert } from '../../../shared/components/Alert';
import { resetPasswordFormSchema } from '../schemas/auth-schemas';
import { resetPassword } from '../services/auth-api';
import { isApiError } from '../../../shared/api/api-error';
import { mapSubmitError } from '../components/form-errors';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = resetPasswordFormSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({ password: fe.password?.[0], confirmPassword: fe.confirmPassword?.[0] });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await resetPassword({ token, password: parsed.data.password });
      setDone(true);
    } catch (error) {
      if (isApiError(error) && error.code === 'INVALID_RESET_TOKEN') {
        setFormError('This reset link is invalid or has expired. Request a new one below.');
      } else {
        setFormError(mapSubmitError(error).formError);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)' }}>Reset password</h1>
      {!token ? (
        <>
          <Alert kind="warning" title="Missing reset link">
            This page needs the link from your password reset email.
          </Alert>
          <p className="small muted" style={{ marginTop: 'var(--space-5)', marginBottom: 0 }}>
            <Link to="/forgot-password">Request a new reset link</Link>
          </p>
        </>
      ) : done ? (
        <>
          <Alert kind="success" title="Password updated">
            Your password has been changed. Sign in with your new password.
          </Alert>
          <p className="small muted" style={{ marginTop: 'var(--space-5)', marginBottom: 0 }}>
            <Link to="/sign-in">Go to sign in</Link>
          </p>
        </>
      ) : (
        <>
          <p className="muted small" style={{ marginBottom: 'var(--space-5)' }}>
            Choose a new password for your account.
          </p>
          <form onSubmit={onSubmit} noValidate>
            {formError && <Alert>{formError}</Alert>}
            <TextField
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <TextField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />
            <Button type="submit" loading={busy} style={{ width: '100%' }}>
              Reset password
            </Button>
          </form>
          <p className="small muted" style={{ marginTop: 'var(--space-5)', marginBottom: 0 }}>
            Link expired? <Link to="/forgot-password">Request a new one</Link>
          </p>
        </>
      )}
    </div>
  );
}
