import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const GOTO: Record<string, string> = {
  d: '/dashboard',
  c: '/dashboard/assist/conversations',
  h: '/dashboard/assist/handoffs',
  l: '/dashboard/assist/leads',
  a: '/dashboard/assist/appointments',
  k: '/dashboard/assist/knowledge',
  r: '/dashboard/assist/reports',
  s: '/dashboard/assist/settings',
  t: '/dashboard/team',
};

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function useShortcuts(handlers: {
  onPalette: () => void;
  onCheatsheet: () => void;
  onToggleSidebar: () => void;
}) {
  const navigate = useNavigate();
  const pendingG = useRef<number | null>(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlersRef.current.onPalette();
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '?') {
        handlersRef.current.onCheatsheet();
        return;
      }
      if (e.key === '[') {
        handlersRef.current.onToggleSidebar();
        return;
      }
      if (e.key === 'g') {
        pendingG.current = window.setTimeout(() => (pendingG.current = null), 800);
        return;
      }
      if (pendingG.current) {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        const to = GOTO[e.key.toLowerCase()];
        if (to) navigate(to);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
}
