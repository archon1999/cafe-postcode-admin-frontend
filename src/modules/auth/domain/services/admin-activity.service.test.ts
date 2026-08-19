// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  consumeAdminActivitySignal,
  getLastAdminActivityAt,
  noteAdminActivity,
  resetAdminActivityClock,
} from './admin-activity.service';

afterEach(() => {
  vi.useRealTimers();
});

describe('admin activity signaling', () => {
  it('marks explicit UI activity while throttling server-side database touches', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-16T20:00:00Z'));
    resetAdminActivityClock();

    noteAdminActivity(false);
    expect(getLastAdminActivityAt()).toBe(Date.now());
    expect(consumeAdminActivitySignal()).toBe(true);

    vi.advanceTimersByTime(1000);
    noteAdminActivity(false);
    expect(consumeAdminActivitySignal()).toBe(false);

    vi.advanceTimersByTime(30_000);
    expect(consumeAdminActivitySignal()).toBe(true);
  });
});
