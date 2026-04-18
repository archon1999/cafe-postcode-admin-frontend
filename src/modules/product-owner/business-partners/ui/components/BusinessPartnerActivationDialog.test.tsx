/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
    currentLang: { value: 'uz' },
  }),
}));

import { BusinessPartnerActivationDialogContent } from './BusinessPartnerActivationDialog';

afterEach(() => {
  cleanup();
});

describe('BusinessPartnerActivationDialogContent', () => {
  it('prefills defaults and submits edited credentials', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <BusinessPartnerActivationDialogContent
        open
        defaults={{ username: 'bh-100', password: 'secret-100' }}
        isLoadingDefaults={false}
        isSubmitting={false}
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    );

    const usernameInput = screen.getByLabelText('fields.username');
    const passwordInput = screen.getByLabelText('fields.password');

    expect(usernameInput).toHaveValue('bh-100');
    expect(passwordInput).toHaveValue('secret-100');

    fireEvent.change(usernameInput, { target: { value: ' manual-login ' } });
    fireEvent.change(passwordInput, { target: { value: 'manual-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'actions.activate' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'manual-login',
        password: 'manual-pass',
      });
    });
  });
});
