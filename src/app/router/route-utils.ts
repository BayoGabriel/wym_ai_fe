/** Only allow internal absolute paths as post-login destinations. */
export function safeReturnTo(candidate: string | undefined | null): string {
  if (!candidate) return '/dashboard';
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate;
  return '/dashboard';
}
