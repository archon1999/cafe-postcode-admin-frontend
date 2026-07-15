import { z } from 'zod';

import type { AdminRolePayload } from 'shared/api/admin-types';

export const roleFormSchema = z.object({
  name: z.string().min(1, { message: 'Nomi talab qilinadi' }),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

export type RoleFormInput = z.input<typeof roleFormSchema>;
export type RoleFormValues = z.output<typeof roleFormSchema>;

export const roleFormDefaultValues: RoleFormInput = {
  name: '',
  description: '',
  permissionIds: [],
};

export function toRolePayload(values: RoleFormValues): AdminRolePayload {
  return {
    name: values.name.trim(),
    description: values.description?.trim() ?? '',
    permissionIds: values.permissionIds,
  };
}
