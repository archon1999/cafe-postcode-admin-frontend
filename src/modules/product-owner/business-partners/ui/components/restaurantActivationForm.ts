import { z } from 'zod';

export const activationSchema = z
  .object({
    activationType: z.enum(['tariff', 'custom']).default('tariff'),
    tariffId: z.string().default(''),
    allowedRoleIds: z.array(z.string()).default([]),
    permissionIds: z.array(z.string()).default([]),
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
  });

export type ActivationFormValues = z.input<typeof activationSchema>;
export type ActivationValues = z.output<typeof activationSchema>;

export const activationDefaultValues: ActivationFormValues = {
  activationType: 'tariff',
  tariffId: '',
  allowedRoleIds: [],
  permissionIds: [],
};

export const PLATFORM_ROLE_CODES = new Set(['product_owner', 'business_partner']);

export function uniqueIds(values: string[]) {
  return [...new Set(values)];
}
