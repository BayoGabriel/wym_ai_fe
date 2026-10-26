import { TextField } from '../../../shared/components/TextField';

export type RegisterFieldsType =
  'name' | 'email' | 'password' | 'organizationName' | 'organizationSlug';

export type RegisterValues = Record<RegisterFieldsType, string>;

export function RegisterFields({
  values,
  errors,
  onChange,
}: {
  values: RegisterValues;
  errors: Partial<Record<RegisterFieldsType, string>>;
  onChange: (field: RegisterFieldsType) => (e: { target: { value: string } }) => void;
}) {
  return (
    <>
      <TextField
        label="Your name"
        autoComplete="name"
        required
        value={values.name}
        onChange={onChange('name')}
        error={errors.name}
      />
      <TextField
        label="Work email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={onChange('email')}
        error={errors.email}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters"
        value={values.password}
        onChange={onChange('password')}
        error={errors.password}
      />
      <TextField
        label="Organization name"
        required
        value={values.organizationName}
        onChange={onChange('organizationName')}
        error={errors.organizationName}
      />
      <TextField
        label="Organization identifier"
        hint="Optional — lowercase letters, numbers, hyphens."
        value={values.organizationSlug}
        onChange={onChange('organizationSlug')}
        error={errors.organizationSlug}
      />
    </>
  );
}
