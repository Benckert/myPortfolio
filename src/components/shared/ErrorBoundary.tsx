import { Component, type ReactNode } from 'react';

interface Props {
  /** Rendered when a child throws (e.g. a lazy chunk fails to load on a flaky
   *  connection). Defaults to nothing — degrade silently. */
  fallback?: ReactNode;
  children: ReactNode;
}

/** Minimal error boundary for optional UI (lazy overlays, decorative WebGL).
 *  Remounting it (e.g. via conditional render) resets the error state, so a
 *  failed chunk is retried the next time the feature is opened. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
