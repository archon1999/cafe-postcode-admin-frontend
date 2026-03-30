import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import 'app/styles/index.css';

import App from 'app/App.tsx';
import { ErrorBoundary } from 'app/providers/ErrorBoundary';
import { AppRouter } from 'app/providers/router';

class RootErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundary />;
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App>
        <AppRouter />
      </App>
    </RootErrorBoundary>
  </StrictMode>,
);
