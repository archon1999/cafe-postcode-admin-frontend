import { z } from 'zod';

import type { AdminUser, AdminUserPayload } from 'shared/api/admin-types';

import { USER_EMPLOYMENT_STATUS_VALUES, USER_SALARY_TYPE_VALUES } from '../enums';

import type { UserManagementSurface } from './user.types';

export const PIN_CODE_ERROR_MESSAGE = "PIN 4 ta raqamdan iborat bo'lishi kerak";
export const EMPLOYEE_LOGIN_ROLE_CODES = ['restaurant_admin', 'fast_food_admin'] as const;

export function isValidPinCode(value: string) {
  return /^\d{4}$/.test(value);
}

export function sanitizePinCodeInput(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function roleRequiresEmployeeCredentials(roleCode?: string | null) {
  return Boolean(
    roleCode && EMPLOYEE_LOGIN_ROLE_CODES.includes(roleCode as (typeof EMPLOYEE_LOGIN_ROLE_CODES)[number]),
  );
}

const numberFieldWithDefaultZero = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? 0 : Number(value)),
  z.number().min(0, { message: "Summa 0 dan kichik bo'lmasligi kerak" }),
);

const nullableNumberField = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
  z.number().min(0, { message: "Qiymat 0 dan kichik bo'lmasligi kerak" }).nullable().optional(),
);

function createUserFormSchema(surface: UserManagementSurface, isEditMode = false) {
  return z
    .object({
      username:
        surface === 'user'
          ? z.string().min(1, { message: 'Username talab qilinadi' })
          : z.string().optional().default(''),
      fullName: z.string().min(1, { message: "To'liq ism talab qilinadi" }),
      phone: z.string().optional(),
      roleId: z.string().min(1, { message: 'Rol tanlanishi kerak' }),
      isActive: z.boolean(),
      employmentStatus: z.enum(USER_EMPLOYMENT_STATUS_VALUES),
      passportSeries: z.string().optional(),
      pnfl: z.string().optional(),
      birthDate: z.string().optional().nullable(),
      salaryType: z.enum(USER_SALARY_TYPE_VALUES),
      baseAmount: numberFieldWithDefaultZero,
      kpiPercent: nullableNumberField.refine(
        (value) => value === null || value === undefined || Number.isInteger(value),
        "KPI foizi butun son bo'lishi kerak",
      ),
      hallSwitchPermission: z.boolean(),
      primaryHallId: z.string().optional(),
      allowedHallIds: z.array(z.string()).default([]),
      password: z.string().optional(),
      pin: z.string().optional(),
      requiresLoginCredentials: z.boolean().default(false),
    })
    .superRefine((value, context) => {
      if (surface === 'employee' && value.requiresLoginCredentials) {
        if (!value.username?.trim()) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['username'],
            message: 'Login talab qilinadi',
          });
        }

        if (!isEditMode && !value.password?.trim()) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['password'],
            message: 'Parol talab qilinadi',
          });
        }
      }

      if (value.pin && !isValidPinCode(value.pin)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pin'],
          message: PIN_CODE_ERROR_MESSAGE,
        });
      }

      if (Number.isNaN(value.baseAmount)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['baseAmount'],
          message: 'Asosiy summa talab qilinadi',
        });
      }
    });
}

export const userFormSchema = createUserFormSchema('user');
export const getUserFormSchema = (surface: UserManagementSurface, isEditMode = false) =>
  createUserFormSchema(surface, isEditMode);

type UserFormSchema = ReturnType<typeof createUserFormSchema>;

export type UserFormInput = z.input<UserFormSchema>;
export type UserFormValues = z.output<UserFormSchema>;

export const defaultUserFormValues: UserFormValues = {
  username: '',
  fullName: '',
  phone: '',
  roleId: '',
  isActive: true,
  employmentStatus: 'active',
  passportSeries: '',
  pnfl: '',
  birthDate: undefined,
  salaryType: 'monthly',
  baseAmount: 0,
  kpiPercent: null,
  hallSwitchPermission: false,
  primaryHallId: '',
  allowedHallIds: [],
  password: '',
  pin: '',
  requiresLoginCredentials: false,
};

