// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import { AUTH_STORAGE_KEYS } from './keys';
import { sessionService } from './session.service';

describe('sessionService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    sessionService.clearSession();
  });

  it('keeps access credentials in module memory and never web storage', () => {
    sessionService.setAccessToken('opaque-access', '2026-08-16T20:00:00Z');

    expect(sessionService.getAccessToken()).toBe('opaque-access');
    expect(sessionService.getAccessExpiresAt()).toBe('2026-08-16T20:00:00Z');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(window.sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });

  it('purges legacy stored credentials whenever memory is cleared', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'legacy');
    window.sessionStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'legacy');

    sessionService.clearSession();

    expect(sessionService.getAccessToken()).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(window.sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });
});
