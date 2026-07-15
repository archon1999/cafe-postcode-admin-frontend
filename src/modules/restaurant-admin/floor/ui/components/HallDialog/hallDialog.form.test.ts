import { describe, expect, it } from 'vitest';

import { hallDialogDefaultValues, hallDialogSchema, toHallPayload } from './hallDialog.form';

const validValues = {
  ...hallDialogDefaultValues,
  name: '  Asosiy zal  ',
  description: '  Birinchi qavat  ',
  zoneOrCabinId: 'zone-1',
};

describe('hallDialog form boundary', () => {
  it('uses zero as the default sort order and preserves the outgoing payload', () => {
    const values = hallDialogSchema.parse(validValues);

    expect(toHallPayload(values)).toEqual({
      name: 'Asosiy zal',
      description: 'Birinchi qavat',
      sortOrder: 0,
      isActive: true,
      zoneOrCabinId: 'zone-1',
    });
  });

  it.each(['7', 7])('coerces sort order %s to the numeric payload', (sortOrder) => {
    const values = hallDialogSchema.parse({ ...validValues, sortOrder });

    expect(toHallPayload(values).sortOrder).toBe(7);
  });
});
