import { describe, expect, it } from 'vitest';

import type { MonitoringBranch } from '../entities';

import { assessBranchHealth } from './branch-health';

const referenceTime = '2026-08-22T10:00:00.000Z';

function branch(overrides: Partial<MonitoringBranch> = {}): MonitoringBranch {
  return {
    restaurantId: 'restaurant-1',
    restaurantName: 'Healthy branch',
    agent: {
      id: 'agent-1',
      version: '1.1.0',
      lastSeenAt: '2026-08-22T09:59:30.000Z',
      online: true,
      protocolVersion: 1,
      deviceStatus: 'ACTIVE',
    },
    devices: {
      active: 2,
      online: 2,
      revoked: 0,
      activeLocalAgent: 1,
      activePOS: 1,
      activeTV: 0,
      activeControl: 0,
      telegramSubscriptions: 0,
      lastSeenAt: '2026-08-22T09:59:30.000Z',
    },
    security: {
      unacknowledgedHigh: 0,
      unacknowledgedCritical: 0,
      lastEventAt: null,
    },
    ...overrides,
  };
}

describe('assessBranchHealth', () => {
  it('marks a fully operational branch healthy', () => {
    expect(assessBranchHealth(branch(), { referenceTime })).toEqual({ status: 'healthy', reasons: [] });
  });

  it('gives critical security events the highest priority', () => {
    const result = assessBranchHealth(
      branch({
        security: {
          unacknowledgedHigh: 2,
          unacknowledgedCritical: 1,
          lastEventAt: referenceTime,
        },
      }),
      { referenceTime },
    );

    expect(result.status).toBe('critical');
    expect(result.reasons).toEqual(['critical_security_event', 'high_security_event']);
  });

  it.each([
    ['missing', null, 'agent_missing'],
    [
      'revoked',
      {
        id: 'agent-1',
        version: '1.1.0',
        lastSeenAt: referenceTime,
        online: true,
        protocolVersion: 1,
        deviceStatus: 'REVOKED' as const,
      },
      'agent_revoked',
    ],
    [
      'inactive',
      {
        id: 'agent-1',
        version: '1.1.0',
        lastSeenAt: referenceTime,
        online: true,
        protocolVersion: 1,
        deviceStatus: null,
      },
      'agent_inactive',
    ],
    [
      'offline',
      {
        id: 'agent-1',
        version: '1.1.0',
        lastSeenAt: referenceTime,
        online: false,
        protocolVersion: 1,
        deviceStatus: 'ACTIVE' as const,
      },
      'agent_offline',
    ],
  ])('marks an %s agent as critical', (_label, agent, reason) => {
    const result = assessBranchHealth(branch({ agent }), { referenceTime });

    expect(result.status).toBe('critical');
    expect(result.reasons).toContain(reason);
  });

  it('marks high-risk events and a missing POS for attention', () => {
    const result = assessBranchHealth(
      branch({
        devices: {
          active: 1,
          online: 1,
          revoked: 2,
          activeLocalAgent: 0,
          activePOS: 0,
          activeTV: 1,
          activeControl: 0,
          telegramSubscriptions: 0,
          lastSeenAt: referenceTime,
        },
        security: {
          unacknowledgedHigh: 1,
          unacknowledgedCritical: 0,
          lastEventAt: referenceTime,
        },
      }),
      { referenceTime },
    );

    expect(result).toEqual({
      status: 'attention',
      reasons: ['high_security_event', 'pos_terminal_missing'],
    });
  });

  it('keeps historical revoked devices out of the live branch health status', () => {
    const result = assessBranchHealth(branch({ devices: { ...branch().devices, revoked: 3 } }), { referenceTime });

    expect(result).toEqual({ status: 'healthy', reasons: [] });
  });

  it('detects missing and stale activity deterministically', () => {
    const missing = assessBranchHealth(branch({ devices: { ...branch().devices, lastSeenAt: null } }), {
      referenceTime,
    });
    const stale = assessBranchHealth(
      branch({ devices: { ...branch().devices, lastSeenAt: '2026-08-20T09:59:59.000Z' } }),
      { referenceTime },
    );

    expect(missing.reasons).toContain('device_activity_missing');
    expect(stale.reasons).toContain('device_activity_stale');
  });
});
