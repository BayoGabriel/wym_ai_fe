export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  organizationId: string | null;
  roles: { id: string; name: string; scope: 'platform' | 'organization' }[];
  permissions: string[];
  platformAccess: boolean;
};

export type RegisterResponse = {
  organization: { id: string; name: string; slug: string };
  user: { id: string; email: string; name: string };
  accessToken: string;
  refreshToken: string;
};

export type AuthState =
  | { status: 'initializing' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' };
