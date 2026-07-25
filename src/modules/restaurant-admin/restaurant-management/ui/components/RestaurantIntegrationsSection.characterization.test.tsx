/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminIntegrationConfig } from 'shared/api/admin-types';

import { RestaurantIntegrationsSection } from './RestaurantIntegrationsSection';

const createMutationMock = vi.fn();
const deleteMutationMock = vi.fn();
const updateMutationMock = vi.fn();

let integrationRow: AdminIntegrationConfig;

vi.mock('@mui/x-data-grid', () => ({
  gridClasses: { cell: 'MuiDataGrid-cell' },
}));

vi.mock('app/providers/locales', () => ({
  getDataGridLocaleText: () => ({}),
  useTranslate: () => ({
    currentLang: { value: 'uz' },
    t: (key: string) => key,
  }),
}));

vi.mock('shared/api', () => ({
  apiClient: { checkLocalAgentPrinter: vi.fn() },
}));

vi.mock('modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('modules/auth')>()),
  useAdminRestaurantScopeId: () => 'restaurant-1',
}));

vi.mock('shared/ui/CustomDialog', () => ({
  ConfirmDialog: () => null,
}));

vi.mock('shared/ui/CustomDataGrid', () => ({
  CustomGridActionsCellItem: ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
  DataGridEmptyState: () => null,
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: AdminIntegrationConfig[];
    columns: Array<{
      field: string;
      renderCell?: (params: { row: AdminIntegrationConfig }) => ReactNode;
      getActions?: (params: { row: AdminIntegrationConfig }) => ReactNode[];
    }>;
  }) => (
    <div>
      {rows.map((row) => {
        const settingsColumn = columns.find((column) => column.field === 'settings');
        const actionsColumn = columns.find((column) => column.field === 'actions');
        return (
          <div key={row.id}>
            {settingsColumn?.renderCell?.({ row })}
            {actionsColumn?.getActions?.({ row })}
          </div>
        );
      })}
    </div>
  ),
}));

vi.mock('shared/ui/Iconify', () => ({
  Iconify: () => null,
}));

vi.mock('../../application', () => ({
  useCreateIntegrationConfigMutation: () => ({ mutateAsync: createMutationMock, isPending: false }),
  useDeleteIntegrationConfigMutation: () => ({ mutateAsync: deleteMutationMock, isPending: false }),
  useGetIntegrationConfigsListQuery: () => ({
    data: { data: [integrationRow], total: 1 },
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useUpdateIntegrationConfigMutation: () => ({ mutateAsync: updateMutationMock, isPending: false }),
}));

vi.mock('./OrganizationsGridToolbar', () => ({
  OrganizationsGridToolbar: () => null,
}));

vi.mock('./RestaurantManagementAccordion', () => ({
  RestaurantManagementAccordion: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('RestaurantIntegrationsSection settings mapping', () => {
  beforeEach(() => {
    createMutationMock.mockReset();
    deleteMutationMock.mockReset();
    updateMutationMock.mockReset();
    updateMutationMock.mockResolvedValue({});
    integrationRow = {
      id: 'marta-1',
      kind: 'payment',
      provider: 'marta-softpos',
      isEnabled: true,
      settings: {
        endpointUrl: 'http://127.0.0.1:8765',
        taxNumber: '312217845',
        timeoutSeconds: 90,
        amountMultiplier: 100,
        hmacSecret: 'legacy-secret',
        terminalId: 'legacy-terminal',
        vendor_extension: 'keep-me',
      },
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('hydrates legacy aliases and submits canonical settings while retaining unmanaged keys', async () => {
    render(<RestaurantIntegrationsSection layoutMode="page" />);

    expect(screen.getByText('MARTA: http://127.0.0.1:8765 | STIR: 312217845 | x100 | 90s')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'actions.edit' }));

    await waitFor(() => expect(screen.getByLabelText('fields.taxNumber')).toHaveValue('312217845'));
    expect(screen.getByLabelText('integrations.fields.endpointUrl')).toHaveValue('http://127.0.0.1:8765');
    expect(screen.getByLabelText('integrations.fields.timeoutSeconds')).toHaveValue('90');
    expect(screen.getByLabelText('integrations.fields.amountMultiplier')).toHaveValue('100');

    fireEvent.change(screen.getByLabelText('fields.taxNumber'), { target: { value: ' 999999999 ' } });
    fireEvent.change(screen.getByLabelText('integrations.fields.timeoutSeconds'), { target: { value: '120' } });
    fireEvent.click(screen.getByRole('button', { name: 'actions.save' }));

    await waitFor(() => expect(updateMutationMock).toHaveBeenCalledTimes(1));
    expect(updateMutationMock).toHaveBeenCalledWith({
      kind: 'payment',
      provider: 'marta-softpos',
      isEnabled: true,
      settings: {
        vendor_extension: 'keep-me',
        terminal_id: 'legacy-terminal',
        merchant_id: undefined,
        endpoint_url: 'http://127.0.0.1:8765',
        api_key: undefined,
        payment_qr_url: undefined,
        timeout_seconds: 120,
        amount_multiplier: 100,
        tax_number: '999999999',
        hmac_secret: 'legacy-secret',
      },
    });
  });
});
