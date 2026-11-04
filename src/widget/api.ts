export interface WidgetConfig {
  organization: { name: string; slug: string };
  assistant: { name: string | null; welcomeMessage: string | null };
  branding: { logoUrl: string | null; primaryColor: string | null; secondaryColor: string | null };
  features: { leadCapture: boolean; escalation: boolean; appointments: boolean };
  intakeFields: IntakeField[];
}

export interface IntakeField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required?: boolean;
  options?: string[];
}

export interface SessionInfo {
  sessionToken: string;
  expiresAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'AGENT';
  content: string;
  createdAt: string;
}

async function request<T>(
  apiBase: string,
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {}
): Promise<T> {
  const res = await fetch(`${apiBase}/api/v1/public/assist${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    const e = new Error(err?.error?.message ?? `Request failed (${res.status})`);
    (e as { status?: number }).status = res.status;
    throw e;
  }
  return res.json() as Promise<T>;
}

export type OrgRef = { organizationKey?: string; organizationSlug?: string };

function refQuery(ref: OrgRef) {
  return ref.organizationKey
    ? `organizationKey=${encodeURIComponent(ref.organizationKey)}`
    : `organizationSlug=${encodeURIComponent(ref.organizationSlug ?? '')}`;
}

export function getConfig(apiBase: string, ref: OrgRef) {
  return request<WidgetConfig>(apiBase, `/config?${refQuery(ref)}`);
}

export function createSession(apiBase: string, ref: OrgRef) {
  return request<SessionInfo>(apiBase, '/sessions', {
    method: 'POST',
    body: ref.organizationKey
      ? { organizationKey: ref.organizationKey }
      : { organizationSlug: ref.organizationSlug },
  });
}

export function validateSession(apiBase: string, token: string) {
  return request<{ conversation: { id: string; status: string } }>(apiBase, '/session', { token });
}

export function listMessages(apiBase: string, token: string) {
  return request<{ items: ChatMessage[] }>(apiBase, '/messages?limit=100', { token });
}

export function sendMessage(apiBase: string, token: string, content: string) {
  return request<{ userMessage: ChatMessage; assistantMessage: ChatMessage | null }>(
    apiBase,
    '/messages',
    { method: 'POST', token, body: { content, clientRequestId: crypto.randomUUID() } }
  );
}

export function submitLead(
  apiBase: string,
  token: string,
  body: Record<string, unknown> & { customFields?: Record<string, unknown> }
) {
  return request<{ id: string }>(apiBase, '/leads', {
    method: 'POST',
    token,
    body: { ...body, clientRequestId: crypto.randomUUID() },
  });
}

export function requestHandoff(apiBase: string, token: string, reason?: string) {
  return request<{ id: string; status: string }>(apiBase, '/handoff', {
    method: 'POST',
    token,
    body: { reason },
  });
}

export function requestAppointment(
  apiBase: string,
  token: string,
  body: {
    customerName: string;
    email?: string;
    phone?: string;
    preferredDate: string;
    preferredTime: string;
    reason?: string;
  }
) {
  return request<{ id: string; status: string }>(apiBase, '/appointments', {
    method: 'POST',
    token,
    body: { ...body, clientRequestId: crypto.randomUUID() },
  });
}
