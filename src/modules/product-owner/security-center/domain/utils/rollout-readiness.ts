import type { DeviceMigrationBranch, LegacyPOSBridgeFailure } from '../entities';

export type RolloutReadinessReasonCode =
  | 'agentMissing'
  | 'agentOffline'
  | 'agentDeviceNotMigrated'
  | 'agentDeviceNotActive'
  | 'bridgeCapabilityMissing'
  | 'bridgeNotConfigured'
  | 'bridgeNotEnabled'
  | 'bridgeCheckInMissing'
  | 'bridgeCheckInInvalid'
  | 'bridgeHeartbeatMissing'
  | 'bridgeHeartbeatInvalid'
  | 'bridgeSourceCommitInvalid'
  | 'bridgeBuildTimestampInvalid'
  | 'bridgeDeadlineInvalid'
  | 'bridgeExpired'
  | 'bridgeFailureUnknown'
  | 'bridgeServerNotReady'
  | 'activePOSDevicesMissing'
  | 'unboundPOSSessions'
  | 'migrationCountsInvalid';

export type RolloutReadinessReason = {
  code: RolloutReadinessReasonCode;
  count?: number;
  detail?: string;
};

export type RolloutReadinessGate = {
  ready: boolean;
  reasons: RolloutReadinessReason[];
};

export type BranchRolloutStage = 'fixPrerequisites' | 'readyForPOSUpdate' | 'migrationInProgress' | 'readyForBridgeOff';

export type BranchRolloutReadiness = {
  fullyMigrated: boolean;
  posUpdate: RolloutReadinessGate;
  finalization: RolloutReadinessGate;
  stage: BranchRolloutStage;
};

const SOURCE_COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const UTC_SECONDS_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const UTC_NANOSECONDS_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;
const MAX_BRIDGE_LIFETIME_MS = 24 * 60 * 60 * 1000;

const FAILURE_REASON: Partial<Record<Exclude<LegacyPOSBridgeFailure, ''>, RolloutReadinessReasonCode>> = {
  bridge_not_configured: 'bridgeNotConfigured',
  source_commit_invalid: 'bridgeSourceCommitInvalid',
  build_timestamp_invalid: 'bridgeBuildTimestampInvalid',
  bridge_deadline_invalid: 'bridgeDeadlineInvalid',
  bridge_expired: 'bridgeExpired',
  heartbeat_missing: 'bridgeHeartbeatMissing',
  heartbeat_invalid: 'bridgeHeartbeatInvalid',
};

function timestamp(value: string | null | undefined, pattern: RegExp): number | null {
  if (!value || !pattern.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function addReason(
  reasons: RolloutReadinessReason[],
  code: RolloutReadinessReasonCode,
  details: Omit<RolloutReadinessReason, 'code'> = {},
) {
  if (!reasons.some((reason) => reason.code === code)) reasons.push({ code, ...details });
}

function agentDeviceReasons(branch: DeviceMigrationBranch) {
  const reasons: RolloutReadinessReason[] = [];
  if (!branch.agent) {
    addReason(reasons, 'agentMissing');
    return reasons;
  }
  if (!branch.agent.deviceMigrated) {
    addReason(reasons, 'agentDeviceNotMigrated');
  } else if (branch.agent.deviceStatus !== 'ACTIVE') {
    addReason(reasons, 'agentDeviceNotActive');
  }
  return reasons;
}

function evaluatePOSUpdateGate(branch: DeviceMigrationBranch, now: number): RolloutReadinessGate {
  const reasons = agentDeviceReasons(branch);
  const { agent } = branch;
  if (!agent) return { ready: false, reasons };

  if (!agent.online) addReason(reasons, 'agentOffline');

  const { bridge } = agent;
  if (!bridge.capabilityReported) addReason(reasons, 'bridgeCapabilityMissing');
  if (!bridge.configured) addReason(reasons, 'bridgeNotConfigured');
  if (!bridge.enabled) addReason(reasons, 'bridgeNotEnabled');

  const knownFailureReason = FAILURE_REASON[bridge.failure as Exclude<LegacyPOSBridgeFailure, ''>];
  if (bridge.failure && knownFailureReason) {
    addReason(reasons, knownFailureReason);
  } else if (bridge.failure) {
    addReason(reasons, 'bridgeFailureUnknown', { detail: String(bridge.failure) });
  }

  let checkInAt: number | null = null;
  if (!bridge.checkInObserved) {
    addReason(reasons, 'bridgeCheckInMissing');
  } else {
    checkInAt = timestamp(bridge.lastSeenAt, UTC_NANOSECONDS_PATTERN);
    if (
      checkInAt === null ||
      !Number.isInteger(bridge.terminalCount) ||
      Number(bridge.terminalCount) < 1 ||
      Number(bridge.terminalCount) > 10_000
    ) {
      addReason(reasons, 'bridgeCheckInInvalid');
    }
  }

  if (bridge.configured) {
    if (!bridge.sourceCommit || !SOURCE_COMMIT_PATTERN.test(bridge.sourceCommit)) {
      addReason(reasons, 'bridgeSourceCommitInvalid');
    }

    const builtAt = timestamp(bridge.builtAt, UTC_SECONDS_PATTERN);
    if (builtAt === null) addReason(reasons, 'bridgeBuildTimestampInvalid');
    if (builtAt !== null && checkInAt !== null && checkInAt < builtAt) {
      addReason(reasons, 'bridgeCheckInInvalid');
    }

    const notAfter = timestamp(bridge.notAfter, UTC_SECONDS_PATTERN);
    if (
      notAfter === null ||
      (builtAt !== null && (notAfter <= builtAt || notAfter > builtAt + MAX_BRIDGE_LIFETIME_MS))
    ) {
      addReason(reasons, 'bridgeDeadlineInvalid');
    } else if (notAfter <= now) {
      addReason(reasons, 'bridgeExpired');
    }
  }

  if (!bridge.readyForPOSUpdate && reasons.length === 0) addReason(reasons, 'bridgeServerNotReady');

  return { ready: bridge.readyForPOSUpdate === true && reasons.length === 0, reasons };
}

function evaluateFinalizationGate(branch: DeviceMigrationBranch): RolloutReadinessGate {
  const reasons = agentDeviceReasons(branch);
  if (
    !Number.isInteger(branch.activePOSDevices) ||
    !Number.isInteger(branch.unboundPOSSessions) ||
    branch.activePOSDevices < 0 ||
    branch.unboundPOSSessions < 0
  ) {
    addReason(reasons, 'migrationCountsInvalid');
  } else {
    if (branch.activePOSDevices === 0) addReason(reasons, 'activePOSDevicesMissing');
    if (branch.unboundPOSSessions > 0) {
      addReason(reasons, 'unboundPOSSessions', { count: branch.unboundPOSSessions });
    }
  }
  return { ready: reasons.length === 0, reasons };
}

export function evaluateBranchRolloutReadiness(
  branch: DeviceMigrationBranch,
  now: number = Date.now(),
): BranchRolloutReadiness {
  const posUpdate = evaluatePOSUpdateGate(branch, now);
  const finalization = evaluateFinalizationGate(branch);
  const stage: BranchRolloutStage = finalization.ready
    ? 'readyForBridgeOff'
    : posUpdate.ready
      ? 'readyForPOSUpdate'
      : branch.activePOSDevices > 0
        ? 'migrationInProgress'
        : 'fixPrerequisites';

  return {
    fullyMigrated: finalization.ready,
    posUpdate,
    finalization,
    stage,
  };
}
