import { z } from 'zod';

import type { AdminBillingPeriod } from 'shared/api/admin-types';
import { getCurrentTashkentTime } from 'shared/utils/dayjs';

const moneyFieldSchema = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
  z.number().min(0),
);

export const activationSchema = z
  .object({
    activationType: z.enum(['tariff', 'custom']).default('tariff'),
    billingPeriod: z.enum(['monthly', 'yearly']),
    tariffId: z.string().default(''),
    monthlyPrice: moneyFieldSchema.optional(),
    yearlyPrice: moneyFieldSchema.optional(),
    allowedRoleIds: z.array(z.string()).default([]),
    permissionIds: z.array(z.string()).default([]),
    startsOn: z.string().min(1),
  })
  .superRefine((values, ctx) => {
    if (values.activationType === 'tariff') {
      if (!values.tariffId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['tariffId'], message: 'Tarif tanlang.' });
      }
      return;
    }
    if (!values.allowedRoleIds.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['allowedRoleIds'], message: 'Kamida bitta rol tanlang.' });
    }
    if (!values.permissionIds.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['permissionIds'], message: 'Kamida bitta ruxsat tanlang.' });
    }
    if (values.monthlyPrice === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyPrice'], message: 'Oylik narxni kiriting.' });
    }
    if (values.yearlyPrice === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['yearlyPrice'], message: 'Yillik narxni kiriting.' });
    }
  });

export type ActivationFormValues = z.input<typeof activationSchema>;
export type ActivationValues = z.output<typeof activationSchema>;

export const activationDefaultValues: ActivationFormValues = {
  activationType: 'tariff',
  billingPeriod: 'monthly',
  tariffId: '',
  monthlyPrice: undefined,
  yearlyPrice: undefined,
  allowedRoleIds: [],
  permissionIds: [],
  startsOn: getCurrentTashkentTime().format('YYYY-MM-DD'),
};

export const PLATFORM_ROLE_CODES = new Set(['product_owner', 'business_partner']);

export const BILLING_PERIOD_OPTIONS: Array<{ value: AdminBillingPeriod; labelKey: 'monthly' | 'yearly' }> = [
  { value: 'monthly', labelKey: 'monthly' },
  { value: 'yearly', labelKey: 'yearly' },
];

export function uniqueIds(values: string[]) {
  return [...new Set(values)];
}
