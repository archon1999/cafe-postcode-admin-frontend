/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminSessionUser } from 'shared/api/admin-types';

import { useAuthStore } from '../domain/stores/authentication.store';
import { currentUserStore, useCurrentUserStore } from '../domain/stores/current-user.store';

import { useAuthBootstrap } from './use-auth-bootstrap';

const syncCurrentUserMock = vi.fn();

vi.mock('./current-user', () => ({
  syncCurrentUser: (...args: unknown[]) => syncCurrentUserMock(...args),
}));

vi.mock('@mui/x-data-grid', () => ({
  gridClasses: new Proxy(
    {},
    {
      get: (_target, property) => String(property),
    },
  ),
}));

function TestBootstrap() {
  useAuthBootstrap();

  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profile = useCurrentUserStore((state) => state.currentUser);

  return (
    <div>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <span data-testid="is-bootstrapping">{String(isBootstrapping)}</span>
      <span data-testid="profile-id">{profile?.id ?? 'none'}</span>
    </div>
  );
}

function buildProfile(overrides: Partial<AdminSessionUser> = {}): AdminSessionUser {
  return {
    id: 'user-1',
    username: 'owner01',
    fullName: 'Test User',
    phone: '+998901234567',
    isActive: true,
    isSuperuser: false,
    businessPartnerId: null,
    restaurantId: null,
    role: null,
    permissionCodes: [],
    ...overrides,
  } as AdminSessionUser;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useAuthStore.setState({ isAuthenticated: false, isLoading: false, isBootstrapping: false });
  currentUserStore.getState().clearCurrentUser();
});

beforeEach(() => {
  useAuthStore.setState({ isAuthenticated: false, isLoading: false, isBootstrapping: false });
  currentUserStore.getState().clearCurrentUser();
});

describe('useAuthBootstrap', () => {
  it('does not call auth/me when there is no active session', () => {
    render(<TestBootstrap />);

    expect(syncCurrentUserMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('is-bootstrapping')).toHaveTextContent('false');
  });

  it('hydrates current user on app bootstrap when session exists', async () => {
    const profile = buildProfile();

    syncCurrentUserMock.mockImplementation(async () => {
      currentUserStore.getState().setCurrentUser(profile);
      return profile;
    });

    useAuthStore.setState({ isAuthenticated: true, isLoading: false, isBootstrapping: true });

    render(<TestBootstrap />);

    await waitFor(() => {
      expect(syncCurrentUserMock).toHaveBeenCalledWith({ logoutOnError: true });
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-bootstrapping')).toHaveTextContent('false');
      expect(screen.getByTestId('profile-id')).toHaveTextContent(profile.id);
    });
  });

  it('does not issue duplicate auth/me calls under StrictMode remount', async () => {
    const profile = buildProfile();

    syncCurrentUserMock.mockResolvedValue(profile);
    useAuthStore.setState({ isAuthenticated: true, isLoading: false, isBootstrapping: true });

    render(
      <StrictMode>
        <TestBootstrap />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(syncCurrentUserMock).toHaveBeenCalledTimes(1);
    });
  });

  it('ends bootstrap after auth/me failure and keeps auth state cleared by logout flow', async () => {
    syncCurrentUserMock.mockImplementation(async () => {
      useAuthStore.setState({ isAuthenticated: false, isLoading: false, isBootstrapping: false });
      currentUserStore.getState().clearCurrentUser();
      throw new Error('Unauthorized');
    });

    useAuthStore.setState({ isAuthenticated: true, isLoading: false, isBootstrapping: true });

    render(<TestBootstrap />);

    await waitFor(() => {
      expect(syncCurrentUserMock).toHaveBeenCalledWith({ logoutOnError: true });
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-bootstrapping')).toHaveTextContent('false');
      expect(screen.getByTestId('profile-id')).toHaveTextContent('none');
    });
  });

  it('overwrites stale stored profile with fresh auth/me data', async () => {
    const staleProfile = buildProfile({ id: 'stale-user' });
    const freshProfile = buildProfile({ id: 'fresh-user', fullName: 'Fresh User' });

    currentUserStore.getState().setCurrentUser(staleProfile);
    syncCurrentUserMock.mockImplementation(async () => {
      currentUserStore.getState().setCurrentUser(freshProfile);
      return freshProfile;
    });

    useAuthStore.setState({ isAuthenticated: true, isLoading: false, isBootstrapping: true });

    render(<TestBootstrap />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-id')).toHaveTextContent(freshProfile.id);
      expect(screen.getByTestId('is-bootstrapping')).toHaveTextContent('false');
    });
  });
});
