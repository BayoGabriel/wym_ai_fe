import { describe, expect, it } from 'vitest';
import { ApiError, isApiError, userMessageFor } from './api-error';

describe('ApiError', () => {
  it('exposes status, code, message, and details', () => {
    const err = new ApiError(422, 'VALIDATION_ERROR', 'Invalid input', {
      fieldErrors: { email: ['Taken'] },
    });
    expect(err.status).toBe(422);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details?.fieldErrors?.email).toEqual(['Taken']);
  });

  it('isNetworkError only for status 0', () => {
    expect(new ApiError(0, 'NETWORK_ERROR', 'x').isNetworkError).toBe(true);
    expect(new ApiError(500, 'X', 'x').isNetworkError).toBe(false);
  });
});

describe('isApiError / userMessageFor', () => {
  it('identifies ApiError instances only', () => {
    expect(isApiError(new ApiError(400, 'X', 'x'))).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
    expect(isApiError('x')).toBe(false);
  });

  it('maps network failures to a connectivity message', () => {
    expect(userMessageFor(new ApiError(0, 'NETWORK_ERROR', 'raw'))).toMatch(/server/i);
  });

  it('maps 5xx to a generic retry message, hiding internals', () => {
    expect(userMessageFor(new ApiError(500, 'INTERNAL', 'db connection refused'))).toBe(
      'A server error occurred. Please try again.'
    );
  });

  it('passes through safe 4xx messages', () => {
    expect(userMessageFor(new ApiError(400, 'BAD', 'Check the form'))).toBe('Check the form');
  });
});
