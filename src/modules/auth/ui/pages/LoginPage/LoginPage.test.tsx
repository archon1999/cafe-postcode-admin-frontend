// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from './LoginPage';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

vi.mock('shared/ui/Animate', () => ({
  AnimateLogoRotate: () => <div data-testid="login-logo" />,
}));

vi.mock('shared/ui/Iconify', () => ({
  Iconify: () => <span />,
}));

const mutationMocks = vi.hoisted(() => ({
  login: vi.fn(),
}));

vi.mock('../../../application/mutations', () => ({
  useLoginMutation: () => ({ mutateAsync: mutationMocks.login, isPending: false }),
}));

beforeEach(() => {
  Object.values(mutationMocks).forEach((mock) => mock.mockReset());
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('LoginPage', () => {
  it('keeps login fields controlled while the user types', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<LoginPage />);

    const username = screen.getByTestId('login-username');
    const password = screen.getByTestId('login-password');
    expect(username).toHaveValue('');
    expect(password).toHaveValue('');

    fireEvent.change(username, { target: { value: 'admin' } });
    fireEvent.change(password, { target: { value: 'secret' } });

    expect(username).toHaveValue('admin');
    expect(password).toHaveValue('secret');
    expect(
      consoleError.mock.calls.some((args) =>
        args.some((value) => String(value).includes('uncontrolled input to be controlled')),
      ),
    ).toBe(false);
  });

  it('submits password credentials and never renders an MFA input', async () => {
    mutationMocks.login.mockResolvedValue({
      status: 'authenticated',
    });
    render(<LoginPage />);
    fireEvent.change(screen.getByTestId('login-username'), { target: { value: 'superadmin' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(mutationMocks.login).toHaveBeenCalledWith({ username: 'superadmin', password: 'secret' });
    });
    expect(screen.queryByTestId('mfa-login-code')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mfa-enrollment-code')).not.toBeInTheDocument();
  });

  it('fails closed if a stale backend unexpectedly returns an MFA challenge', async () => {
    mutationMocks.login.mockResolvedValue({
      status: 'mfa_enrollment_required',
      challengeToken: 'enrollment-token',
      challengeExpiresAt: '2026-08-16T20:05:00Z',
    });
    render(<LoginPage />);
    fireEvent.change(screen.getByTestId('login-username'), { target: { value: 'superadmin' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByTestId('login-submit'));

    expect(await screen.findByText('loginFlow.error')).toBeVisible();
    expect(screen.queryByTestId('mfa-enrollment-qr-svg')).not.toBeInTheDocument();
  });
});
