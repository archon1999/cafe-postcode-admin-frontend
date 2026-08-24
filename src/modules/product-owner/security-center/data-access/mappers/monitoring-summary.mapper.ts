import type { DeviceStatus, MonitoringAgent, MonitoringBranch, MonitoringOverview } from '../../domain';

type MonitoringAgentDto = {
  id: string;
  version: string;
  lastSeenAt: string | null;
  online: boolean;
  expectedOffline?: boolean;
  offlineReason?: MonitoringAgent['offlineReason'];
  recentRiskEventCount?: number;
  protocolVersion: number;
  deviceStatus: DeviceStatus | null;
};

type MonitoringBranchDto = {
  restaurantId: string;
  restaurantName: string;
  agent: MonitoringAgentDto | null;
  devices: {
    active: number;
    online?: number;
    revoked: number;
    activeLocalAgent?: number;
    activePOS: number;
    activeTV: number;
    activeControl: number;
    telegramSubscriptions?: number;
    lastSeenAt: string | null;
  };
  security: {
    unacknowledgedHigh: number;
    unacknowledgedCritical: number;
    lastEventAt: string | null;
  };
};

export type MonitoringOverviewDto = {
  generatedAt: string;
  summary: {
    totalBranches: number;
    agentOnline: number;
    agentOffline: number;
    agentExpectedOffline?: number;
    agentAttentionRequired?: number;
    agentMissing: number;
    activeDevices: number;
    revokedDevices: number;
    activePOSTerminals: number;
    pendingPairings: number;
    riskWindowHours?: number;
    unacknowledgedHigh: number;
    unacknowledgedCritical: number;
  };
  insights?: {
    securityActivity?: Array<{
      date: string;
      medium?: number;
      high: number;
      critical: number;
    }>;
    agentVersions?: Array<{
      version: string;
      total: number;
      online: number;
      offline: number;
    }>;
    deviceTypes?: {
      localAgent: number;
      pos: number;
      tv: number;
      telegram?: number;
      control?: number;
    };
  };
  branches: MonitoringBranchDto[];
};

function mapAgent(dto: MonitoringAgentDto | null): MonitoringAgent | null {
  if (!dto) return null;

  return {
    id: dto.id,
    version: dto.version,
    lastSeenAt: dto.lastSeenAt,
    online: dto.online,
    expectedOffline: dto.expectedOffline ?? false,
    offlineReason: dto.offlineReason ?? (dto.online ? 'online' : 'last_seen_missing'),
    recentRiskEventCount: dto.recentRiskEventCount ?? 0,
    protocolVersion: dto.protocolVersion,
    deviceStatus: dto.deviceStatus,
  };
}

function mapBranch(dto: MonitoringBranchDto): MonitoringBranch {
  const agent = mapAgent(dto.agent);

  return {
    restaurantId: dto.restaurantId,
    restaurantName: dto.restaurantName,
    agent,
    devices: {
      ...dto.devices,
      online: dto.devices.online ?? 0,
      activeLocalAgent: dto.devices.activeLocalAgent ?? 0,
      telegramSubscriptions: dto.devices.telegramSubscriptions ?? 0,
    },
    security: { ...dto.security },
  };
}

export function mapMonitoringOverview(dto: MonitoringOverviewDto): MonitoringOverview {
  return {
    generatedAt: dto.generatedAt,
    summary: {
      ...dto.summary,
      // Keep the admin compatible during a rolling backend/frontend deploy.
      riskWindowHours: dto.summary.riskWindowHours ?? 24,
      agentExpectedOffline: dto.summary.agentExpectedOffline ?? 0,
      agentAttentionRequired: dto.summary.agentAttentionRequired ?? dto.summary.agentOffline,
    },
    insights: {
      securityActivity: (dto.insights?.securityActivity ?? []).map((activity) => ({
        ...activity,
        medium: activity.medium ?? 0,
      })),
      agentVersions: (dto.insights?.agentVersions ?? []).map((version) => ({ ...version })),
      deviceTypes: {
        localAgent: dto.insights?.deviceTypes?.localAgent ?? 0,
        pos: dto.insights?.deviceTypes?.pos ?? 0,
        tv: dto.insights?.deviceTypes?.tv ?? 0,
        telegram:
          dto.insights?.deviceTypes?.telegram ??
          dto.branches.reduce((total, branch) => total + (branch.devices.telegramSubscriptions ?? 0), 0),
      },
    },
    branches: dto.branches.map(mapBranch),
  };
}
