import { authRequest } from '../../shared/api/api-client';
import type { Paged } from '../assist/api/assist-api';

export type FlowField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  required?: boolean;
  options?: string[];
};

export type FlowStep = { name: string; description?: string };

export type FlowDefinition = {
  id: string;
  name: string;
  description: string | null;
  fields: FlowField[];
  steps: FlowStep[];
  active: boolean;
  createdAt: string;
};

export type FlowInstance = {
  id: string;
  definitionId: string;
  title: string;
  status: 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  currentStep: number;
  data: Record<string, unknown>;
  documents: { filename: string }[];
  submittedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FlowTask = {
  id: string;
  instanceId: string;
  stepIndex: number;
  title: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  outcome: 'NONE' | 'APPROVED' | 'REJECTED';
  assignedTo: string | null;
  dueAt: string | null;
  completedAt: string | null;
  completedBy: string | null;
  decisionNote: string | null;
  createdAt: string;
};

export type FlowActivity = {
  id: string;
  action: string;
  detail: Record<string, unknown> | null;
  actorUserId: string | null;
  createdAt: string;
};

export type InstanceDetail = {
  instance: FlowInstance;
  definition: FlowDefinition;
  tasks: FlowTask[];
  activities: FlowActivity[];
};

export const flowApi = {
  listDefinitions: () => authRequest<{ items: FlowDefinition[] }>('/api/v1/flow/definitions'),
  getDefinition: (id: string) => authRequest<FlowDefinition>(`/api/v1/flow/definitions/${id}`),
  createDefinition: (body: {
    name: string;
    description?: string;
    fields: FlowField[];
    steps: FlowStep[];
    active: boolean;
  }) => authRequest<FlowDefinition>('/api/v1/flow/definitions', { method: 'POST', body }),
  updateDefinition: (id: string, body: Partial<FlowDefinition>) =>
    authRequest<FlowDefinition>(`/api/v1/flow/definitions/${id}`, { method: 'PATCH', body }),

  submitInstance: (body: {
    definitionId: string;
    title: string;
    data: Record<string, unknown>;
    documents?: { filename: string; contentBase64: string }[];
  }) => authRequest<FlowInstance>('/api/v1/flow/instances', { method: 'POST', body }),
  listInstances: (params: { status?: string; definitionId?: string; page?: number } = {}) =>
    authRequest<Paged<FlowInstance>>(
      `/api/v1/flow/instances?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
        )
      ).toString()}`
    ),
  getInstance: (id: string) => authRequest<InstanceDetail>(`/api/v1/flow/instances/${id}`),
  cancelInstance: (id: string) =>
    authRequest<void>(`/api/v1/flow/instances/${id}/cancel`, { method: 'POST' }),

  listTasks: (params: { mine?: boolean; status?: string } = {}) =>
    authRequest<Paged<FlowTask>>(
      `/api/v1/flow/tasks?${new URLSearchParams(
        Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
      ).toString()}`
    ),
  decideTask: (id: string, approve: boolean, note?: string) =>
    authRequest<InstanceDetail>(`/api/v1/flow/tasks/${id}/${approve ? 'approve' : 'reject'}`, {
      method: 'POST',
      body: { note },
    }),
  assignTask: (id: string, assignedTo: string | null) =>
    authRequest<void>(`/api/v1/flow/tasks/${id}/assign`, { method: 'POST', body: { assignedTo } }),
};
