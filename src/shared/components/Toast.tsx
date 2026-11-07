import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { ToastContext, type ToastInput, type ToastRecord, type ToastKind } from './toast-context';
import './Toast.css';

const ICONS: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 size={17} />,
  error: <XCircle size={17} />,
  warning: <AlertTriangle size={17} />,
  info: <Info size={17} />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 160);
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = ++idRef.current;
      const toast: ToastRecord = { kind: 'info', ...input, duration: input.duration ?? 4500, id };
      setToasts((ts) => [...ts.slice(-3), toast]);
      if (toast.duration! > 0) setTimeout(() => dismiss(id), toast.duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast--${t.kind}${t.leaving ? ' toast--leaving' : ''}`}
            role={t.kind === 'error' ? 'alert' : 'status'}
          >
            <span className="toast__icon">{ICONS[t.kind]}</span>
            <div className="toast__body">
              <div className="toast__title">{t.title}</div>
              {t.description && <div className="toast__desc">{t.description}</div>}
            </div>
            {t.action && (
              <button
                className="toast__action"
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button className="toast__close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
