import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock('shared/api/http/axiosInstance', () => ({
  instance: { get: getMock, post: vi.fn() },
}));

import { restaurantSetupRepository } from './setup.repository';

describe('Admin Local Agent diagnostics transport', () => {
  beforeEach(() => getMock.mockReset());

  it('unwraps the restaurant-scoped system status snapshot', async () => {
    const snapshot = {
      agent: { online: true, version: '0.7.9' },
      backend: { online: false, offlineMode: true },
      sync: { ready: true, pendingOutbox: 1, failedOutbox: 0, schemaVersion: 1 },
      fiscal: { configured: false, online: false, state: 'not_configured' },
      marta: { configured: false, online: false, state: 'not_configured' },
      printer: { configured: true, online: true, state: 'online' },
      alerts: [],
    };
    getMock.mockResolvedValue({ data: { ok: true, status: snapshot } });

    await expect(restaurantSetupRepository.getLocalAgentDiagnostics()).resolves.toBe(snapshot);
    expect(getMock).toHaveBeenCalledWith('/api/v1/local-agent/diagnostics/');
  });

  it('returns only backend-sanitized remote log data', async () => {
    const logs = { available: true, lines: ['Authorization: Bearer [REDACTED]'] };
    getMock.mockResolvedValue({ data: logs });

    await expect(restaurantSetupRepository.getLocalAgentLogs()).resolves.toBe(logs);
    expect(getMock).toHaveBeenCalledWith('/api/v1/local-agent/logs/');
  });
});
