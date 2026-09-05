// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { durableFiscalRetry } from './durableFiscalRetry';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), userId: 'u1', restaurantId: 'r1' }));
vi.mock('./axiosInstance', () => ({
  instance: { defaults: { baseURL: 'https://backend.test' }, get: mocks.get, post: mocks.post },
}));
vi.mock('modules/auth/domain', () => ({
  currentUserStore: { getState: () => ({ currentUser: { id: mocks.userId, restaurantId: mocks.restaurantId } }) },
  adminScopeStore: { getState: () => ({ selectedRestaurantId: null }) },
}));

const notFound = { response: { status: 404, data: { code: 'FINANCIAL_COMMAND_NOT_FOUND' } } };
const result = { payment: { id: 'p1' }, results: [{ ok: true }], receipts: [{ id: 'r1', status: 'sent' }] };
function saved() {
  const key = Object.keys(localStorage)[0];
  return key
    ? (JSON.parse(localStorage.getItem(key)!) as { commandId: string; paymentId: string; payload: string })
    : null;
}

describe('admin durable fiscal retry', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.get.mockReset();
    mocks.post.mockReset();
    mocks.userId = 'u1';
    mocks.restaurantId = 'r1';
    localStorage.clear();
    vi.stubGlobal('crypto', webcrypto);
  });

  it('persists immutable payment identity before a single owner dispatch', async () => {
    mocks.get.mockRejectedValue(notFound);
    mocks.post.mockImplementation(async (path, payload, config) => {
      expect(path).toBe('/api/v1/admin/billing/payments/p1/retry-fiscal/');
      expect(payload).toEqual({});
      expect(saved()).toEqual({
        commandId: config.headers['X-Edge-Operation-ID'],
        paymentId: 'p1',
        payload: '{}',
        origin: 'https://backend.test',
      });
      return { data: result };
    });
    expect(await durableFiscalRetry('p1')).toEqual(result);
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.get).toHaveBeenCalledWith(
      expect.stringMatching(/^\/api\/v1\/admin\/billing\/financial-commands\/admin%3A/),
    );
    expect(saved()).toBeNull();
  });

  it('looks up a lost response after reload without issuing another fiscal retry', async () => {
    mocks.get.mockRejectedValue(notFound);
    mocks.post.mockRejectedValue(new Error('timeout'));
    await expect(durableFiscalRetry('p1')).rejects.toThrow();
    const commandId = saved()!.commandId;
    mocks.get.mockResolvedValue({ data: { commandId, state: 'succeeded', responseStatus: 200, response: result } });
    expect(await durableFiscalRetry('p1', true)).toEqual(result);
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(saved()).toBeNull();
  });

  it('does not repost even the same ID while cloud lookup is unknown or not found', async () => {
    mocks.get.mockRejectedValue(notFound);
    mocks.post.mockRejectedValue(new Error('timeout'));
    await expect(durableFiscalRetry('p1')).rejects.toThrow();
    const commandId = saved()!.commandId;
    await expect(durableFiscalRetry('p1')).rejects.toThrow();
    mocks.get.mockResolvedValue({ data: { commandId, state: 'unknown', responseStatus: 409, retryAllowed: false } });
    await expect(durableFiscalRetry('p1')).rejects.toMatchObject({ response: { data: { state: 'unknown' } } });
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(saved()!.commandId).toBe(commandId);
  });

  it('blocks legacy backend before POST when status endpoint is generic 404', async () => {
    mocks.get.mockRejectedValue({ response: { status: 404, data: { detail: 'Not found' } } });
    await expect(durableFiscalRetry('p1')).rejects.toThrow();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('does not discard unknown work or show malformed success as recovered', async () => {
    mocks.get.mockRejectedValue(notFound);
    mocks.post.mockRejectedValue(new Error('timeout'));
    await expect(durableFiscalRetry('p1')).rejects.toThrow();
    mocks.get.mockResolvedValue({ data: { commandId: saved()!.commandId, state: 'succeeded', responseStatus: 200 } });
    await expect(durableFiscalRetry('p1', true)).rejects.toThrow();
    expect(saved()).not.toBeNull();
  });

  it('does not dispatch when local persistence fails', async () => {
    mocks.get.mockRejectedValue(notFound);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    await expect(durableFiscalRetry('p1')).rejects.toThrow();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('isolates another restaurant or signed-in user from recovery', async () => {
    mocks.get.mockRejectedValue(notFound);
    mocks.post.mockRejectedValue(new Error('timeout'));
    await expect(durableFiscalRetry('p1')).rejects.toThrow();
    mocks.get.mockClear();
    mocks.userId = 'u2';
    expect(await durableFiscalRetry('p1', true)).toBeNull();
    mocks.userId = 'u1';
    mocks.restaurantId = 'r2';
    expect(await durableFiscalRetry('p1', true)).toBeNull();
    expect(mocks.get).not.toHaveBeenCalled();
  });
});
