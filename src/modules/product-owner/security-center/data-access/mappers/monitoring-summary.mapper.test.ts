import { describe, expect, it } from 'vitest';

import { mapMonitoringOverview, type MonitoringOverviewDto } from './monitoring-summary.mapper';

describe('mapMonitoringOverview', () => {
  it('maps the API DTO to an isolated monitoring domain model', () => {
    const dto: MonitoringOverviewDto = {
      generatedAt: '2026-08-22T10:00:00.000Z',
      summary: {
        totalBranches: 2,
        agentOnline: 1,
        agentOffline: 0,
        agentExpectedOffline: 0,
        agentAttentionRequired: 0,
        agentMissing: 1,
        activeDevices: 3,
        revokedDevices: 1,
        activePOSTerminals: 1,
        pendingPairings: 2,
        riskWindowHours: 24,
        unacknowledgedHigh: 1,
        unacknowledgedCritical: 0,
      },
      insights: {
        securityActivity: [
          { date: '2026-08-21', medium: 3, high: 2, critical: 1 },
          { date: '2026-08-22', medium: 1, high: 1, critical: 0 },
        ],
        agentVersions: [{ version: '1.1.0', total: 1, online: 1, offline: 0 }],
        deviceTypes: { localAgent: 1, pos: 1, tv: 0, telegram: 2 },
      },
      branches: [
        {
          restaurantId: 'restaurant-1',
          restaurantName: 'Branch one',
          agent: {
            id: 'agent-1',
            version: '1.1.0',
            lastSeenAt: '2026-08-22T09:59:30.000Z',
            online: true,
            expectedOffline: false,
            offlineReason: 'online',
            recentRiskEventCount: 0,
            protocolVersion: 1,
            deviceStatus: 'ACTIVE',
          },
          devices: {
            active: 2,
            online: 1,
            revoked: 1,
            activeLocalAgent: 1,
            activePOS: 1,
            activeTV: 0,
            activeControl: 0,
            telegramSubscriptions: 2,
            lastSeenAt: '2026-08-22T09:59:30.000Z',
          },
          security: {
            unacknowledgedHigh: 1,
            unacknowledgedCritical: 0,
            lastEventAt: '2026-08-22T09:58:00.000Z',
          },
        },
      ],
    };

    const mapped = mapMonitoringOverview(dto);
    dto.summary.totalBranches = 99;
    dto.insights!.securityActivity![0].high = 99;
    dto.insights!.agentVersions![0].online = 99;
    dto.insights!.deviceTypes!.pos = 99;
    dto.branches[0].devices.active = 99;

    expect(mapped.summary.totalBranches).toBe(2);
    expect(mapped.summary.riskWindowHours).toBe(24);
    expect(mapped.summary.agentExpectedOffline).toBe(0);
    expect(mapped.summary.agentAttentionRequired).toBe(0);
    expect(mapped.insights).toEqual({
      securityActivity: [
        { date: '2026-08-21', medium: 3, high: 2, critical: 1 },
        { date: '2026-08-22', medium: 1, high: 1, critical: 0 },
      ],
      agentVersions: [{ version: '1.1.0', total: 1, online: 1, offline: 0 }],
      deviceTypes: { localAgent: 1, pos: 1, tv: 0, telegram: 2 },
    });
    expect(mapped.branches[0]).toEqual({
      restaurantId: 'restaurant-1',
      restaurantName: 'Branch one',
      agent: {
        id: 'agent-1',
        version: '1.1.0',
        lastSeenAt: '2026-08-22T09:59:30.000Z',
        online: true,
        expectedOffline: false,
        offlineReason: 'online',
        recentRiskEventCount: 0,
        protocolVersion: 1,
        deviceStatus: 'ACTIVE',
      },
      devices: {
        active: 2,
        online: 1,
        revoked: 1,
        activeLocalAgent: 1,
        activePOS: 1,
        activeTV: 0,
        activeControl: 0,
        telegramSubscriptions: 2,
        lastSeenAt: '2026-08-22T09:59:30.000Z',
      },
      security: {
        unacknowledgedHigh: 1,
        unacknowledgedCritical: 0,
        lastEventAt: '2026-08-22T09:58:00.000Z',
      },
    });
  });

  it('keeps a missing local agent explicit and safely defaults legacy insight payloads', () => {
    const mapped = mapMonitoringOverview({
      generatedAt: '2026-08-22T10:00:00.000Z',
      summary: {
        totalBranches: 1,
        agentOnline: 0,
        agentOffline: 0,
        agentMissing: 1,
        activeDevices: 0,
        revokedDevices: 0,
        activePOSTerminals: 0,
        pendingPairings: 0,
        unacknowledgedHigh: 0,
        unacknowledgedCritical: 0,
      },
      branches: [
        {
          restaurantId: 'restaurant-1',
          restaurantName: 'Branch one',
          agent: null,
          devices: {
            active: 0,
            online: 0,
            revoked: 0,
            activePOS: 0,
            activeTV: 0,
            activeControl: 0,
            lastSeenAt: null,
          },
          security: {
            unacknowledgedHigh: 0,
            unacknowledgedCritical: 0,
            lastEventAt: null,
          },
        },
      ],
    });

    expect(mapped.branches[0].agent).toBeNull();
    expect(mapped.branches[0].devices.activeLocalAgent).toBe(0);
    expect(mapped.branches[0].devices.telegramSubscriptions).toBe(0);
    expect(mapped.summary.riskWindowHours).toBe(24);
    expect(mapped.summary.agentExpectedOffline).toBe(0);
    expect(mapped.summary.agentAttentionRequired).toBe(0);
    expect(mapped.insights).toEqual({
      securityActivity: [],
      agentVersions: [],
      deviceTypes: { localAgent: 0, pos: 0, tv: 0, telegram: 0 },
    });
  });
});
