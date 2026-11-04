import { authRequest } from '../../shared/api/api-client';
import type { Paged } from '../assist/api/assist-api';

export type ColumnProfile = {
  name: string;
  type: 'number' | 'date' | 'boolean' | 'text';
  nonNull: number;
  nulls: number;
  distinct: number;
  min?: number;
  max?: number;
  mean?: number;
  sum?: number;
  topValues?: { value: string; count: number }[];
};

export type Trend = {
  dateColumn: string;
  valueColumn: string;
  points: { period: string; total: number }[];
  direction: 'up' | 'down' | 'flat';
  growthPct: number | null;
  forecast: { period: string; predicted: number }[];
};

export type Dataset = {
  id: string;
  name: string;
  filename: string;
  format: 'csv' | 'xlsx';
  status: 'UPLOADED' | 'PROCESSED' | 'FAILED';
  rowCount: number;
  profile: ColumnProfile[] | null;
  error: string | null;
  createdAt: string;
  rows?: Record<string, string>[];
};

export type InsightReport = {
  id: string;
  datasetId: string;
  title: string;
  summary: string | null;
  analysis: {
    rowCount: number;
    columns: ColumnProfile[];
    kpis: { label: string; value: string }[];
    trends: Trend[];
  };
  createdAt: string;
};

export const insightApi = {
  uploadDataset: (body: { name: string; filename: string; contentBase64: string }) =>
    authRequest<Dataset>('/api/v1/insight/datasets', { method: 'POST', body }),
  listDatasets: (page = 1) =>
    authRequest<Paged<Dataset>>(`/api/v1/insight/datasets?page=${page}&limit=20`),
  getDataset: (id: string) => authRequest<Dataset>(`/api/v1/insight/datasets/${id}`),
  deleteDataset: (id: string) =>
    authRequest<void>(`/api/v1/insight/datasets/${id}`, { method: 'DELETE' }),
  analyzeDataset: (id: string) =>
    authRequest<InsightReport>(`/api/v1/insight/datasets/${id}/analyze`, { method: 'POST' }),
  listReports: (datasetId?: string) =>
    authRequest<Paged<InsightReport>>(
      `/api/v1/insight/reports?limit=50${datasetId ? `&datasetId=${datasetId}` : ''}`
    ),
  getReport: (id: string) => authRequest<InsightReport>(`/api/v1/insight/reports/${id}`),
};
