import { authRequest } from '../../../shared/api/api-client';

export type Paged<T> = { items: T[]; page: number; limit: number; total: number };

export type Conversation = {
  id: string;
  title: string | null;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  channel: string;
  assignedTo: string | null;
  tags: string[] | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  // List-row enrichment (present on list responses).
  lastMessage?: { content: string; role: string; createdAt: string } | null;
  leadId?: string | null;
  openHandoff?: { id: string; status: string } | null;
  assignee?: { id: string; name: string | null } | null;
};

export type Message = {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'AGENT';
  content: string;
  createdAt: string;
  grounded?: boolean;
  feedback?: 'up' | 'down' | null;
  metadata?: { grounded?: boolean; sources?: Source[] };
  sources?: Source[];
};

export type Source = { knowledgeItemId?: string; chunkId?: string; score?: number; title?: string };

export type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  enquiryCategory: string | null;
  summary: string | null;
  status: string;
  source: string;
  assignedTo: string | null;
  consentToContact: boolean;
  customFields: Record<string, string | boolean> | null;
  createdAt: string;
  notes?: { id: string; body: string; createdAt: string }[];
};

export type Handoff = {
  id: string;
  conversationId: string;
  status: string;
  requestedBy: string;
  reason: string | null;
  assignedTo: string | null;
  resolutionSummary: string | null;
  createdAt: string;
  notes?: { id: string; body: string; createdAt: string }[];
};

export type Appointment = {
  id: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  preferredDate: string;
  preferredTime: string;
  reason: string | null;
  internalNotes: string | null;
  status: string;
  source: string;
  assignedTo: string | null;
  createdAt: string;
};

export type KnowledgeItem = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  sourceType: 'TEXT' | 'PDF';
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  processingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null;
  processingError?: string | null;
  createdAt: string;
};

export type StaffUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
  department: string | null;
  createdAt: string;
};

export type Role = { id: string; name: string; scope: 'platform' | 'organization' };

export type AssistantConfig = {
  assistantName?: string | null;
  welcomeMessage?: string | null;
  tone?: string | null;
  businessDescription?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  operatingHours?: string | null;
  escalationEnabled?: boolean;
  leadCaptureEnabled?: boolean;
  appointmentRequestsEnabled?: boolean;
  publicChatEnabled?: boolean;
  allowedOrigins?: string[];
  intakeFields?: IntakeField[] | null;
  availability?: Availability | null;
  guardrails?: Guardrails | null;
  widgetAppearance?: WidgetAppearance | null;
  notificationEmail?: string | null;
  notifyOnLead?: boolean;
  notifyOnHandoff?: boolean;
  notifyOnAppointment?: boolean;
};

export type Availability = {
  days: number[];
  open: string;
  close: string;
  slotMinutes?: number;
  bufferMinutes?: number;
  blackoutDates?: string[];
};

export type Guardrails = {
  fallbackMessage?: string;
  escalationTriggers?: string[];
  restrictedTopics?: string[];
  medicalSafetyMode?: boolean;
};

export type WidgetAppearance = {
  position?: 'left' | 'right';
  shape?: 'rounded' | 'square' | 'circle';
  size?: 'compact' | 'comfortable';
  mode?: 'light' | 'dark' | 'auto';
  greeting?: string;
  subtitle?: string;
};

export type IntakeField = {
  key: string;
  label: string;
  type:
    | 'text'
    | 'select'
    | 'checkbox'
    | 'phone'
    | 'email'
    | 'date'
    | 'time'
    | 'textarea'
    | 'consent';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
};

export type OrgSettings = {
  businessName?: string | null;
  businessCategory?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  whatsappPhoneNumberId?: string | null;
  messengerPageId?: string | null;
  instagramAccountId?: string | null;
  telegramBotToken?: string | null;
  inboundEmailAddress?: string | null;
};

export type EnquiryReport = {
  windowDays: number;
  conversations: { total: number; byChannel: { channel: string; count: number }[] };
  previous: {
    conversations: number;
    messages: number;
    leads: number;
    handoffs: number;
    appointments: number;
  };
  messages: { total: number; daily: { date: string; count: number }[] };
  leads: {
    total: number;
    byStatus: { status: string; count: number }[];
    byCategory: { category: string; count: number }[];
  };
  handoffs: { total: number; open: number; byStatus: { status: string; count: number }[] };
  appointments: { total: number; byStatus: { status: string; count: number }[] };
  rates?: {
    escalationRate: number;
    resolutionRate: number;
    avgFirstResponseSeconds: number | null;
  };
  csat?: { positive: number; negative: number; score: number | null };
};

