import { describe, expect, it } from 'vitest';

import type { MonitoringBranch } from '../entities';

import { assessBranchHealth } from './branch-health';

const now = '2026-09-09T17:00:00Z';
const branch = (status: 'healthy' | 'attention' | 'critical' | 'unknown' = 'healthy') =>
  ({
    agent: { online: false, deviceStatus: null },
    devices: { activePOS: 0, lastSeenAt: null },
    security: { unacknowledgedCritical: 20, unacknowledgedHigh: 50 },
    operationalHealth: { status, checkedAt: now, freshnessMinutes: 10, reasons: [] },
  }) as unknown as MonitoringBranch;

describe('operational health', () => {
  it('does not turn offline, missing POS or security alerts into technical failures', () => {
    expect(assessBranchHealth(branch(), { referenceTime: now }).status).toBe('healthy');
  });
  it.each(['healthy', 'attention', 'critical', 'unknown'] as const)('uses fresh diagnostic assessment %s', (status) => {
    expect(assessBranchHealth(branch(status), { referenceTime: now }).status).toBe(status);
  });
  it('marks missing, stale or invalid diagnostics unknown', () => {
    expect(assessBranchHealth({} as MonitoringBranch).status).toBe('unknown');
    expect(assessBranchHealth(branch(), { referenceTime: '2026-09-09T17:11:00Z' }).status).toBe('unknown');
    const b = branch();
    b.operationalHealth!.checkedAt = 'bad';
    expect(assessBranchHealth(b, { referenceTime: now }).status).toBe('unknown');
  });
});
