import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';
export type ToastInput = {
  title: string;
  description?: string;
  kind?: ToastKind;
  duration?: number;
  action?: { label: string; onClick: () => void };
};

export type ToastRecord = ToastInput & { id: number; kind: ToastKind; leaving?: boolean };
export type ToastIconMap = Record<ToastKind, ReactNode>;

export const ToastContext = createContext<(t: ToastInput) => number>(() => 0);
export const useToast = () => useContext(ToastContext);
