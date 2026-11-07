import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, MessagesSquare, Moon, Search, Sun, UserRound } from 'lucide-react';
import { assistApi } from '../../features/assist/api/assist-api';
import { useOrgContext } from '../../features/organizations/queries/use-org-context';
import { useAuth } from '../providers/auth-context';
import { useCan } from '../../shared/auth/use-permission';
import { usePrefs, resolvedTheme } from '../../shared/prefs/prefs';
import { NAV_ITEMS, PRODUCT_META, type ProductCode } from './nav';

function useDebounced<T>(value: T, ms = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const org = useOrgContext();
  const [prefs, setPref] = usePrefs();
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query);
  const canConv = useCan('conversation.read');
  const canLead = useCan('lead.read');

  const activeCodes = new Set(
    org.status === 'ready' ? org.products.filter((p) => p.active).map((p) => p.code) : []
  );

  const pages = NAV_ITEMS.filter((item) => {
    if (item.section === 'platform') return !!user?.platformAccess;
    if (item.section !== 'main' && item.section !== 'org' && !activeCodes.has(item.section)) return false;
    if (item.perm && !user?.permissions.includes(item.perm)) return false;
    return true;
  });

  const searching = debounced.trim().length >= 2;
  const convs = useQuery({
    queryKey: ['palette', 'conversations', debounced],
    queryFn: () => assistApi.listConversations({ q: debounced, limit: 5 }),
    enabled: open && searching && canConv,
    staleTime: 15_000,
  });
  const leads = useQuery({
    queryKey: ['palette', 'leads', debounced],
    queryFn: () => assistApi.listLeads({ q: debounced, limit: 5 }),
    enabled: open && searching && canLead,
    staleTime: 15_000,
  });

  const actions = useMemo(
    () => [
      {
        id: 'theme',
        label: `Switch to ${resolvedTheme(prefs.theme) === 'dark' ? 'light' : 'dark'} theme`,
        icon: resolvedTheme(prefs.theme) === 'dark' ? Sun : Moon,
        run: () => setPref('theme', resolvedTheme(prefs.theme) === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'overview',
        label: 'Go to Overview',
        icon: LayoutDashboard,
        run: () => navigate('/dashboard'),
      },
    ],
    [prefs.theme, navigate, setPref]
  );

  if (!open) return null;

  const go = (to: string) => {
    setQuery('');
    onClose();
    navigate(to);
  };

  return (
    <div className="palette-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Command className="palette" label="Command palette">
        <div className="palette__inputrow">
          <Search size={15} />
          <Command.Input
            className="palette__input"
            placeholder="Search pages, conversations, leads…"
            value={query}
            onValueChange={setQuery}
            autoFocus
          />
        </div>
        <Command.List className="palette__list">
          <Command.Empty className="palette__empty">
            No results{query ? ` for “${query}”` : ''}.
          </Command.Empty>
          {searching && convs.data && convs.data.items.length > 0 && (
            <Command.Group heading="Conversations" className="palette__group">
              {convs.data.items.map((c) => (
                <Command.Item
                  key={c.id}
                  value={`conv ${c.title ?? c.id}`}
                  className="palette__item"
                  onSelect={() => go(`/dashboard/assist/conversations/${c.id}`)}
                >
                  <MessagesSquare size={14} />
                  <span>{c.title ?? 'Untitled conversation'}</span>
                  <span className="palette__meta">{c.channel}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {searching && leads.data && leads.data.items.length > 0 && (
            <Command.Group heading="Leads" className="palette__group">
              {leads.data.items.map((l) => (
                <Command.Item
                  key={l.id}
                  value={`lead ${l.name ?? ''} ${l.email ?? ''}`}
                  className="palette__item"
                  onSelect={() => go('/dashboard/assist/leads')}
                >
                  <UserRound size={14} />
                  <span>{l.name ?? l.email ?? 'Unnamed lead'}</span>
                  <span className="palette__meta">{l.status}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
          <Command.Group heading="Pages" className="palette__group">
            {pages.map((item) => (
              <Command.Item
                key={item.to}
                value={`page ${item.label}`}
                className="palette__item"
                onSelect={() => go(item.to)}
              >
                <item.icon size={14} />
                <span>{item.label}</span>
                {item.section in PRODUCT_META && (
                  <span className="palette__meta">{PRODUCT_META[item.section as ProductCode].name}</span>
                )}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Actions" className="palette__group">
            {actions.map((a) => (
              <Command.Item
                key={a.id}
                value={`action ${a.label}`}
                className="palette__item"
                onSelect={() => {
                  setQuery('');
                  onClose();
                  a.run();
                }}
              >
                <a.icon size={14} />
                <span>{a.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