export type ReportSchedule = {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  lastSentAt: string | null;
  enabled: boolean;
  createdAt: string;
};

export type BillingSummary = {
  subscriptions: {
    id: string;
    status: string;
    trialEndsAt: string | null;
    trialDaysLeft: number | null;
    productName: string | null;
    productCode: string | null;
    planName: string | null;
    planCode: string | null;
    monthlyPriceCents: number | null;
    maxSeats: number | null;
    maxKnowledgeItems: number | null;
    maxMonthlyConversations: number | null;
    maxMonthlyAiMessages: number | null;
  }[];
  usage: Record<string, number>;
  plans: {
    id: string;
    code: string;
    name: string;
    monthlyPriceCents: number;
    maxSeats: number | null;
    maxKnowledgeItems: number | null;
    maxMonthlyConversations: number | null;
    maxMonthlyAiMessages: number | null;
  }[];
};

export type MeSession = { id: string; createdAt: string; expiresAt: string };
export type MePreferences = { notifyEmail: Record<string, boolean>; notifyInApp: Record<string, boolean> };
export type AuditEventRow = {
  id: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: string | null;
  createdAt: string;
  actor: string | null;
  actorEmail: string | null;
};

const q = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

export const assistApi = {
  // Conversations
  listConversations: (
    params: {
      status?: string;
      channel?: string;
      q?: string;
      hasLead?: boolean;
      escalated?: boolean;
      assignedTo?: string;
      tag?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    } = {}
  ) => authRequest<Paged<Conversation>>(`/api/v1/conversations${q(params)}`),
  getConversation: (id: string) => authRequest<Conversation>(`/api/v1/conversations/${id}`),
  listMessages: (id: string) =>
    authRequest<Paged<Message>>(`/api/v1/conversations/${id}/messages?limit=100`),
  updateConversation: (
    id: string,
    body: { status?: string; title?: string; assignedTo?: string | null; tags?: string[] }
  ) => authRequest<Conversation>(`/api/v1/conversations/${id}`, { method: 'PATCH', body }),

  // Leads
  listLeads: (params: { status?: string; q?: string; page?: number; limit?: number } = {}) =>
    authRequest<Paged<Lead>>(`/api/v1/leads${q(params)}`),
  getLead: (id: string) => authRequest<Lead>(`/api/v1/leads/${id}`),
  updateLead: (id: string, body: Record<string, unknown>) =>
    authRequest<Lead>(`/api/v1/leads/${id}`, { method: 'PATCH', body }),
  addLeadNote: (id: string, note: string) =>
    authRequest(`/api/v1/leads/${id}/notes`, { method: 'POST', body: { body: note } }),

  // Handoffs
  listHandoffs: (params: { status?: string; page?: number } = {}) =>
    authRequest<Paged<Handoff>>(`/api/v1/handoffs${q(params)}`),
  getHandoff: (id: string) => authRequest<Handoff>(`/api/v1/handoffs/${id}`),
  createHandoff: (body: { conversationId: string; reason?: string }) =>
    authRequest<Handoff>('/api/v1/handoffs', { method: 'POST', body }),
  claimHandoff: (id: string) =>
    authRequest<Handoff>(`/api/v1/handoffs/${id}/claim`, { method: 'POST' }),
  resolveHandoff: (id: string, resolutionSummary?: string) =>
    authRequest<Handoff>(`/api/v1/handoffs/${id}/resolve`, {
      method: 'POST',
      body: { resolutionSummary },
    }),
  cancelHandoff: (id: string) =>
    authRequest<Handoff>(`/api/v1/handoffs/${id}/cancel`, { method: 'POST', body: {} }),
  replyToHandoff: (id: string, content: string) =>
    authRequest(`/api/v1/handoffs/${id}/replies`, { method: 'POST', body: { content } }),
  addHandoffNote: (id: string, note: string) =>
    authRequest(`/api/v1/handoffs/${id}/notes`, { method: 'POST', body: { body: note } }),

  // Appointments
  listAppointments: (params: { status?: string; from?: string; to?: string; page?: number } = {}) =>
    authRequest<Paged<Appointment>>(`/api/v1/appointments${q(params)}`),
  updateAppointment: (id: string, body: Record<string, unknown>) =>
    authRequest<Appointment>(`/api/v1/appointments/${id}`, { method: 'PATCH', body }),

  // Knowledge
  listKnowledge: (
    params: { status?: string; category?: string; search?: string; page?: number } = {}
  ) => authRequest<Paged<KnowledgeItem>>(`/api/v1/knowledge${q(params)}`),
  createKnowledge: (body: {
    title: string;
    content: string;
    description?: string;
    category: string;
    status?: string;
  }) => authRequest<KnowledgeItem>('/api/v1/knowledge', { method: 'POST', body }),
  updateKnowledge: (id: string, body: Record<string, unknown>) =>
    authRequest<KnowledgeItem>(`/api/v1/knowledge/${id}`, { method: 'PATCH', body }),
  uploadKnowledgePdf: (body: {
    title: string;
    fileName: string;
    base64: string;
    category?: string;
    description?: string;
  }) =>
    authRequest<{ item: KnowledgeItem }>('/api/v1/knowledge/documents', {
      method: 'POST',
      body: { ...body, mimeType: 'application/pdf' },
    }),
  uploadKnowledgeDocument: (body: {
    title: string;
    fileName: string;
    mimeType: string;
    base64: string;
    category?: string;
    description?: string;
  }) =>
    authRequest<{ item: KnowledgeItem }>('/api/v1/knowledge/documents', {
      method: 'POST',
      body,
    }),
  listKnowledgeGaps: () =>
    authRequest<{
      items: { question: string; conversationId: string; times: number; lastAskedAt: string }[];
    }>('/api/v1/knowledge/gaps'),
  aiRespond: (body: { message: string }) =>
    authRequest<{ message: string; grounded: boolean; sources: Source[] }>('/api/v1/ai/respond', {
      method: 'POST',
      body,
    }),
  processKnowledge: (id: string) =>
    authRequest<{ processingStatus: string }>(`/api/v1/knowledge/${id}/process`, {
      method: 'POST',
      body: {},
    }),
  deleteKnowledge: (id: string) => authRequest(`/api/v1/knowledge/${id}`, { method: 'DELETE' }),

  // Staff
  listUsers: () => authRequest<StaffUser[]>('/api/v1/users'),
  createUser: (body: { email: string; name: string; password: string; roleName?: string }) =>
    authRequest<StaffUser>('/api/v1/users', { method: 'POST', body }),
  updateUser: (id: string, body: Record<string, unknown>) =>
    authRequest<StaffUser>(`/api/v1/users/${id}`, { method: 'PATCH', body }),
  listRoles: () => authRequest<Role[]>('/api/v1/roles'),

  // Configuration
  getAssistantConfig: () => authRequest<AssistantConfig>('/api/v1/assist'),
  patchAssistantConfig: (body: Partial<AssistantConfig>) =>
    authRequest<AssistantConfig>('/api/v1/assist', { method: 'PATCH', body }),
  getOrgSettings: () => authRequest<OrgSettings>('/api/v1/organizations/settings'),
  patchOrgSettings: (body: Partial<OrgSettings>) =>
    authRequest<OrgSettings>('/api/v1/organizations/settings', { method: 'PATCH', body }),

  // Reports
  getEnquiryReport: (days = 30) =>
    authRequest<EnquiryReport>(`/api/v1/reports/enquiries?days=${days}`),
  listReportSchedules: () =>
    authRequest<{ items: ReportSchedule[] }>('/api/v1/reports/schedules'),
  createReportSchedule: (body: { frequency: string; recipients: string[] }) =>
    authRequest<ReportSchedule>('/api/v1/reports/schedules', { method: 'POST', body }),
  deleteReportSchedule: (id: string) =>
    authRequest(`/api/v1/reports/schedules/${id}`, { method: 'DELETE' }),
  getBillingSummary: () => authRequest<BillingSummary>('/api/v1/billing/summary'),

  // Account
  listMySessions: () => authRequest<{ items: MeSession[] }>('/api/v1/me/sessions'),
  revokeSession: (id: string) => authRequest(`/api/v1/me/sessions/${id}`, { method: 'DELETE' }),
  getMyPreferences: () => authRequest<MePreferences>('/api/v1/me/preferences'),
  patchMyPreferences: (body: Partial<MePreferences>) =>
    authRequest<MePreferences>('/api/v1/me/preferences', { method: 'PATCH', body }),
  exportMyData: () => authRequest<Record<string, unknown>>('/api/v1/me/export'),
  listAuditEvents: (limit = 50) =>
    authRequest<{ items: AuditEventRow[] }>(`/api/v1/audit/events?limit=${limit}`),
};
