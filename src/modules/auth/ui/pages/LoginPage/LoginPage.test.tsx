// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('../../../application/mutations', () => ({
  useLoginMutation: () => ({ mutateAsync: vi.fn() }),
}));

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
});
