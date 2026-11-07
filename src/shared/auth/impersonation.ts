import { tokenStore, type TokenPair } from './token-store';
import { adminApi } from '../../features/admin/api/admin-api';

const KEEPER_KEY = 'wymnet.impersonator';

/** Stash the real admin's token pair and swap in the view-as token. */
export function startImpersonation(impToken: string) {
  const current = tokenStore.get();
  if (current) sessionStorage.setItem(KEEPER_KEY, JSON.stringify(current));
  tokenStore.set({ accessToken: impToken, refreshToken: 'impersonation' });
  window.location.href = '/dashboard';
}

/** Exit view-as: log the end (audited server-side) and restore the admin session. */
export async function endImpersonation() {
  const keeper = sessionStorage.getItem(KEEPER_KEY);
  sessionStorage.removeItem(KEEPER_KEY);
  try {
    await adminApi.endImpersonation();
  } catch {
    // best-effort — the audit middleware still records actions taken
  }
  if (keeper) {
    const pair = JSON.parse(keeper) as TokenPair;
    tokenStore.set(pair);
  } else {
    tokenStore.clear();
  }
  window.location.href = '/dashboard/admin/organizations';
}
