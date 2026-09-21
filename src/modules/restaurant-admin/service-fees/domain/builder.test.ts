import { describe, expect, it } from 'vitest';

import { buildFormula, builderError, splitLastShift, type BuilderOptions } from './builder';
const options: BuilderOptions = {
  kind: 'scheduled',
  hourlyRule: 'minimum',
  hourlyRate: '50000',
  percent: '10',
  addPercent: false,
  rounding: '1',
  shifts: [
    { from: '09:00', until: '18:00', rate: '50000' },
    { from: '18:00', until: '23:00', rate: '100000' },
    { from: '23:00', until: '09:00', rate: '150000' },
  ],
};
describe('shift constructor', () => {
  it('accepts three distinct shifts including midnight', () => {
    expect(builderError(options)).toBeUndefined();
    expect(Object.values(buildFormula(options).parameters)).toEqual(['50000', '100000', '150000']);
  });
  it('rejects overlapping windows and uncovered time instead of silently double charging or undercharging', () => {
    for (const from of ['17:59', '18:01']) {
      const invalid = {
        ...options,
        shifts: options.shifts.map((shift, index) => (index === 1 ? { ...shift, from } : shift)),
      };
      expect(builderError(invalid)).toBe('shiftCoverage');
      expect(() => buildFormula(invalid)).toThrow();
    }
  });
  it('splits a night shift without introducing a gap or changing existing rates', () => {
    const shifts = splitLastShift(options.shifts);
    expect(shifts).toHaveLength(4);
    expect(builderError({ ...options, shifts })).toBeUndefined();
    expect(shifts.slice(-2).map((shift) => shift.rate)).toEqual(['150000', '150000']);
  });
  it('rejects missing rates and an ambiguous equal-boundary window', () => {
    expect(
      builderError({ ...options, shifts: [{ from: '09:00', until: '09:00', rate: '50000' }, options.shifts[1]] }),
    ).toBe('invalidShiftTime');
    expect(builderError({ ...options, shifts: options.shifts.map((shift) => ({ ...shift, rate: '' })) })).toBe(
      'invalidRate',
    );
  });
});
