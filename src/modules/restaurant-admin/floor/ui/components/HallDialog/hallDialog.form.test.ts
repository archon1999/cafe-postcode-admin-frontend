import { describe, expect, it } from 'vitest';

import { hallDialogDefaultValues, hallDialogSchema, toHallPayload } from './hallDialog.form';

const validValues = {
  ...hallDialogDefaultValues,
  name: '  Asosiy zal  ',
  description: '  Birinchi qavat  ',
  zoneOrCabinId: 'zone-1',
};

describe('hallDialog form boundary', () => {
  it('builds a trimmed payload without a manually entered sort order', () => {
    const values = hallDialogSchema.parse(validValues);

    expect(toHallPayload(values)).toEqual({
      name: 'Asosiy zal',
      description: 'Birinchi qavat',
      isActive: true,
      zoneOrCabinId: 'zone-1',
    });
  });
});
