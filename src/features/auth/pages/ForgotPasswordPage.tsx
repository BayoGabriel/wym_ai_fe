import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { Alert } from '../../../shared/components/Alert';
import { forgotPasswordFormSchema } from '../schemas/auth-schemas';
import { requestPasswordReset } from '../services/auth-api';
import { mapSubmitError } from '../components/form-errors';
import { useDocumentTitle } from '../../../shared/utils/useDocumentTitle';

export function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = forgotPasswordFormSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.flatten().fieldErrors.email?.[0]);
      return;
    }
    setEmailError(undefined);
    setBusy(true);
    try {
      await requestPasswordReset(parsed.data.email);
      setSent(true);
    } catch (error) {
      setFormError(mapSubmitError(error).formError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)' }}>Forgot password</h1>
      <p className="muted small" style={{ marginBottom: 'var(--space-5)' }}>
        Enter your account email and we'll send you a reset link.
      </p>
      {sent ? (
        <Alert kind="success" title="Check your inbox">
          If an account exists for <strong>{email}</strong>, we've emailed a password reset link.
          It expires soon, so use it right away.
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          {formError && <Alert>{formError}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />
          <Button type="submit" loading={busy} style={{ width: '100%' }}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="small muted" style={{ marginTop: 'var(--space-5)', marginBottom: 0 }}>
        Remembered it? <Link to="/sign-in">Back to sign in</Link>
      </p>
    </div>
  );
}
