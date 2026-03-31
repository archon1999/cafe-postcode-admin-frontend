import { z } from 'zod';

import type { AdminUser, AdminUserPayload } from 'shared/api/admin-types';

import type { UserManagementSurface } from './user.types';

const employmentStatuses = ['active', 'inactive', 'archived'] as const;
const salaryTypes = ['hourly', 'daily', 'kpi'] as const;
const nullableNumberField = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
  z.number().nullable().optional(),
);

function createUserFormSchema(surface: UserManagementSurface) {
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
    employmentStatus: z.enum(employmentStatuses),
    passportSeries: z.string().optional(),
    pnfl: z.string().optional(),
    birthDate: z.string().optional().nullable(),
    salaryType: z.enum(salaryTypes).optional().nullable(),
    baseAmount: nullableNumberField,
    kpiPercent: nullableNumberField.refine(
      (value) => value === null || value === undefined || Number.isInteger(value),
      'KPI foizi butun son bo‘lishi kerak',
    ).refine((value) => value === null || value === undefined || (value >= 0 && value <= 100), 'KPI foizi 0-100 oralig‘ida bo‘lishi kerak'),
    hallSwitchPermission: z.boolean(),
    primaryHallId: z.string().optional(),
    allowedHallIds: z.array(z.string()).default([]),
    password: z.string().optional(),
    pin: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.pin && !/^\d{4}$/.test(value.pin)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pin'],
        message: "PIN 4 ta raqamdan iborat bo'lishi kerak",
      });
    }

    if (value.salaryType === 'kpi' && (value.kpiPercent === null || value.kpiPercent === undefined)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['kpiPercent'],
        message: 'KPI foizi tanlangan bo‘lsa, KPI foizi talab qilinadi',
      });
    }

    if (
      (value.salaryType === 'hourly' || value.salaryType === 'daily') &&
      (value.baseAmount === null || value.baseAmount === undefined || Number.isNaN(value.baseAmount))
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['baseAmount'],
        message: 'Tanlangan maosh turi uchun summa talab qilinadi',
      });
    }
  });
}

export const userFormSchema = createUserFormSchema('user');
export const getUserFormSchema = (surface: UserManagementSurface) => createUserFormSchema(surface);

export type UserFormValues = z.infer<typeof userFormSchema>;

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
  salaryType: null,
  baseAmount: null,
  kpiPercent: null,
  hallSwitchPermission: false,
  primaryHallId: '',
  allowedHallIds: [],
  password: '',
  pin: '',
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
    salaryType: user.salaryType ?? null,
    baseAmount: user.baseAmount ?? null,
    kpiPercent: user.kpiPercent ?? null,
    hallSwitchPermission: user.hallSwitchPermission ?? false,
    primaryHallId: user.primaryHallId ?? '',
    allowedHallIds: user.allowedHallIds ?? [],
    password: '',
    pin: '',
  };
}

export function buildUserPayload(values: UserFormValues, surface: UserManagementSurface = 'user'): AdminUserPayload {
  const normalizedStatus = values.employmentStatus === 'archived'
    ? 'archived'
    : values.isActive
      ? 'active'
      : 'inactive';

  return {
    fullName: values.fullName.trim(),
    phone: values.phone?.trim() ?? '',
    roleId: values.roleId,
    isActive: normalizedStatus === 'active',
    employmentStatus: normalizedStatus,
    passportSeries: values.passportSeries?.trim() || '',
    pnfl: values.pnfl?.trim() || '',
    birthDate: values.birthDate || null,
    salaryType: values.salaryType ?? null,
    baseAmount: values.salaryType === 'hourly' || values.salaryType === 'daily' ? values.baseAmount ?? null : null,
    kpiPercent: values.salaryType === 'kpi' ? values.kpiPercent ?? null : null,
    hallSwitchPermission: values.hallSwitchPermission,
    ...(values.primaryHallId ? { primaryHallId: values.primaryHallId } : { primaryHallId: null }),
    allowedHallIds: values.allowedHallIds,
    ...(values.password ? { password: values.password } : {}),
    ...(values.pin ? { pin: values.pin } : {}),
  };

  if (surface === 'user') {
    payload.username = values.username.trim();
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
      : user.employmentStatus ?? (user.isActive ? 'active' : 'inactive'));

  const payload: AdminUserPayload = {
    fullName: user.fullName,
    phone: user.phone ?? '',
    roleId: overrides?.roleId ?? user.role?.id ?? '',
    isActive: nextEmploymentStatus === 'active',
    employmentStatus: nextEmploymentStatus,
    passportSeries: overrides?.passportSeries ?? user.passportSeries ?? '',
    pnfl: overrides?.pnfl ?? user.pnfl ?? '',
    birthDate: overrides?.birthDate ?? user.birthDate ?? null,
    salaryType: overrides?.salaryType ?? user.salaryType ?? null,
    baseAmount: overrides?.baseAmount ?? user.baseAmount ?? null,
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
