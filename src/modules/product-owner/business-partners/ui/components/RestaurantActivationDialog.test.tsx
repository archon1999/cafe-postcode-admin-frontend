/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AdminPermission, AdminRole } from 'shared/api/admin-types';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

import { RestaurantActivationDialog } from './RestaurantActivationDialog';

function permission(id: string, code: string, name: string): AdminPermission {
  return {
    id,
    code,
    scope: 'admin',
    name,
    description: '',
  };
}

function systemRole(id: string, name: string, permissions: AdminPermission[]): AdminRole {
  return {
    id,
    code: id,
    name,
    description: '',
    isSystem: true,
    permissions,
  };
}

function selectOptions(fieldName: 'allowedRoleIds' | 'permissionIds', ...optionNames: string[]) {
  const combobox = document.getElementById(`mui-component-select-${fieldName}`);
  if (!combobox) {
    throw new Error(`Missing ${fieldName} select`);
  }

  fireEvent.mouseDown(combobox);

  const listbox = screen.getByRole('listbox');
  for (const optionName of optionNames) {
    fireEvent.click(within(listbox).getByRole('option', { name: optionName }));
  }

  fireEvent.keyDown(listbox, { key: 'Escape' });
}

afterEach(() => {
  cleanup();
});

describe('RestaurantActivationDialog', () => {
  it('shows custom role and permission fields when custom activation is selected', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RestaurantActivationDialog
          open
          tariffs={[]}
          roles={[
            {
              id: 'role-1',
              code: 'restaurant_admin',
              name: 'Restaurant admin',
              description: '',
              isSystem: true,
              permissions: [],
            },
          ]}
          permissions={[]}
          customTariffAllowed
          isSubmitting={false}
          onClose={() => {}}
          onSubmit={vi.fn().mockResolvedValue(undefined)}
        />
      </LocalizationProvider>,
    );

    fireEvent.click(screen.getByLabelText('labels.customActivation'));

    expect(screen.getByLabelText('fields.allowedRoles')).toBeInTheDocument();
    expect(screen.getByLabelText('fields.permissions')).toBeInTheDocument();
  });

  it('hides custom activation when custom tariff is not allowed', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RestaurantActivationDialog
          open
          tariffs={[]}
          roles={[]}
          permissions={[]}
          customTariffAllowed={false}
          isSubmitting={false}
          onClose={() => {}}
          onSubmit={vi.fn().mockResolvedValue(undefined)}
        />
      </LocalizationProvider>,
    );

    expect(screen.getByLabelText('labels.existingTariff')).toBeInTheDocument();
    expect(screen.queryByLabelText('labels.customActivation')).not.toBeInTheDocument();
  });

  it('derives and deduplicates custom permissions before submitting the exact payload', async () => {
    const readOrders = permission('permission-read', 'orders.read', 'Read orders');
    const sharedPermission = permission('permission-shared', 'reports.view', 'View reports');
    const closeOrders = permission('permission-close', 'orders.close', 'Close orders');
    const manualPermission = permission('permission-manual', 'settings.update', 'Update settings');
    const roles = [
      systemRole('role-cashier', 'Cashier', [readOrders, sharedPermission]),
      systemRole('role-manager', 'Manager', [sharedPermission, closeOrders]),
    ];
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RestaurantActivationDialog
          open
          tariffs={[]}
          roles={roles}
          permissions={[readOrders, sharedPermission, closeOrders, manualPermission]}
          customTariffAllowed
          isSubmitting={false}
          onClose={() => {}}
          onSubmit={onSubmit}
        />
      </LocalizationProvider>,
    );

    fireEvent.click(screen.getByLabelText('labels.customActivation'));
    selectOptions('permissionIds', 'Update settings (settings.update)');
    selectOptions('allowedRoleIds', 'Cashier', 'Manager');

    fireEvent.click(screen.getByRole('button', { name: 'actions.activate' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      activationType: 'custom',
      allowedRoleIds: ['role-cashier', 'role-manager'],
      permissionIds: ['permission-manual', 'permission-read', 'permission-shared', 'permission-close'],
    });
  });

  it('keeps previously derived permissions when the selected roles are cleared', async () => {
    const readOrders = permission('permission-read', 'orders.read', 'Read orders');

    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RestaurantActivationDialog
          open
          tariffs={[]}
          roles={[systemRole('role-cashier', 'Cashier', [readOrders])]}
          permissions={[readOrders]}
          customTariffAllowed
          isSubmitting={false}
          onClose={() => {}}
          onSubmit={vi.fn().mockResolvedValue(undefined)}
        />
      </LocalizationProvider>,
    );

    fireEvent.click(screen.getByLabelText('labels.customActivation'));
    selectOptions('allowedRoleIds', 'Cashier');

    await waitFor(() => {
      expect(screen.getByText('Read orders (orders.read)')).toBeInTheDocument();
    });

    selectOptions('allowedRoleIds', 'Cashier');

    expect(screen.getByRole('option', { name: 'Cashier' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Read orders (orders.read)')).toBeInTheDocument();
  });
});
