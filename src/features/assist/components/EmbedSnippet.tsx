import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authRequest } from '../../../shared/api/api-client';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { useOrgContext } from '../../organizations/queries/use-org-context';
import { env } from '../../../shared/config/env';

export function EmbedSnippet() {
  const org = useOrgContext();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const o = org.status === 'ready' ? org.organization : null;

  const rotate = useMutation({
    mutationFn: () =>
      authRequest<{ publicKey: string }>(`/api/v1/organizations/${o?.id}/widget-key/rotate`, {
        method: 'POST',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization'] }),
  });

  const key = o?.publicKey ?? o?.slug ?? null;
  const attr = o?.publicKey ? 'data-key' : 'data-org';
  const snippet = key
    ? `<script src="${env.VITE_API_BASE_URL.replace(/\/$/, '')}/widget/wymassist.js"\n  ${attr}="${key}"\n  data-api="${env.VITE_API_BASE_URL}"\n  async></script>`
    : '';

  return (
    <section className="card">
      <div className="card-head">
        <h2>Website embed</h2>
        {copied && <span className="card-note">Copied</span>}
      </div>
      {key ? (
        <>
          <p className="muted">
            Paste this before <code>&lt;/body&gt;</code> on your website. Restrict where it can run
            with allowed origins on the Behavior tab.
          </p>
          <pre
            className="mono"
            style={{
              background: '#f2f5f2',
              padding: 'var(--space-3)',
              borderRadius: '6px',
              overflow: 'auto',
            }}
          >
            {snippet}
          </pre>
          <div className="pill-list" style={{ marginTop: 'var(--space-3)' }}>
            <button
              className="pill"
              onClick={() =>
                void navigator.clipboard.writeText(snippet).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                })
              }
            >
              Copy snippet
            </button>
            <Button
              variant="secondary"
              loading={rotate.isPending}
              onClick={() => {
                if (window.confirm('Rotating the key breaks every existing embed until you update the snippet. Continue?')) {
                  rotate.mutate();
                }
              }}
            >
              Rotate key
            </Button>
          </div>
          {rotate.isError && <Alert kind="error">{rotate.error.message}</Alert>}
          <p className="faint small" style={{ marginBottom: 0 }}>
            The key is public but unguessable — rotate it if a snippet leaks to a site you don't
            control. Old keys stop working immediately.
          </p>
        </>
      ) : (
        <p className="muted">An organization is required before the embed code can be generated.</p>
      )}
    </section>
  );
}
