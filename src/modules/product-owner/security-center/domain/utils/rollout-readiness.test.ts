import { describe, expect, it } from 'vitest';

import type { DeviceMigrationBranch, LegacyPOSBridgeSummary } from '../entities';

import { evaluateBranchRolloutReadiness } from './rollout-readiness';

const NOW = Date.parse('2026-08-17T10:00:00Z');

function readyBridge(overrides: Partial<LegacyPOSBridgeSummary> = {}): LegacyPOSBridgeSummary {
  return {
    configured: true,
    enabled: true,
    failure: '',
    sourceCommit: 'a'.repeat(40),
    builtAt: '2026-08-17T09:00:00Z',
    notAfter: '2026-08-17T20:00:00Z',
    lastSeenAt: '2026-08-17T09:59:55Z',
    terminalCount: 2,
    checkInObserved: true,
    capabilityReported: true,
    readyForPOSUpdate: true,
    ...overrides,
  };
}

function branch(overrides: Partial<DeviceMigrationBranch> = {}): DeviceMigrationBranch {
  return {
    restaurantId: 'branch-1',
    restaurantName: 'Central Branch',
    activePOSDevices: 0,
    unboundPOSSessions: 2,
    agent: {
      id: 'agent-1',
      version: '0.9.1-bridge',
      lastSeenAt: '2026-08-17T09:59:58Z',
      online: true,
      protocolVersion: 3,
      deviceMigrated: true,
      deviceStatus: 'ACTIVE',
      bridge: readyBridge(),
    },
    ...overrides,
  };
}

describe('evaluateBranchRolloutReadiness', () => {
  it('allows expected unbound sessions at the POS-update gate without declaring migration complete', () => {
    const result = evaluateBranchRolloutReadiness(branch(), NOW);

    expect(result.posUpdate).toEqual({ ready: true, reasons: [] });
    expect(result.finalization.ready).toBe(false);
    expect(result.finalization.reasons.map(({ code }) => code)).toEqual([
      'activePOSDevicesMissing',
      'unboundPOSSessions',
    ]);
    expect(result.stage).toBe('readyForPOSUpdate');
  });

  it('marks finalization ready from migrated devices and bound sessions even when the temporary bridge is offline and expired', () => {
    const input = branch({ activePOSDevices: 2, unboundPOSSessions: 0 });
    input.agent = {
      ...input.agent!,
      online: false,
      bridge: readyBridge({
        enabled: false,
        failure: 'bridge_expired',
        notAfter: '2026-08-17T09:30:00Z',
        readyForPOSUpdate: false,
      }),
    };

    const result = evaluateBranchRolloutReadiness(input, NOW);

    expect(result.posUpdate.ready).toBe(false);
    expect(result.posUpdate.reasons.map(({ code }) => code)).toEqual(
      expect.arrayContaining(['agentOffline', 'bridgeNotEnabled', 'bridgeExpired']),
    );
    expect(result.finalization).toEqual({ ready: true, reasons: [] });
    expect(result.fullyMigrated).toBe(true);
    expect(result.stage).toBe('readyForBridgeOff');
  });

  it('fails closed when a server-ready bridge deadline has expired in the client snapshot', () => {
    const input = branch();
    input.agent = {
      ...input.agent!,
      bridge: readyBridge({ notAfter: '2026-08-17T09:30:00Z' }),
    };

    const result = evaluateBranchRolloutReadiness(input, NOW);

    expect(result.posUpdate.ready).toBe(false);
    expect(result.posUpdate.reasons).toContainEqual({ code: 'bridgeExpired' });
  });

  it('surfaces an invalid heartbeat with its actionable bridge prerequisites', () => {
    const input = branch();
    input.agent = {
      ...input.agent!,
      bridge: readyBridge({
        configured: false,
        enabled: false,
        failure: 'heartbeat_invalid',
        sourceCommit: undefined,
        builtAt: undefined,
        notAfter: undefined,
        lastSeenAt: undefined,
        terminalCount: undefined,
        checkInObserved: false,
        readyForPOSUpdate: false,
      }),
    };

    const result = evaluateBranchRolloutReadiness(input, NOW);

    expect(result.posUpdate.ready).toBe(false);
    expect(result.posUpdate.reasons.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        'bridgeHeartbeatInvalid',
        'bridgeNotConfigured',
        'bridgeNotEnabled',
        'bridgeCheckInMissing',
      ]),
    );
  });

  it('rejects parseable but non-canonical bridge timestamps', () => {
    const input = branch();
    input.agent = {
      ...input.agent!,
      bridge: readyBridge({ notAfter: '2026-08-17T20:00:00+00:00' }),
    };

    const result = evaluateBranchRolloutReadiness(input, NOW);

    expect(result.posUpdate.ready).toBe(false);
    expect(result.posUpdate.reasons).toContainEqual({ code: 'bridgeDeadlineInvalid' });
  });

  it('reports the missing agent independently for both rollout gates', () => {
    const result = evaluateBranchRolloutReadiness(branch({ agent: null }), NOW);

    expect(result.posUpdate.reasons).toEqual([{ code: 'agentMissing' }]);
    expect(result.finalization.reasons.map(({ code }) => code)).toEqual(
      expect.arrayContaining(['agentMissing', 'activePOSDevicesMissing', 'unboundPOSSessions']),
    );
    expect(result.fullyMigrated).toBe(false);
  });
});
