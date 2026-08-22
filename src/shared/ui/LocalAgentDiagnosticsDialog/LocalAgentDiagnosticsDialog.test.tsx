/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

import { LocalAgentDiagnosticsDialog, type LocalAgentDiagnosticsData } from './LocalAgentDiagnosticsDialog';

const diagnostics: LocalAgentDiagnosticsData = {
  agent: { online: true, version: '1.1.0' },
  backend: { online: true },
  sync: {
    pendingOutbox: 0,
    failedOutbox: 1,
    actionRequiredOutbox: 1,
    quarantinedOutbox: 0,
    resolvedOutbox: 4,
    actionRequiredOperations: [
      {
        operationId: 'payment-operation',
        path: '/api/v1/pos/billing/orders/order-1/pay/',
        lastError: 'Order is already closed.',
        responseStatus: 400,
        errorCode: 'MUTATION_HTTP_400',
        resolutionHint: 'Review the payment, then retry or resolve it.',
      },
    ],
    quarantinedOperations: [],
  },
  fiscal: { configured: false, online: false },
  marta: { configured: false, online: false },
  printer: { configured: false, online: false },
};

afterEach(() => cleanup());

describe('LocalAgentDiagnosticsDialog outbox lifecycle', () => {
  it('requires an audit reason before requesting a manual retry', async () => {
    const onOutboxAction = vi.fn().mockResolvedValue(undefined);
    render(
      <LocalAgentDiagnosticsDialog
        open
        onClose={() => {}}
        diagnostics={diagnostics}
        canManageOutbox
        onOutboxAction={onOutboxAction}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText('Order is already closed.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'setup.agentMonitoring.outbox.retry' }));

    const actionDialog = screen.getByRole('dialog', { name: 'setup.agentMonitoring.outbox.retryTitle' });
    const confirm = within(actionDialog).getByRole('button', { name: 'setup.agentMonitoring.outbox.retry' });
    expect(confirm).toBeDisabled();

    fireEvent.change(within(actionDialog).getByRole('textbox', { name: /setup\.agentMonitoring\.outbox\.reason/ }), {
      target: { value: 'Cashier corrected the amount.' },
    });
    fireEvent.click(confirm);

    await waitFor(() =>
      expect(onOutboxAction).toHaveBeenCalledWith('payment-operation', 'retry', 'Cashier corrected the amount.'),
    );
  });

  it('allows resolving without an audit reason', async () => {
    const onOutboxAction = vi.fn().mockResolvedValue(undefined);
    render(
      <LocalAgentDiagnosticsDialog
        open
        onClose={() => {}}
        diagnostics={diagnostics}
        canManageOutbox
        onOutboxAction={onOutboxAction}
        onRefresh={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'setup.agentMonitoring.outbox.resolve' }));

    const actionDialog = screen.getByRole('dialog', { name: 'setup.agentMonitoring.outbox.resolveTitle' });
    const confirm = within(actionDialog).getByRole('button', { name: 'setup.agentMonitoring.outbox.resolve' });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);

    await waitFor(() => expect(onOutboxAction).toHaveBeenCalledWith('payment-operation', 'resolve', ''));
  });
});
