import { assistApi } from './api/assist-api';

export const assistKeys = {
  conversations: (status?: string, page = 1) => ['conversations', status ?? 'all', page] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (id: string) => ['conversation', id, 'messages'] as const,
  leads: (status?: string, page = 1) => ['leads', status ?? 'all', page] as const,
  lead: (id: string) => ['lead', id] as const,
  handoffs: (status?: string, page = 1) => ['handoffs', status ?? 'all', page] as const,
  handoff: (id: string) => ['handoff', id] as const,
  appointments: (status?: string, page = 1) => ['appointments', status ?? 'all', page] as const,
  knowledge: (filters: Record<string, string | undefined>) => ['knowledge', filters] as const,
  users: ['users'] as const,
  roles: ['roles'] as const,
  config: ['assist-config'] as const,
  settings: ['org-settings'] as const,
  report: (days: number) => ['report', 'enquiries', days] as const,
};

export const assistQueries = {
  conversations: (status?: string, page = 1) => ({
    queryKey: assistKeys.conversations(status, page),
    queryFn: () => assistApi.listConversations({ status, page }),
  }),
  messages: (id: string) => ({
    queryKey: assistKeys.messages(id),
    queryFn: () => assistApi.listMessages(id),
    refetchInterval: 8000,
  }),
  leads: (status?: string, page = 1) => ({
    queryKey: assistKeys.leads(status, page),
    queryFn: () => assistApi.listLeads({ status, page }),
  }),
  lead: (id: string) => ({
    queryKey: assistKeys.lead(id),
    queryFn: () => assistApi.getLead(id),
  }),
  handoffs: (status?: string, page = 1) => ({
    queryKey: assistKeys.handoffs(status, page),
    queryFn: () => assistApi.listHandoffs({ status, page }),
  }),
  handoff: (id: string) => ({
    queryKey: assistKeys.handoff(id),
    queryFn: () => assistApi.getHandoff(id),
    refetchInterval: 8000,
  }),
  appointments: (status?: string, page = 1) => ({
    queryKey: assistKeys.appointments(status, page),
    queryFn: () => assistApi.listAppointments({ status, page }),
  }),
  knowledge: (filters: Record<string, string | undefined>) => ({
    queryKey: assistKeys.knowledge(filters),
    queryFn: () => assistApi.listKnowledge(filters),
  }),
  users: { queryKey: assistKeys.users, queryFn: () => assistApi.listUsers() },
  roles: { queryKey: assistKeys.roles, queryFn: () => assistApi.listRoles() },
  config: { queryKey: assistKeys.config, queryFn: () => assistApi.getAssistantConfig() },
  settings: { queryKey: assistKeys.settings, queryFn: () => assistApi.getOrgSettings() },
  report: (days: number) => ({
    queryKey: assistKeys.report(days),
    queryFn: () => assistApi.getEnquiryReport(days),
  }),
};
