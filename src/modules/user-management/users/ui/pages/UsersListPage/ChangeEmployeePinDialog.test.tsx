/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AdminUser } from 'shared/api/admin-types';

import { ChangeEmployeePinDialog } from './ChangeEmployeePinDialog';

const useTranslateMock = vi.fn();
const useGetEmployeeByIdQueryMock = vi.fn();
const useChangeEmployeePinMutationMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock('app/providers/locales', () => ({
  useTranslate: (namespace: string) => useTranslateMock(namespace),
}));

vi.mock('../../../application', () => ({
  useGetEmployeeByIdQuery: (...args: unknown[]) => useGetEmployeeByIdQueryMock(...args),
  useChangeEmployeePinMutation: () => useChangeEmployeePinMutationMock(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

function createEmployee(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 'employee-1',
    username: 'employee-1',
    fullName: 'Test Employee',
    phone: '+998901234567',
    isActive: true,
    employmentStatus: 'active',
    role: {
      id: 'role-1',
      code: 'waiter',
      name: 'Waiter',
      description: '',
      isSystem: false,
      permissions: [],
    },
    permissionCodes: [],
    allowedHallIds: [],
    hallSwitchPermission: false,
    ...overrides,
  };
}

describe('ChangeEmployeePinDialog', () => {
  it('submits updated pin using the full employee payload source and closes on success', async () => {
    const employee = createEmployee();
    const mutateAsync = vi.fn().mockResolvedValue(employee);
    const onClose = vi.fn();

    useTranslateMock.mockImplementation((namespace: string) => ({
      t: (key: string) => `${namespace}:${key}`,
    }));
    useGetEmployeeByIdQueryMock.mockReturnValue({
      data: employee,
      isLoading: false,
    });
    useChangeEmployeePinMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    render(<ChangeEmployeePinDialog open employeeId={employee.id} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText('users:fields.pin'), { target: { value: '4321' } });
    fireEvent.click(screen.getByRole('button', { name: 'users:actions.savePin' }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        user: employee,
        pin: '4321',
      }),
    );
    expect(toastSuccessMock).toHaveBeenCalledWith('users:messages.pinUpdated');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
