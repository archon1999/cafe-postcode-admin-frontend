import { describe, expect, it } from 'vitest';

import { toZonePayload, zoneDialogDefaultValues, zoneDialogSchema } from './zoneDialog.form';

const validValues = {
  ...zoneDialogDefaultValues,
  name: '  Terassa  ',
};

describe('zoneDialog form boundary', () => {
  it('uses zero as the default sort order and preserves the outgoing payload', () => {
    const values = zoneDialogSchema.parse(validValues);

    expect(toZonePayload(values)).toEqual({
      name: 'Terassa',
      sortOrder: 0,
      isActive: true,
    });
  });

  it.each(['7', 7])('coerces sort order %s to the numeric payload', (sortOrder) => {
    const values = zoneDialogSchema.parse({ ...validValues, sortOrder });

    expect(toZonePayload(values).sortOrder).toBe(7);
  });
});
