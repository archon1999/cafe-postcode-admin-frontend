// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  revoke: vi.fn(),
  subscription: {
    id: 'subscription-1',
    telegramUserId: '123456',
    username: 'operator',
    firstName: 'Operator',
    restaurantId: 'restaurant-1',
    restaurantName: 'Branch One',
    notificationsEnabled: true,
    linkedAt: '2026-08-22T10:00:00.000Z',
  },
}));

vi.mock('app/providers/locales', () => ({
  getDataGridLocaleText: () => ({}),
  useTranslate: () => ({
    t: (key: string) => key,
    currentLang: { value: 'uz', numberFormat: { code: 'uz-UZ' } },
  }),
}));

vi.mock('modules/auth', () => ({
  useAdminScopeStore: (selector: (state: { selectedRestaurantId: string }) => unknown) =>
    selector({ selectedRestaurantId: 'restaurant-1' }),
}));

vi.mock('shared/ui/Iconify', () => ({ Iconify: () => <span data-testid="revoke-icon" /> }));

vi.mock('shared/ui/CustomDataGrid', () => ({
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: Array<typeof mocks.subscription>;
    columns: Array<Record<string, unknown>>;
  }) => {
    const actionColumn = columns.find((column) => column.field === 'action');
    const renderCell = actionColumn?.renderCell as
      | ((params: { row: typeof mocks.subscription }) => ReactNode)
      | undefined;
    return (
      <div>
        {rows.map((row) => (
          <div key={row.id}>{renderCell?.({ row })}</div>
        ))}
      </div>
    );
  },
  DataGridEmptyState: () => null,
  DataGridFiltersToolbar: () => null,
}));

vi.mock('../../../../application', () => ({
  useTelegramSubscriptionsQuery: () => ({
    data: [mocks.subscription],
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useIssueTelegramLinkMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useRevokeTelegramSubscriptionMutation: () => ({ isPending: false, mutateAsync: mocks.revoke }),
}));

import { TelegramPanel } from './TelegramPanel';

afterEach(cleanup);

describe('TelegramPanel', () => {
  it('renders revoke as a tooltip-labelled icon button', () => {
    render(<TelegramPanel />);

    const revokeButton = screen.getByRole('button', { name: 'telegram.revoke' });
    expect(revokeButton).toBeVisible();
    expect(screen.getByTestId('revoke-icon')).toBeVisible();
    expect(screen.queryByText('telegram.revoke')).not.toBeInTheDocument();

    fireEvent.click(revokeButton);
    expect(screen.getByText('telegram.revokeTitle')).toBeVisible();
  });
});
