import { describe, expect, it } from 'vitest';

import { toZonePayload, zoneDialogDefaultValues, zoneDialogSchema } from './zoneDialog.form';

const validValues = {
  ...zoneDialogDefaultValues,
  name: '  Terassa  ',
};

describe('zoneDialog form boundary', () => {
  it('builds a trimmed payload without a manually entered sort order', () => {
    const values = zoneDialogSchema.parse(validValues);

    expect(toZonePayload(values)).toEqual({
      name: 'Terassa',
      isActive: true,
    });
  });
});
