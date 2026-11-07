import { useEffect, useSyncExternalStore } from 'react';

/* --------------------------------------------------------------------------
   UI preferences — persisted per user in localStorage behind one abstraction.
   Base key holds device-level prefs (theme/density needed pre-auth for
   FOUC-free paint); a per-user key layers on top once the session resolves.
   If a server-side preferences table lands later, only this module changes.
   -------------------------------------------------------------------------- */

export type ThemePref = 'system' | 'light' | 'dark';
export type DensityPref = 'comfortable' | 'compact';

export type WidgetLayoutPref = { order: string[]; hidden: string[] };
export type SavedView = {
  name: string;
  filters: Record<string, string>;
  columns?: string[];
};

export type Prefs = {
  theme: ThemePref;
  density: DensityPref;
  sidebarCollapsed: boolean;
  /** Per-page saved views: viewKey -> saved views */
  savedViews: Record<string, SavedView[]>;
  /** Active saved view per page: viewKey -> view name */
  activeViews: Record<string, string>;
  /** Overview dashboard widget layout */
  dashboardLayout: WidgetLayoutPref | null;
  /** Visible column keys per DataTable persistKey */
  tableColumns: Record<string, string[]>;
};

export const DEFAULT_PREFS: Prefs = {
  theme: 'system',
  density: 'comfortable',
  sidebarCollapsed: false,
  savedViews: {},
  activeViews: {},
  dashboardLayout: null,
  tableColumns: {},
};

const BASE_KEY = 'wymnet:prefs';
const userKey = (id: string) => `wymnet:prefs:${id}`;

let currentUserId: string | null = null;
let state: Prefs = loadPrefs();
const listeners = new Set<() => void>();

function readJson(key: string): Partial<Prefs> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<Prefs>) : {};
  } catch {
    return {};
  }
}

function loadPrefs(): Prefs {
  const base = readJson(BASE_KEY);
  const user = currentUserId ? readJson(userKey(currentUserId)) : {};
  return { ...DEFAULT_PREFS, ...base, ...user };
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(key: string, patch: Partial<Prefs>) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...readJson(key), ...patch }));
  } catch {
    // storage full/blocked — preferences are best-effort
  }
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  state = { ...state, [key]: value };
  // theme & density also live at device level so pre-auth pages (and the
  // index.html boot script) can resolve them before a user is known.
  if (key === 'theme' || key === 'density') persist(BASE_KEY, { [key]: value });
  if (currentUserId) persist(userKey(currentUserId), { [key]: value });
  else persist(BASE_KEY, { [key]: value });
  emit();
}

/** Called by the auth layer once the signed-in user is known (or cleared). */
export function initUserPrefs(userId: string | null) {
  if (currentUserId === userId) return;
  currentUserId = userId;
  state = loadPrefs();
  emit();
}

export function getPrefs(): Prefs {
  return state;
}

export function usePrefs(): [Prefs, typeof setPref] {
  const prefs = useSyncExternalStore(subscribe, () => state);
  return [prefs, setPref];
}

export function resolvedTheme(theme: ThemePref): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Forces light theme — marketing, auth and error pages never go dark.
 *  Covers the redirect case where the boot script painted /dashboard dark
 *  before auth resolved and routed the user back out of the shell. */
export function useLightTheme() {
  useEffect(() => {
    document.documentElement.dataset.theme = 'light';
  }, []);
}

/** Applies theme/density to <html> and tracks OS scheme for 'system'.
 *  Mounted only inside the app shell — marketing and auth pages always
 *  render light, so leaving the shell resets the theme attribute. */
export function useApplyPrefs() {
  const [prefs] = usePrefs();
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = resolvedTheme(prefs.theme);
      root.dataset.density = prefs.density;
    };
    apply();
    if (typeof window.matchMedia !== 'function') {
      return () => {
        root.dataset.theme = 'light';
      };
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      root.dataset.theme = 'light';
    };
  }, [prefs.theme, prefs.density]);
}
