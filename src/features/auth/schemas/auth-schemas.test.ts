import { describe, expect, it } from 'vitest';
import { loginFormSchema, registerFormSchema } from './auth-schemas';

const validRegister = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'sup3rsecret',
  organizationName: 'Analytical Engines Ltd',
};

describe('loginFormSchema', () => {
  it('accepts a valid login', () => {
    expect(loginFormSchema.safeParse({ email: 'a@b.co', password: 'password1' }).success).toBe(
      true
    );
  });

  it('rejects invalid email and short password', () => {
    const result = loginFormSchema.safeParse({
      email: 'nope',
      password: 'short',
    });
    expect(result.success).toBe(false);
    const fe = result.error!.flatten().fieldErrors;
    expect(fe.email?.[0]).toMatch(/email/i);
    expect(fe.password?.[0]).toMatch(/8 characters/);
  });
});

describe('registerFormSchema', () => {
  it('accepts valid input with optional slug omitted', () => {
    expect(registerFormSchema.safeParse(validRegister).success).toBe(true);
  });

  it('accepts a valid optional slug', () => {
    expect(
      registerFormSchema.safeParse({
        ...validRegister,
        organizationSlug: 'acme-inc',
      }).success
    ).toBe(true);
  });

  it('rejects an invalid slug', () => {
    const result = registerFormSchema.safeParse({
      ...validRegister,
      organizationSlug: 'Bad_Slug!',
    });
    expect(result.success).toBe(false);
    expect(result.error!.flatten().fieldErrors.organizationSlug).toBeTruthy();
  });

  it('requires name, email, password, and organization name', () => {
    const result = registerFormSchema.safeParse({
      name: '',
      email: 'bad',
      password: '123',
      organizationName: '',
    });
    expect(result.success).toBe(false);
    const fe = result.error!.flatten().fieldErrors;
    expect(fe.name).toBeTruthy();
    expect(fe.email).toBeTruthy();
    expect(fe.password).toBeTruthy();
    expect(fe.organizationName).toBeTruthy();
  });
});
