import { useEffect } from 'react';

const BASE = 'WymNet AI';

export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : BASE;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    if (meta && description) meta.setAttribute('content', description);
    return () => {
      if (meta && prevDesc) meta.setAttribute('content', prevDesc);
    };
  }, [title, description]);
}
