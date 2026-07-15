/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useFormContext } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminPermission, AdminRole } from 'shared/api/admin-types';

import { parseTariffPermissionIds, parseTariffRoleIds, tariffFormSchema } from './tariff-form';
import TariffFormPage from './TariffFormPage';

const pushMock = vi.fn();
const replaceMock = vi.fn();
const mutateCreateAsyncMock = vi.fn();
const mutateUpdateAsyncMock = vi.fn();
const testLabels = {
  cancel: 'cancel',
  clearRoles: 'clear-roles',
  fillBaseValues: 'fill-base-values',
  selectCashier: 'select-cashier',
  selectCashierAndManager: 'select-cashier-and-manager',
  setManualPermissions: 'set-manual-permissions',
} as const;

const permissionA: AdminPermission = {
  id: 'permission-a',
  code: 'permission.a',
  scope: 'admin',
  name: 'Permission A',
  description: '',
};

const permissionB: AdminPermission = {
  id: 'permission-b',
  code: 'permission.b',
  scope: 'admin',
  name: 'Permission B',
  description: '',
};

const sharedPermission: AdminPermission = {
  id: 'permission-shared',
  code: 'permission.shared',
  scope: 'admin',
  name: 'Shared permission',
  description: '',
};

const roles: AdminRole[] = [
  {
    id: 'role-cashier',
    code: 'cashier',
    name: 'Cashier',
    description: '',
    isSystem: true,
    permissions: [permissionA, sharedPermission],
  },
  {
    id: 'role-manager',
    code: 'manager',
    name: 'Manager',
    description: '',
    isSystem: true,
    permissions: [sharedPermission, permissionB],
  },
  {
    id: 'role-product-owner',
    code: 'product_owner',
    name: 'Product owner',
    description: '',
    isSystem: true,
    permissions: [permissionB],
  },
];

