import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assistQueries } from '../../features/assist/queries';
import { useAuth } from '../../app/providers/auth-context';
import { useCan } from '../auth/use-permission';
import { deriveTenantAccent } from './accent';
import { resolvedTheme, usePrefs } from '../prefs/prefs';

const VARS = ['--tenant-accent', '--tenant-accent-strong', '--tenant-accent-soft', '--tenant-accent-text'];

/**
 * Pushes the organization's brand colour into --tenant-* CSS vars.
 * The dashboard maps accent-driven styles to these vars, so each tenant's
 * colour propagates through their shell; unconfigured orgs keep WymNet green.
 */
export function useTenantAccent() {
  const { user } = useAuth();
  const [prefs] = usePrefs();
  const canRead = useCan('organization.read');
  const dark = resolvedTheme(prefs.theme) === 'dark';

  const settings = useQuery({
    ...assistQueries.settings,
    enabled: !!user?.organizationId && canRead,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const root = document.documentElement;
    const hex = settings.data?.primaryColor;
    const accent = hex ? deriveTenantAccent(hex, dark) : null;
    if (!accent) {
      for (const v of VARS) root.style.removeProperty(v);
      return;
    }
    root.style.setProperty('--tenant-accent', accent.accent);
    root.style.setProperty('--tenant-accent-strong', accent.strong);
    root.style.setProperty('--tenant-accent-soft', accent.soft);
    root.style.setProperty('--tenant-accent-text', accent.text);
    return () => {
      for (const v of VARS) root.style.removeProperty(v);
    };
  }, [settings.data?.primaryColor, dark]);
}
