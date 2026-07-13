export type RestaurantSetupIssue = {
  code: string;
  message: string;
  blocking: boolean;
};

export type RestaurantSetupStep = {
  id: 'profile' | 'staff' | 'service_points' | 'menu' | 'integrations' | 'coordinator' | 'printing';
  title: string;
  status: 'ready' | 'warning' | 'blocked';
  issues: RestaurantSetupIssue[];
  metrics: Record<string, string | number | boolean>;
};

export type RestaurantInstallerManifest = {
  schemaVersion: number;
  restaurantId: string;
  restaurantName: string;
  restaurantCode: string;
  backendUrl: string;
  coordinatorMode: boolean;
  localHttpListen: string;
};

export type RestaurantSetupReadiness = {
  schemaVersion: number;
  ready: boolean;
  progressPercent: number;
  blockingIssueCount: number;
  steps: RestaurantSetupStep[];
  quickSetup: {
    taxNumber: string;
    martaAddress: string;
    cashDesks: Array<{
      id: string;
      name: string;
      printerTarget: string;
      printerIntegrationId: string;
      paymentIntegrationId: string;
      fiscalIntegrationId: string;
    }>;
    prepStations: Array<{
      id: string;
      name: string;
      kind: 'kitchen' | 'bar' | 'other';
      printerTarget: string;
      printerIntegrationId: string;
    }>;
  };
  installerManifest: RestaurantInstallerManifest;
};

export type RestaurantSetupIntegrationPayload = {
  id?: string;
  name: string;
  provider: string;
  settings: Record<string, unknown>;
  isEnabled?: boolean;
};

export type RestaurantSetupCashDeskPayload = {
  id?: string;
  name: string;
  location?: string;
  enabledPaymentMethods: Array<'cash' | 'card' | 'mixed'>;
  receiptPrinterEnabled: boolean;
  printer?: RestaurantSetupIntegrationPayload | null;
  payment?: RestaurantSetupIntegrationPayload | null;
  fiscal?: RestaurantSetupIntegrationPayload | null;
};

export type RestaurantSetupPrepStationPayload = {
  id?: string;
  name: string;
  kind: 'kitchen' | 'bar' | 'other';
  printer?: RestaurantSetupIntegrationPayload | null;
};

export type RestaurantSetupApplyPayload = {
  preset: 'single_terminal' | 'multi_terminal';
  cashDesks: RestaurantSetupCashDeskPayload[];
  prepStations: RestaurantSetupPrepStationPayload[];
  createTakeaway: boolean;
};

export type RestaurantSetupApplyResponse = {
  result: {
    cashDeskIds: string[];
    prepStationIds: string[];
    integrationIds: string[];
    printTemplateIds: string[];
  };
  readiness: RestaurantSetupReadiness;
};

export type LocalAgentUpdateStatus = 'up_to_date' | 'pending' | 'disabled' | 'unavailable';

export type LocalAgentAdminStatus = {
  agent: {
    id: string;
    name: string;
    online: boolean;
    lastSeenAt: string | null;
    version: string;
    capabilities: string[];
  } | null;
  update: {
    status: LocalAgentUpdateStatus;
    currentVersion: string;
    latestVersion: string;
    mandatory: boolean;
    detail: string;
  } | null;
};

export type LocalAgentHealthComponent = {
  configured: boolean;
  online: boolean;
  state: string;
  detail?: string;
  checkedAt?: string;
  items?: Array<{
    id?: string;
    name?: string;
    provider?: string;
    online: boolean;
    detail?: string;
    checkedAt: string;
  }>;
};

export type LocalAgentDiagnostics = {
  agent: { online: boolean; version: string; restaurantId?: string };
  backend: { online: boolean; offlineMode: boolean; detail?: string };
  sync: {
    ready: boolean;
    lastSuccessAt?: string;
    lastAttemptAt?: string;
    pendingOutbox: number;
    failedOutbox: number;
    failedOperations?: Array<{
      operationId: string;
      path: string;
      lastError: string;
      responseStatus?: number;
      updatedAt?: string;
    }>;
  };
  fiscal: LocalAgentHealthComponent;
  marta: LocalAgentHealthComponent;
  printer: LocalAgentHealthComponent;
  alerts?: Array<{ code: string; severity: string; message: string }>;
};
