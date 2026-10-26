import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { Alert } from '../../../shared/components/Alert';
import { registerFormSchema } from '../schemas/auth-schemas';
import { useAuth } from '../../../app/providers/auth-context';
import { fieldErrorsFromParse, mapSubmitError } from './form-errors';
import { RegisterFields } from './RegisterFields';
import type { RegisterFieldsType, RegisterValues } from './RegisterFields';

type FieldErrors = Partial<Record<RegisterFieldsType, string>>;

export function RegisterForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterValues>({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    organizationSlug: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (field: RegisterFieldsType) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = registerFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrorsFromParse(parsed.error) as FieldErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const data = {
        ...parsed.data,
        organizationSlug: parsed.data.organizationSlug || undefined,
      };
      await signUp(data);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const mapped = mapSubmitError(error);
      setErrors(mapped.fieldErrors as FieldErrors);
      setFormError(mapped.formError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && <Alert>{formError}</Alert>}
      <RegisterFields values={values} errors={errors} onChange={set} />
      <Button type="submit" loading={busy} style={{ width: '100%' }}>
        Create account
      </Button>
    </form>
  );
}
