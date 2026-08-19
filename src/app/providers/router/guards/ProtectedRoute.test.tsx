// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authStore, currentUserStore } from 'modules/auth';

import { ProtectedRoute } from './ProtectedRoute';

vi.mock('@mui/x-data-grid', () => ({
  gridClasses: new Proxy({}, { get: (_target, property) => String(property) }),
}));

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{`${location.pathname}${location.search}${location.hash}`}</span>;
}

beforeEach(() => {
  currentUserStore.getState().clearCurrentUser();
  authStore.setState({
    status: 'anonymous',
    isAuthenticated: false,
    isBootstrapping: false,
    isLoading: false,
  });
});

describe('ProtectedRoute pairing redirect', () => {
  it('keeps the claim token in the fragment and puts only /pair in returnTo', async () => {
    render(
      <MemoryRouter initialEntries={['/pair#v=1&pairingId=device-id&claimToken=secret']}>
        <Routes>
          <Route path="/auth/login" element={<LocationProbe />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/auth/login?returnTo=%2Fpair#v=1&pairingId=device-id&claimToken=secret',
    );
  });

  it('does not cover the global lock overlay with a protected-route splash screen', () => {
    authStore.setState({
      status: 'locked',
      isAuthenticated: true,
      isBootstrapping: false,
      isLoading: false,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div>protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });
});
