import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime } from './format-time';

describe('format-time', () => {
  it('formats dates with the admin-wide date format', () => {
    expect(formatDate('2026-03-27')).toBe('27-03-2026');
  });

  it('formats UTC timestamps in Asia/Tashkent with the admin-wide datetime format', () => {
    expect(formatDateTime('2026-03-27T20:15:00Z')).toBe('28-03-2026, 01:15');
  });

  it('uses the shared display fallback for empty and invalid values', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDateTime('not-a-date')).toBe('-');
  });
});
