import type {
  DeviceMigrationSummary,
  MonitoringOverview,
  PageResult,
  RestaurantOption,
  SecurityEvent,
  SecurityEventListQuery,
  TelegramLink,
  TelegramSubscription,
} from '../entities';

export interface SecurityCenterRepository {
  getMonitoringOverview(): Promise<MonitoringOverview>;
  getMigrationSummary(): Promise<DeviceMigrationSummary>;
  listSecurityEvents(query: SecurityEventListQuery): Promise<PageResult<SecurityEvent>>;
  acknowledgeSecurityEvent(eventId: string): Promise<SecurityEvent>;
  listRestaurants(): Promise<RestaurantOption[]>;
  issueTelegramLink(): Promise<TelegramLink>;
  listTelegramSubscriptions(): Promise<TelegramSubscription[]>;
  revokeTelegramSubscription(subscriptionId: string): Promise<void>;
}
