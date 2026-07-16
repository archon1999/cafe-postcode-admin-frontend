import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('shared/api/http/axiosInstance', () => ({
  instance: { get: getMock, post: postMock },
}));

import { restaurantSetupRepository } from './setup.repository';

describe('restaurant setup Local Agent lifecycle contract', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  it('requests an immediate update through the restaurant-scoped command endpoint', async () => {
    postMock.mockResolvedValue({
      data: { ok: true, result: { accepted: true, currentVersion: '0.7.9' } },
    });

    await expect(restaurantSetupRepository.requestLocalAgentUpdate()).resolves.toEqual({
      accepted: true,
      currentVersion: '0.7.9',
    });
    expect(postMock).toHaveBeenCalledWith('/api/v1/local-agent/update-now/');
  });

  it('maps only the lifecycle status fields consumed by setup diagnostics', async () => {
    getMock.mockResolvedValue({
      data: {
        agent: {
          id: 'agent-1',
          name: 'Qamish coordinator',
          online: true,
          last_seen_at: '2026-07-15T12:00:00Z',
          version: '0.7.9',
          capabilities: ['printing', 'offline_pos'],
        },
        update: { status: 'staged', targetVersion: '0.8.0' },
      },
    });

    await expect(restaurantSetupRepository.getLocalAgentStatus()).resolves.toEqual({
      agent: {
        id: 'agent-1',
        name: 'Qamish coordinator',
        online: true,
        lastSeenAt: '2026-07-15T12:00:00Z',
        version: '0.7.9',
        capabilities: ['printing', 'offline_pos'],
      },
      update: { status: 'staged', targetVersion: '0.8.0' },
    });
    expect(getMock).toHaveBeenCalledWith('/api/v1/local-agent/status/');
  });
});
