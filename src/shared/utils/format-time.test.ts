import { describe, expect, it } from 'vitest';

import { formatDateTime } from './format-time';

describe('format-time', () => {
  it('formats UTC timestamps in Asia/Tashkent', () => {
    expect(formatDateTime('2026-03-27T20:15:00Z', 'DD.MM.YYYY HH:mm')).toBe('28.03.2026 01:15');
  });
});
