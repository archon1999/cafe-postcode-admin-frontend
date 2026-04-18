import { describe, expect, it } from 'vitest';

import {
  buildUserPayload,
  defaultUserFormValues,
  isValidPinCode,
  mapUserToFormValues,
  sanitizePinCodeInput,
  userFormSchema,
} from './user-form.schema';

describe('userFormSchema', () => {
  it('accepts only four digit PIN codes', () => {
    expect(isValidPinCode('1234')).toBe(true);
    expect(isValidPinCode('123')).toBe(false);
    expect(isValidPinCode('12a4')).toBe(false);
  });

  it('sanitizes pin input to four digits', () => {
    expect(sanitizePinCodeInput('12a34')).toBe('1234');
    expect(sanitizePinCodeInput('12 34 56')).toBe('1234');
  });

  it('defaults salary type to monthly in initial values', () => {
    expect(defaultUserFormValues.salaryType).toBe('monthly');
  });

  it('accepts monthly salary type with zero base amount', () => {
    const result = userFormSchema.parse({
      ...defaultUserFormValues,
      username: 'worker',
      fullName: 'Worker',
      roleId: 'role-1',
      salaryType: 'monthly',
      baseAmount: 0,
      kpiPercent: null,
    });

    expect(result.salaryType).toBe('monthly');
    expect(result.baseAmount).toBe(0);
  });

  it('allows empty KPI percent', () => {
    const result = userFormSchema.parse({
      ...defaultUserFormValues,
      username: 'worker',
      fullName: 'Worker',
      roleId: 'role-1',
      salaryType: 'daily',
      baseAmount: 150000,
      kpiPercent: '',
    });

    expect(result.kpiPercent).toBeNull();
  });

  it('normalizes empty base amount to zero', () => {
    const result = userFormSchema.parse({
      ...defaultUserFormValues,
      username: 'worker',
      fullName: 'Worker',
      roleId: 'role-1',
      salaryType: 'hourly',
      baseAmount: '',
    });

    expect(result.baseAmount).toBe(0);
  });
});

describe('user form payload helpers', () => {
  it('maps null base amount to zero for editing', () => {
    const values = mapUserToFormValues({
      id: '1',
      username: 'worker',
      fullName: 'Worker',
      phone: '',
      isActive: true,
      employmentStatus: 'active',
      salaryType: 'monthly',
      baseAmount: null,
      kpiPercent: null,
      role: { id: 'role-1', name: 'Waiter' },
      permissionCodes: [],
    });

    expect(values.salaryType).toBe('monthly');
    expect(values.baseAmount).toBe(0);
  });

  it('builds payload with independent KPI percent', () => {
    const payload = buildUserPayload({
      ...defaultUserFormValues,
      username: 'worker',
      fullName: 'Worker',
      roleId: 'role-1',
      salaryType: 'monthly',
      baseAmount: 2000000,
      kpiPercent: 15,
    });

    expect(payload.salaryType).toBe('monthly');
    expect(payload.baseAmount).toBe(2000000);
    expect(payload.kpiPercent).toBe(15);
  });
});
