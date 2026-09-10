import { describe, expect, it } from 'vitest';

import { integrationConfigDefaultValues } from './integration-config.mapper';
import { integrationConfigSchema } from './integration-config.schema';

describe('single fiscal STIR / JSHSHIR field', () => {
  it.each(['123456789', '33112976090034', ' 001234567 ', ''])('accepts %s', (taxNumber) => {
    const result = integrationConfigSchema.safeParse({ ...integrationConfigDefaultValues, taxNumber });
    expect(result.success).toBe(true);
  });

  it.each(['12345678', '1234567890123', '123456789012345', '12345678x', '１２３４５６７８９'])(
    'rejects %s',
    (taxNumber) => {
      const result = integrationConfigSchema.safeParse({ ...integrationConfigDefaultValues, taxNumber });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].path).toEqual(['taxNumber']);
    },
  );
});