export function mapUserToFormValues(user: AdminUser): UserFormValues {
  return {
    username: user.username,
    fullName: user.fullName,
    phone: user.phone ?? '',
    roleId: user.role?.id ?? '',
    isActive: user.isActive,
    employmentStatus: user.employmentStatus ?? (user.isActive ? 'active' : 'inactive'),
    passportSeries: user.passportSeries ?? '',
    pnfl: user.pnfl ?? '',
    birthDate: user.birthDate ?? undefined,
    salaryType: user.salaryType ?? 'monthly',
    baseAmount: user.baseAmount ?? 0,
    kpiPercent: user.kpiPercent ?? null,
    hallSwitchPermission: user.hallSwitchPermission ?? false,
    primaryHallId: user.primaryHallId ?? '',
    allowedHallIds: user.allowedHallIds ?? [],
    password: '',
    pin: '',
    requiresLoginCredentials: roleRequiresEmployeeCredentials(user.role?.code),
  };
}

export function buildUserPayload(values: UserFormValues, surface: UserManagementSurface = 'user'): AdminUserPayload {
  const normalizedStatus =
    values.employmentStatus === 'archived' ? 'archived' : values.isActive ? 'active' : 'inactive';

  const payload: AdminUserPayload = {
    fullName: values.fullName.trim(),
    phone: values.phone?.trim() ?? '',
    roleId: values.roleId,
    isActive: normalizedStatus === 'active',
    employmentStatus: normalizedStatus,
    passportSeries: values.passportSeries?.trim() || '',
    pnfl: values.pnfl?.trim() || '',
    birthDate: values.birthDate || null,
    salaryType: values.salaryType,
    baseAmount: values.baseAmount ?? 0,
    kpiPercent: values.kpiPercent ?? null,
    hallSwitchPermission: values.hallSwitchPermission,
    ...(values.primaryHallId ? { primaryHallId: values.primaryHallId } : { primaryHallId: null }),
    allowedHallIds: values.allowedHallIds,
  };

  if (surface === 'user' || (surface === 'employee' && values.requiresLoginCredentials)) {
    payload.username = values.username.trim();
  }

  if (surface !== 'employee' || values.requiresLoginCredentials) {
    if (values.password?.trim()) {
      payload.password = values.password.trim();
    }
  }

  if (surface !== 'employee' || !values.requiresLoginCredentials) {
    if (values.pin) {
      payload.pin = values.pin;
    }
  }

  return payload;
}

export function buildUserPayloadFromUser(
  user: AdminUser,
  overrides?: Partial<
    Pick<
      AdminUserPayload,
      | 'isActive'
      | 'password'
      | 'pin'
      | 'roleId'
      | 'employmentStatus'
      | 'passportSeries'
      | 'pnfl'
      | 'birthDate'
      | 'salaryType'
      | 'baseAmount'
      | 'kpiPercent'
    >
  >,
  surface: UserManagementSurface = 'user',
): AdminUserPayload {
  const nextEmploymentStatus =
    overrides?.employmentStatus ??
    (overrides?.isActive !== undefined
      ? overrides.isActive
        ? 'active'
        : 'inactive'
      : (user.employmentStatus ?? (user.isActive ? 'active' : 'inactive')));
  const effectiveSalaryType = overrides?.salaryType ?? user.salaryType ?? 'monthly';

  const payload: AdminUserPayload = {
    fullName: user.fullName,
    phone: user.phone ?? '',
    roleId: overrides?.roleId ?? user.role?.id ?? '',
    isActive: nextEmploymentStatus === 'active',
    employmentStatus: nextEmploymentStatus,
    passportSeries: overrides?.passportSeries ?? user.passportSeries ?? '',
    pnfl: overrides?.pnfl ?? user.pnfl ?? '',
    birthDate: overrides?.birthDate ?? user.birthDate ?? null,
    salaryType: effectiveSalaryType,
    baseAmount: overrides?.baseAmount ?? user.baseAmount ?? 0,
    kpiPercent: overrides?.kpiPercent ?? user.kpiPercent ?? null,
    hallSwitchPermission: user.hallSwitchPermission ?? false,
    ...(user.primaryHallId ? { primaryHallId: user.primaryHallId } : { primaryHallId: null }),
    allowedHallIds: user.allowedHallIds ?? [],
  };

  if (surface === 'user') {
    payload.username = user.username;
  }

  if (overrides?.password) {
    payload.password = overrides.password;
  }

  if (overrides?.pin) {
    payload.pin = overrides.pin;
  }

  return payload;
}
