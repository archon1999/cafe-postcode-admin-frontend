import type { MonitoringBranch } from '../entities';

export type BranchHealthStatus = 'healthy' | 'attention' | 'critical';

export type BranchHealthReason =
  | 'critical_security_event'
  | 'agent_missing'
  | 'agent_revoked'
  | 'agent_inactive'
  | 'agent_offline'
  | 'high_security_event'
  | 'pos_terminal_missing'
  | 'device_activity_missing'
  | 'device_activity_stale';

export type BranchHealthAssessment = {
  status: BranchHealthStatus;
  reasons: BranchHealthReason[];
};

export type BranchHealthOptions = {
  referenceTime?: string | number | Date;
  staleAfterMs?: number;
};

export const DEFAULT_BRANCH_ACTIVITY_STALE_MS = 24 * 60 * 60 * 1_000;

function timestamp(value: string | number | Date): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return Date.parse(value);
}

function isDeviceActivityStale(branch: MonitoringBranch, options: BranchHealthOptions): boolean {
  if (!branch.devices.lastSeenAt) return false;

  const referenceTime = timestamp(options.referenceTime ?? Date.now());
  const lastSeenAt = Date.parse(branch.devices.lastSeenAt);
  const staleAfterMs = options.staleAfterMs ?? DEFAULT_BRANCH_ACTIVITY_STALE_MS;

  if (!Number.isFinite(referenceTime) || !Number.isFinite(lastSeenAt)) return true;
  return referenceTime - lastSeenAt > staleAfterMs;
}

export function assessBranchHealth(
  branch: MonitoringBranch,
  options: BranchHealthOptions = {},
): BranchHealthAssessment {
  const criticalReasons: BranchHealthReason[] = [];
  const attentionReasons: BranchHealthReason[] = [];

  if (branch.security.unacknowledgedCritical > 0) {
    criticalReasons.push('critical_security_event');
  }

  if (!branch.agent) {
    criticalReasons.push('agent_missing');
  } else {
    if (branch.agent.deviceStatus === 'REVOKED') {
      criticalReasons.push('agent_revoked');
    } else if (branch.agent.deviceStatus !== 'ACTIVE') {
      criticalReasons.push('agent_inactive');
    }

    if (!branch.agent.online) {
      criticalReasons.push('agent_offline');
    }
  }

  if (branch.security.unacknowledgedHigh > 0) {
    attentionReasons.push('high_security_event');
  }
  if (branch.devices.activePOS === 0) {
    attentionReasons.push('pos_terminal_missing');
  }
  if (!branch.devices.lastSeenAt) {
    attentionReasons.push('device_activity_missing');
  } else if (isDeviceActivityStale(branch, options)) {
    attentionReasons.push('device_activity_stale');
  }
  if (criticalReasons.length > 0) {
    return { status: 'critical', reasons: [...criticalReasons, ...attentionReasons] };
  }
  if (attentionReasons.length > 0) {
    return { status: 'attention', reasons: attentionReasons };
  }
  return { status: 'healthy', reasons: [] };
}