vi.mock('app/layouts/Dashboard', () => ({
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('app/routes', () => ({
  RoutePath: {
    main: '/',
    platformTariffList: '/product-owner/tariffs',
  },
  canAccessTariffs: () => true,
}));

vi.mock('modules/auth/domain/services/current-user', () => ({
  useCurrentUser: () => ({ profile: { isSuperuser: true, permissionCodes: [] } }),
}));

vi.mock('modules/user-management/roles/application', () => ({
  useGetRolesQuery: () => ({ data: roles }),
}));

vi.mock('shared/hooks/router', () => ({
  useParams: () => ({}),
  useRedirectOnNotFound: vi.fn(),
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

vi.mock('shared/hooks/use-page-title', () => ({
  usePageTitle: vi.fn(),
}));

vi.mock('shared/ui/BackToListButton', () => ({
  BackToListButton: () => null,
}));

vi.mock('shared/ui/CustomBreadcrumbs', () => ({
  CustomBreadcrumbs: () => <div data-testid="breadcrumbs" />,
}));

vi.mock('shared/ui/FormActions', () => ({
  FormActions: ({ submitLabel, onCancel }: { submitLabel: string; onCancel: () => void }) => (
    <div>
      <button type="submit">{submitLabel}</button>
      <button type="button" onClick={onCancel}>
        {testLabels.cancel}
      </button>
    </div>
  ),
}));

vi.mock('shared/ui/LoadingScreen', () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}));

vi.mock('../../../application', () => ({
  useGetTariffByIdQuery: () => ({ data: undefined, isLoading: false, error: null }),
  useCreateTariffMutation: () => ({ mutateAsync: mutateCreateAsyncMock }),
  useUpdateTariffMutation: () => ({ mutateAsync: mutateUpdateAsyncMock }),
}));

vi.mock('./TariffFormFields', () => ({
  TariffFormFields: ({ derivedPermissionCount }: { derivedPermissionCount: number }) => {
    const { setValue, watch } = useFormContext();
    const selectedRoleIds = (watch('allowedRoleIds') as string[] | undefined) ?? [];
    const permissionIds = (watch('permissionIds') as string[] | undefined) ?? [];

    return (
      <div>
        <output data-testid="selected-role-ids">{JSON.stringify(selectedRoleIds)}</output>
        <output data-testid="permission-ids">{JSON.stringify(permissionIds)}</output>
        <output data-testid="derived-permission-count">{derivedPermissionCount}</output>
        <button
          type="button"
          onClick={() => {
            setValue('name', ' Starter tariff ');
            setValue('description', ' Included features ');
            setValue('monthlyPrice', 15000);
            setValue('yearlyPrice', '');
          }}>
          {testLabels.fillBaseValues}
        </button>
        <button
          type="button"
          onClick={() => setValue('permissionIds', ['permission-manual', 'permission-shared'], { shouldDirty: true })}>
          {testLabels.setManualPermissions}
        </button>
        <button type="button" onClick={() => setValue('allowedRoleIds', ['role-cashier'], { shouldDirty: true })}>
          {testLabels.selectCashier}
        </button>
        <button
          type="button"
          onClick={() => setValue('allowedRoleIds', ['role-cashier', 'role-manager'], { shouldDirty: true })}>
          {testLabels.selectCashierAndManager}
        </button>
        <button type="button" onClick={() => setValue('allowedRoleIds', [], { shouldDirty: true })}>
          {testLabels.clearRoles}
        </button>
      </div>
    );
  },
}));

function submitForm() {
  fireEvent.submit(screen.getByRole('button', { name: 'actions.create' }).closest('form')!);
}

beforeEach(() => {
  pushMock.mockReset();
  replaceMock.mockReset();
  mutateCreateAsyncMock.mockReset();
  mutateUpdateAsyncMock.mockReset();
  mutateCreateAsyncMock.mockResolvedValue({ id: 'tariff-1' });
});

afterEach(() => {
  cleanup();
});

describe('TariffFormPage role and permission behavior', () => {
  it('submits the default empty role and permission selections unchanged', async () => {
    render(<TariffFormPage />);

    fireEvent.click(screen.getByRole('button', { name: 'fill-base-values' }));
    submitForm();

    await waitFor(() => {
      expect(mutateCreateAsyncMock).toHaveBeenCalledWith({
        name: 'Starter tariff',
        description: 'Included features',
        monthlyPrice: 15000,
        yearlyPrice: 0,
        isActive: true,
        allowedRoleIds: [],
        permissionIds: [],
      });
    });
  });

  it('adds and deduplicates permissions derived from populated role selections', async () => {
    render(<TariffFormPage />);

    fireEvent.click(screen.getByRole('button', { name: 'fill-base-values' }));
    fireEvent.click(screen.getByRole('button', { name: 'set-manual-permissions' }));
    fireEvent.click(screen.getByRole('button', { name: 'select-cashier' }));

    await waitFor(() => {
      expect(screen.getByTestId('permission-ids')).toHaveTextContent(
        JSON.stringify(['permission-manual', 'permission-shared', 'permission-a']),
      );
    });

    expect(screen.getByTestId('derived-permission-count')).toHaveTextContent('2');

    fireEvent.click(screen.getByRole('button', { name: 'select-cashier-and-manager' }));

    await waitFor(() => {
      expect(screen.getByTestId('permission-ids')).toHaveTextContent(
        JSON.stringify(['permission-manual', 'permission-shared', 'permission-a', 'permission-b']),
      );
    });

    expect(screen.getByTestId('derived-permission-count')).toHaveTextContent('3');
    submitForm();

    await waitFor(() => {
      expect(mutateCreateAsyncMock).toHaveBeenCalledWith({
        name: 'Starter tariff',
        description: 'Included features',
        monthlyPrice: 15000,
        yearlyPrice: 0,
        isActive: true,
        allowedRoleIds: ['role-cashier', 'role-manager'],
        permissionIds: ['permission-manual', 'permission-shared', 'permission-a', 'permission-b'],
      });
    });
  });

  it('keeps previously derived permissions when roles are cleared', async () => {
    render(<TariffFormPage />);

    fireEvent.click(screen.getByRole('button', { name: 'select-cashier' }));

    await waitFor(() => {
      expect(screen.getByTestId('permission-ids')).toHaveTextContent(
        JSON.stringify(['permission-a', 'permission-shared']),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'clear-roles' }));

    await waitFor(() => {
      expect(screen.getByTestId('selected-role-ids')).toHaveTextContent('[]');
      expect(screen.getByTestId('derived-permission-count')).toHaveTextContent('0');
      expect(screen.getByTestId('permission-ids')).toHaveTextContent(
        JSON.stringify(['permission-a', 'permission-shared']),
      );
    });
  });
});

describe('tariff form schema boundary', () => {
  it('produces canonical lists and defaults from omitted raw inputs', () => {
    expect(parseTariffRoleIds(undefined)).toEqual([]);
    expect(parseTariffPermissionIds(undefined)).toEqual([]);
    expect(tariffFormSchema.parse({ name: 'Starter' })).toEqual({
      name: 'Starter',
      description: '',
      monthlyPrice: '',
      yearlyPrice: '',
      isActive: true,
      allowedRoleIds: [],
      permissionIds: [],
    });
  });
});
