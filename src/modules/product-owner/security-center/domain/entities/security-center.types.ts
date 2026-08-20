export type DeviceType = 'POS_TERMINAL' | 'LOCAL_AGENT' | 'TV_MONITOR' | 'CONTROL_DEVICE';
export type DeviceStatus = 'ACTIVE' | 'REVOKED';
export type SecuritySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PageResult<T> = {
  items: T[];
  total: number;
};

export type SecurityEvent = {
  id: string;
  createdAt: string;
  eventType: string;
  severity: SecuritySeverity;
  restaurantId: string | null;
  restaurantName: string | null;
  actorId: string | null;
  actorName: string | null;
  deviceId: string | null;
  authSessionId: string | null;
  requestId: string;
  clientIp: string | null;
  result: string;
  metadata: Record<string, unknown>;
  acknowledgedAt: string | null;
  acknowledgedById: string | null;
};

export type DeviceMigrationSummary = {
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
  branches: DeviceMigrationBranch[];
};

export type LegacyPOSBridgeFailure =
  | ''
  | 'bridge_not_configured'
  | 'source_commit_invalid'
  | 'build_timestamp_invalid'
  | 'bridge_deadline_invalid'
  | 'bridge_expired'
  | 'heartbeat_missing'
  | 'heartbeat_invalid';

export type LegacyPOSBridgeSummary = {
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

export type DeviceMigrationAgent = {
  id: string;
  version: string;
  lastSeenAt: string | null;
  online: boolean;
  protocolVersion: number;
  deviceMigrated: boolean;
  deviceStatus: DeviceStatus | null;
  bridge: LegacyPOSBridgeSummary;
};

export type DeviceMigrationBranch = {
  restaurantId: string;
  restaurantName: string;
  activePOSDevices: number;
  unboundPOSSessions: number;
  agent: DeviceMigrationAgent | null;
};

export type RestaurantOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type TelegramLink = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  startUrl: string;
  expiresAt: string;
};

export type TelegramSubscription = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  telegramUserId: string;
  username: string;
  firstName: string;
  notificationsEnabled: boolean;
  linkedAt: string;
};

export type SecurityEventListQuery = {
  page: number;
  pageSize: number;
  restaurantId?: string;
  eventType?: string;
  severity?: SecuritySeverity;
  deviceId?: string;
  result?: string;
  acknowledged?: boolean;
  from?: string;
  to?: string;
  search?: string;
};
