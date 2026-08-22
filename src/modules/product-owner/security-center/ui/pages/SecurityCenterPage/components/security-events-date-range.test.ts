import { describe, expect, it } from 'vitest';

import { normalizeSecurityEventsDateRange, securityEventsDateRangeToQueryBounds } from './security-events-date-range';

describe('security event date range', () => {
  it('converts calendar days to inclusive Asia/Tashkent API bounds', () => {
    expect(
      securityEventsDateRangeToQueryBounds({
        startDate: '2026-08-22',
        endDate: '2026-08-23',
      }),
    ).toEqual({
      from: '2026-08-21T19:00:00.000Z',
      to: '2026-08-23T18:59:59.999Z',
    });
  });

  it('normalizes a reversed range and ignores invalid external values', () => {
    expect(normalizeSecurityEventsDateRange('2026-08-23', '2026-08-22')).toEqual({
      startDate: '2026-08-22',
      endDate: '2026-08-23',
    });
    expect(securityEventsDateRangeToQueryBounds({ startDate: 'invalid', endDate: '2026-08-23' })).toEqual({});
  });
});
