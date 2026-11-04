import { useAuth } from '../../app/providers/auth-context';

/** True when the signed-in user holds the given permission key. */
export function useCan(permission: string): boolean {
  const { user } = useAuth();
  return !!user?.permissions.includes(permission);
}
