import type { MonitoringBranch } from '../entities';

export type BranchHealthStatus = 'healthy' | 'attention' | 'critical' | 'unknown';
export type BranchHealthReason = string;
export type BranchHealthAssessment = { status: BranchHealthStatus; reasons: BranchHealthReason[] };
export type BranchHealthOptions = { referenceTime?: string | number | Date; staleAfterMs?: number };
export const DEFAULT_BRANCH_ACTIVITY_STALE_MS = 10 * 60 * 1000;

export function assessBranchHealth(
  branch: MonitoringBranch,
  options: BranchHealthOptions = {},
): BranchHealthAssessment {
  const health = branch.operationalHealth;
  if (!health?.checkedAt) return { status: 'healthy', reasons: [] };
  const checked = Date.parse(health.checkedAt);
  const now = new Date(options.referenceTime ?? Date.now()).getTime();
  if (
    !Number.isFinite(checked) ||
    !Number.isFinite(now) ||
    checked > now + 60000 ||
    now - checked > (options.staleAfterMs ?? health.freshnessMinutes * 60000)
  ) {
    return { status: 'healthy', reasons: [] };
  }
  return {
    status: health.status === 'unknown' ? 'healthy' : health.status,
    reasons: [...new Set(health.reasons.map((reason) => reason.component))],
  };
}
