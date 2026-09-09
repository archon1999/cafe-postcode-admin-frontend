// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authStore } from '../../domain/stores/authentication.store';

import { AdminAuthOverlays } from './AdminAuthOverlays';

const theme = createTheme();

function renderOverlays() {
  return render(
    <ThemeProvider theme={theme}>
      <AdminAuthOverlays />
    </ThemeProvider>,
  );
}

const mocks = vi.hoisted(() => ({
  bootstrap: vi.fn(),
  logout: vi.fn(),
  unlock: vi.fn(),
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

vi.mock('../../application/session-coordinator', () => ({ bootstrapAdminSession: mocks.bootstrap }));

vi.mock('../../application/mutations', () => ({
  useLogoutMutation: () => ({ mutate: mocks.logout, isPending: false }),
  useUnlockMutation: () => ({ mutate: mocks.unlock, isPending: false }),
}));

beforeEach(() => {
  mocks.logout.mockReset();
  mocks.unlock.mockReset();
  authStore.getState().logout();
});

afterEach(() => {
  cleanup();
});

describe('AdminAuthOverlays', () => {
  it('renders a full lock screen and requires a password unlock request', () => {
    authStore.getState().markLocked('2026-08-16T20:00:00Z');
    renderOverlays();

    expect(screen.getByText('lock.title')).toBeVisible();
    const password = screen.getByTestId('admin-unlock-password');
    fireEvent.change(password, { target: { value: 'current-password' } });
    fireEvent.click(screen.getByText('lock.unlock'));

    expect(mocks.unlock).toHaveBeenCalledWith('current-password');
  });

  it('does not render an MFA step-up dialog', () => {
    authStore.getState().setAccessToken('access-token');
    renderOverlays();
    expect(screen.queryByTestId('admin-step-up-code')).not.toBeInTheDocument();
  });
});

it('shows a retry action when bootstrap cannot reach the server', () => {
  authStore.setState({ isBootstrapping: true, bootstrapError: true });
  renderOverlays();
  expect(screen.getByText('connection.error')).toBeVisible();
  fireEvent.click(screen.getByText('connection.retry'));
  expect(mocks.bootstrap).toHaveBeenCalledTimes(1);
  expect(authStore.getState().isAuthenticated).toBe(false);
});
