import { z } from 'zod';

export const tariffFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  isActive: z.boolean().default(true),
  allowedRoleIds: z.array(z.string()).default([]),
  permissionIds: z.array(z.string()).default([]),
});

export type TariffFormInput = z.input<typeof tariffFormSchema>;
export type TariffFormValues = z.output<typeof tariffFormSchema>;

export const tariffFormDefaultValues = {
  name: '',
  description: '',
  isActive: true,
  allowedRoleIds: [],
  permissionIds: [],
} satisfies TariffFormInput;

export function parseTariffRoleIds(value: TariffFormInput['allowedRoleIds']): TariffFormValues['allowedRoleIds'] {
  return tariffFormSchema.shape.allowedRoleIds.parse(value);
}

export function parseTariffPermissionIds(value: TariffFormInput['permissionIds']): TariffFormValues['permissionIds'] {
  return tariffFormSchema.shape.permissionIds.parse(value);
}
