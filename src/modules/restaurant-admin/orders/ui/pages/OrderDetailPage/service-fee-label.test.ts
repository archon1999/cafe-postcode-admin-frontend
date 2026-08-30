import { describe, expect, it } from 'vitest';

import { formatServiceFeeRateLabel } from './service-fee-label';

describe('formatServiceFeeRateLabel', () => {
  it('shows hourly without the rate or a zero percent', () => {
    expect(
      formatServiceFeeRateLabel({
        scope: 'table',
        sourceName: 'VIP-1',
        mode: 'hourly',
        hourlyRate: 100_000,
        durationMinutes: 65,
        amount: 108_000,
      }),
    ).toBe('Soatlik');
  });

  it('keeps percentage labels unchanged', () => {
    expect(
      formatServiceFeeRateLabel({
        scope: 'restaurant',
        sourceName: 'Restaurant',
        mode: 'percentage',
        percent: 10,
        amount: 3_000,
      }),
    ).toBe('10%');
  });
});
