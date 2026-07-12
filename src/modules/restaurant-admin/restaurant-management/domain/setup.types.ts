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
  backendUrl: string;
  coordinatorMode: boolean;
  localHttpListen: string;
};

export type LocalAgentEnrollment = {
  enrollmentToken: string;
  expiresAt: string;
  restaurantId: string;
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
