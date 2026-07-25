import { z } from 'zod';

import type { AdminHallPayload } from 'shared/api/admin-types';

export const hallDialogSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  isActive: z.boolean(),
  zoneOrCabinId: z.string().min(1),
});

export type HallDialogFormInput = z.input<typeof hallDialogSchema>;
export type HallDialogFormValues = z.output<typeof hallDialogSchema>;

export const hallDialogDefaultValues: HallDialogFormInput = {
  name: '',
  description: '',
  isActive: true,
  zoneOrCabinId: '',
};

export function toHallPayload(values: HallDialogFormValues): AdminHallPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    isActive: values.isActive,
    zoneOrCabinId: values.zoneOrCabinId,
  };
}
