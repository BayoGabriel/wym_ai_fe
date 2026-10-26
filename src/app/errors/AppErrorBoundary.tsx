import { Component } from 'react';
import type { ReactNode } from 'react';
import { ButtonLink } from '../../shared/components/Button';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container">
        <div className="state-box" role="alert" style={{ padding: 'var(--space-12)' }}>
          <h2>Something went wrong</h2>
          <p className="muted">
            An unexpected error occurred. Try reloading the page — if it keeps happening, contact
            support.
          </p>
          <ButtonLink to="/">Back to home</ButtonLink>
        </div>
      </div>
    );
  }
}
