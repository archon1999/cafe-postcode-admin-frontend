import { z } from 'zod';

import type { AdminZoneOrCabinPayload } from 'shared/api/admin-types';

export const zoneDialogSchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean(),
});

export type ZoneDialogFormInput = z.input<typeof zoneDialogSchema>;
export type ZoneDialogFormValues = z.output<typeof zoneDialogSchema>;

export const zoneDialogDefaultValues: ZoneDialogFormInput = {
  name: '',
  isActive: true,
};

export function toZonePayload(values: ZoneDialogFormValues): AdminZoneOrCabinPayload {
  return {
    name: values.name.trim(),
    isActive: values.isActive,
  };
}
