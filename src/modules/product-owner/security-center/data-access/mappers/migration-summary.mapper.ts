import type {
  DeviceMigrationBranch,
  DeviceMigrationSummary,
  DeviceStatus,
  DeviceType,
  LegacyPOSBridgeFailure,
} from '../../domain';

type LegacyPOSBridgeSummaryDto = {
  configured: boolean;
  enabled: boolean;
  failure: LegacyPOSBridgeFailure;
  sourceCommit?: string;
  builtAt?: string;
  notAfter?: string;
  lastSeenAt?: string;
  terminalCount?: number;
  checkInObserved: boolean;
  capabilityReported: boolean;
  readyForPOSUpdate: boolean;
};

type DeviceMigrationBranchDto = {
  restaurantId: string;
  restaurantName: string;
  activePOSDevices: number;
  unboundPOSSessions: number;
  agent: null | {
    id: string;
    version: string;
    lastSeenAt: string | null;
    online: boolean;
    protocolVersion: number;
    deviceMigrated: boolean;
    deviceStatus: DeviceStatus | null;
    bridge: LegacyPOSBridgeSummaryDto;
  };
};

export type DeviceMigrationSummaryDto = {
  restaurants: {
    total: number;
    withActiveAgentDevice: number;
    withoutActiveAgentDevice: number;
  };
  devices: {
    active: number;
    revoked: number;
    byType: Partial<Record<DeviceType, number>>;
  };
  pairings: { pending: number };
  legacy: {
    localAgentsTotal: number;
    localAgentsMigrated: number;
    posSessionsUnbound: number;
    tvMonitorsTotal: number;
    tvMonitorsMigrated: number;
  };
  branches: DeviceMigrationBranchDto[];
};

function mapBranch(dto: DeviceMigrationBranchDto): DeviceMigrationBranch {
  return {
    restaurantId: dto.restaurantId,
    restaurantName: dto.restaurantName,
    activePOSDevices: dto.activePOSDevices,
    unboundPOSSessions: dto.unboundPOSSessions,
    agent: dto.agent
      ? {
          id: dto.agent.id,
          version: dto.agent.version,
          lastSeenAt: dto.agent.lastSeenAt,
          online: dto.agent.online,
          protocolVersion: dto.agent.protocolVersion,
          deviceMigrated: dto.agent.deviceMigrated,
          deviceStatus: dto.agent.deviceStatus,
          bridge: {
            configured: dto.agent.bridge.configured,
            enabled: dto.agent.bridge.enabled,
            failure: dto.agent.bridge.failure,
            sourceCommit: dto.agent.bridge.sourceCommit,
            builtAt: dto.agent.bridge.builtAt,
            notAfter: dto.agent.bridge.notAfter,
            lastSeenAt: dto.agent.bridge.lastSeenAt,
            terminalCount: dto.agent.bridge.terminalCount,
            checkInObserved: dto.agent.bridge.checkInObserved,
            capabilityReported: dto.agent.bridge.capabilityReported,
            readyForPOSUpdate: dto.agent.bridge.readyForPOSUpdate,
          },
        }
      : null,
  };
}

export function mapDeviceMigrationSummary(dto: DeviceMigrationSummaryDto): DeviceMigrationSummary {
  return {
    restaurants: { ...dto.restaurants },
    devices: { ...dto.devices, byType: { ...dto.devices.byType } },
    pairings: { ...dto.pairings },
    legacy: { ...dto.legacy },
    branches: dto.branches.map(mapBranch),
  };
}
