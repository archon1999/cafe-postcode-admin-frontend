import { describe, expect, it } from 'vitest';

import {
  buildUserPayload,
  defaultUserFormValues,
  getUserFormSchema,
  isValidPinCode,
  mapUserToFormValues,
  roleRequiresEmployeeCredentials,
  sanitizePinCodeInput,
} from './user-form.schema';

describe('employee form', () => {
  it('validates and sanitizes four-digit POS PINs', () => {
    expect(isValidPinCode('1234')).toBe(true);
    expect(isValidPinCode('123')).toBe(false);
    expect(isValidPinCode('12a4')).toBe(false);
    expect(sanitizePinCodeInput('12a34')).toBe('1234');
  });

  it('requires username and password for employee admin roles on create', () => {
    const result = getUserFormSchema('employee').safeParse({
      ...defaultUserFormValues,
      fullName: 'Clone Admin',
      roleId: 'role-1',
      requiresLoginCredentials: true,
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.username).toContain('Login talab qilinadi');
    expect(result.error?.flatten().fieldErrors.password).toContain('Parol talab qilinadi');
  });

  it('allows an employee admin edit without changing password', () => {
    const result = getUserFormSchema('employee', true).safeParse({
      ...defaultUserFormValues,
      username: 'manager',
      fullName: 'Manager',
      roleId: 'manager-role',
      password: '',
      requiresLoginCredentials: true,
    });
    expect(result.success).toBe(true);
  });

  it('builds employee payload without obsolete payroll fields', () => {
    const values = getUserFormSchema('employee').parse({
      ...defaultUserFormValues,
      username: 'internal-user',
      fullName: '  POS Employee  ',
      roleId: 'role-1',
      pin: '1234',
      requiresLoginCredentials: false,
    });
    const payload = buildUserPayload(values, 'employee');
    expect(payload.fullName).toBe('POS Employee');
    expect(payload.pin).toBe('1234');
    expect(payload.username).toBeUndefined();
    expect('salaryType' in payload).toBe(false);
    expect('baseAmount' in payload).toBe(false);
    expect('kpiPercent' in payload).toBe(false);
  });

  it('maps account identity and detects admin roles', () => {
    const values = mapUserToFormValues({
      id: '1',
      username: 'worker',
      fullName: 'Worker',
      phone: '',
      isActive: true,
      employmentStatus: 'active',
      role: { id: 'role-1', code: 'waiter', name: 'Waiter', description: '', isSystem: true, permissions: [] },
      permissionCodes: [],
    });
    expect(values.fullName).toBe('Worker');
    expect(roleRequiresEmployeeCredentials('restaurant_admin')).toBe(true);
    expect(roleRequiresEmployeeCredentials('waiter')).toBe(false);
  });
});
