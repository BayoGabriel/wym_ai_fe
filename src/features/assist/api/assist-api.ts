import { authRequest } from '../../../shared/api/api-client';

export type Paged<T> = { items: T[]; page: number; limit: number; total: number };

export type Conversation = {
  id: string;
  title: string | null;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  channel: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'AGENT';
  content: string;
  createdAt: string;
  grounded?: boolean;
  sources?: unknown[];
};

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
  createdAt: string;
};

export type StaffUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
  createdAt: string;
};

export type Role = { id: string; name: string; scope: 'platform' | 'organization' };

export type AssistantConfig = {
  assistantName?: string | null;
  welcomeMessage?: string | null;
  tone?: string | null;
  operatingHours?: string | null;
  escalationEnabled?: boolean;
  leadCaptureEnabled?: boolean;
  appointmentRequestsEnabled?: boolean;
  publicChatEnabled?: boolean;
  allowedOrigins?: string[];
  intakeFields?: IntakeField[] | null;
  notificationEmail?: string | null;
  notifyOnLead?: boolean;
  notifyOnHandoff?: boolean;
  notifyOnAppointment?: boolean;
};

export type IntakeField = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required?: boolean;
  options?: string[];
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
  conversations: { total: number };
  messages: { total: number; daily: { date: string; count: number }[] };
  leads: {
    total: number;
    byStatus: { status: string; count: number }[];
    byCategory: { category: string; count: number }[];
  };
  handoffs: { total: number; open: number; byStatus: { status: string; count: number }[] };
  appointments: { total: number; byStatus: { status: string; count: number }[] };
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
  listConversations: (params: { status?: string; page?: number; limit?: number } = {}) =>
    authRequest<Paged<Conversation>>(`/api/v1/conversations${q(params)}`),
  getConversation: (id: string) => authRequest<Conversation>(`/api/v1/conversations/${id}`),
  listMessages: (id: string) =>
    authRequest<Paged<Message>>(`/api/v1/conversations/${id}/messages?limit=100`),
  updateConversation: (id: string, body: { status?: string; title?: string }) =>
    authRequest<Conversation>(`/api/v1/conversations/${id}`, { method: 'PATCH', body }),

  // Leads
  listLeads: (params: { status?: string; page?: number } = {}) =>
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
  processKnowledge: (id: string) =>
    authRequest(`/api/v1/knowledge/${id}/process`, { method: 'POST' }),
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
};
