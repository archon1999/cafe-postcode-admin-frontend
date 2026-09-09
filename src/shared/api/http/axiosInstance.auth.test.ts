// @vitest-environment jsdom

import type { AxiosAdapter, AxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authStore } from 'modules/auth/domain/stores/authentication.store';

import { instance } from './axiosInstance';

const mocks = vi.hoisted(() => ({
  activity: vi.fn(() => false),
  clear: vi.fn(),
  lock: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('modules/auth/application/session-coordinator', () => ({
  clearAdminAuthentication: mocks.clear,
  markAdminSessionLocked: mocks.lock,
  refreshAdminSession: mocks.refresh,
}));

vi.mock('modules/auth/domain/services/admin-activity.service', () => ({
  consumeAdminActivitySignal: mocks.activity,
}));

function rejectedRequest(config: AxiosRequestConfig, status: number, code: string) {
  return Promise.reject({
    config,
    isAxiosError: true,
    response: { config, data: { code }, headers: {}, status, statusText: 'Rejected' },
  });
}

function successfulRequest(config: AxiosRequestConfig) {
  return Promise.resolve({ config, data: { ok: true }, headers: {}, status: 200, statusText: 'OK' });
}

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockClear());
  authStore.getState().setAccessToken('old-access');
});

afterEach(() => {
  instance.defaults.adapter = undefined;
});

describe('admin axios authentication recovery', () => {
  it('refreshes once and retries the original request with the rotated in-memory access token', async () => {
    const requests: AxiosRequestConfig[] = [];
    mocks.refresh.mockImplementation(async () => {
      authStore.getState().setAccessToken('rotated-access');
      return { accessToken: 'rotated-access' };
    });
    instance.defaults.adapter = (async (config) => {
      requests.push(config);
      return requests.length === 1 ? rejectedRequest(config, 401, 'authentication_failed') : successfulRequest(config);
    }) as AxiosAdapter;

    const response = await instance.get('/api/v1/admin/example/');

    expect(response.data).toEqual({ ok: true });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(2);
    expect(requests[1].headers?.Authorization).toBe('Token rotated-access');
  });

  it('does not retry or request MFA for a forbidden sensitive action', async () => {
    const requests: AxiosRequestConfig[] = [];
    instance.defaults.adapter = (async (config) => {
      requests.push(config);
      return rejectedRequest(config, 403, 'mfa_step_up_required');
    }) as AxiosAdapter;

    await expect(instance.post('/api/v1/admin/devices/device-1/revoke/', { reason: 'test' })).rejects.toBeTruthy();

    expect(requests).toHaveLength(1);
  });

  it('moves to locked state on server 423 without attempting a refresh', async () => {
    instance.defaults.adapter = ((config) => rejectedRequest(config, 423, 'session_locked')) as AxiosAdapter;

    await expect(instance.get('/api/v1/admin/example/')).rejects.toBeTruthy();

    expect(mocks.lock).toHaveBeenCalledTimes(1);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});

it.each([undefined, 429, 500, 503, 409])(
  'preserves the session on refresh failure %s and allows a later retry',
  async (status) => {
    const failure = { response: status ? { status } : undefined };
    mocks.refresh.mockRejectedValueOnce(failure);
    instance.defaults.adapter = ((config) => rejectedRequest(config, 401, 'authentication_failed')) as AxiosAdapter;
    await expect(instance.get('/api/v1/admin/example/')).rejects.toBe(failure);
    expect(mocks.clear).not.toHaveBeenCalled();
    expect(mocks.lock).not.toHaveBeenCalled();
    expect(authStore.getState().status).toBe('authenticated');
    let calls = 0;
    mocks.refresh.mockResolvedValueOnce({ accessToken: 'new-access' });
    instance.defaults.adapter = ((config) =>
      ++calls === 1
        ? rejectedRequest(config, 401, 'authentication_failed')
        : successfulRequest(config)) as AxiosAdapter;
    await expect(instance.get('/api/v1/admin/example/')).resolves.toMatchObject({ status: 200 });
  },
);
it('clears authentication only when refresh rejects the session with 401', async () => {
  mocks.refresh.mockRejectedValueOnce({ response: { status: 401 } });
  instance.defaults.adapter = ((config) => rejectedRequest(config, 401, 'authentication_failed')) as AxiosAdapter;
  await expect(instance.get('/api/v1/admin/example/')).rejects.toBeTruthy();
  expect(mocks.clear).toHaveBeenCalledTimes(1);
});
