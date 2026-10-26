import { isApiError, userMessageFor } from '../../../shared/api/api-error';
import { z } from 'zod';

export function fieldErrorsFromParse(error: z.ZodError): Record<string, string | undefined> {
  const fe = error.flatten().fieldErrors;
  const out: Record<string, string | undefined> = {};
  for (const [field, messages] of Object.entries(fe)) {
    out[field] = (messages as string[] | undefined)?.[0];
  }
  return out;
}

/** Maps backend error codes to a form-level message and per-field errors. */
export function mapSubmitError(error: unknown): {
  formError: string | null;
  fieldErrors: Record<string, string>;
} {
  if (isApiError(error)) {
    if (error.code === 'EMAIL_EXISTS') {
      return {
        formError: null,
        fieldErrors: {
          email: 'This email is already registered. Try signing in.',
        },
      };
    }
    if (error.code === 'ORG_EXISTS') {
      return {
        formError: null,
        fieldErrors: { organizationSlug: 'That identifier is taken.' },
      };
    }
    if (error.code === 'INVALID_CREDENTIALS') {
      return { formError: 'Invalid email or password.', fieldErrors: {} };
    }
    if (error.code === 'USER_SUSPENDED') {
      return {
        formError: 'This account has been suspended. Contact your administrator.',
        fieldErrors: {},
      };
    }
    if (error.code === 'VALIDATION_ERROR') {
      const fe = error.details?.fieldErrors ?? {};
      const mapped: Record<string, string> = {};
      for (const [field, messages] of Object.entries(fe)) {
        if (messages?.[0]) mapped[field] = messages[0];
      }
      return {
        formError: 'Please fix the highlighted fields.',
        fieldErrors: mapped,
      };
    }
    if (error.status === 429) {
      return {
        formError: 'Too many attempts. Please wait a moment and try again.',
        fieldErrors: {},
      };
    }
    return { formError: userMessageFor(error), fieldErrors: {} };
  }
  return {
    formError: 'Something went wrong. Please try again.',
    fieldErrors: {},
  };
}
