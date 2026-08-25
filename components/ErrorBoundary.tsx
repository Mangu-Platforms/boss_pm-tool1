"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="error-card">
            <strong>Something went wrong</strong>
            <p>{this.state.error.message}</p>
            <button onClick={() => this.setState({ error: null })}>Retry</button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
