export type ApiErrorDetails = {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetails;

  constructor(status: number, code: string, message: string, details?: ApiErrorDetails) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function userMessageFor(error: unknown, fallback = 'Something went wrong') {
  if (isApiError(error)) {
    if (error.isNetworkError) return 'Cannot reach the server. Check your connection.';
    if (error.status >= 500) return 'A server error occurred. Please try again.';
    return error.message;
  }
  return fallback;
}
