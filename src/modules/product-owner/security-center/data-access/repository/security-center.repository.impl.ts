import { instance } from 'shared/api/http/axiosInstance';

import type {
  RestaurantOption,
  SecurityCenterRepository,
  SecurityEvent,
  SecurityEventListQuery,
  TelegramLink,
  TelegramSubscription,
} from '../../domain';
import {
  mapDeviceMigrationSummary,
  mapMonitoringOverview,
  type DeviceMigrationSummaryDto,
  type MonitoringOverviewDto,
} from '../mappers';

type ApiPage<T> = {
  page: number;
  pageSize: number;
  count: number;
  total: number;
  pagesCount: number;
  data: T[];
};

function mapPage<T>(page: ApiPage<T>) {
  return { items: page.data, total: page.total };
}

function pageParams(query: { page: number; pageSize: number }) {
  return { page: query.page, page_size: query.pageSize };
}

export const securityCenterRepository: SecurityCenterRepository = {
  async getMonitoringOverview(businessPartnerId) {
    const response = await instance.get<MonitoringOverviewDto>('/api/v1/admin/monitoring/overview/', {
      params: { business_partner_id: businessPartnerId },
    });
    return mapMonitoringOverview(response.data);
  },

  async getMigrationSummary() {
    const response = await instance.get<DeviceMigrationSummaryDto>('/api/v1/admin/devices/migration-summary/');
    return mapDeviceMigrationSummary(response.data);
  },

  async listSecurityEvents(query: SecurityEventListQuery) {
    const response = await instance.get<ApiPage<SecurityEvent>>('/api/v1/admin/security-events/', {
      params: {
        ...pageParams(query),
        business_partner_id: query.businessPartnerId,
        restaurant_id: query.restaurantId,
        event_type: Array.isArray(query.eventType) ? query.eventType.join(',') : query.eventType,
        severity: Array.isArray(query.severity) ? query.severity.join(',') : query.severity,
        device_id: query.deviceId,
        result: query.result,
        acknowledged: query.acknowledged,
        from: query.last24Hours ? new Date(Date.now() - 86400000).toISOString() : query.from,
        to: query.to,
        search: query.search,
      },
    });
    return mapPage(response.data);
  },

  async acknowledgeSecurityEvents(ids: string[]) {
    const response = await instance.post<{ updated: number; ids: string[] }>(
      '/api/v1/admin/security-events/bulk-acknowledge/',
      { ids },
    );
    return response.data;
  },

  async acknowledgeSecurityEvent(eventId: string) {
    const response = await instance.post<{ event: SecurityEvent }>(
      `/api/v1/admin/security-events/${encodeURIComponent(eventId)}/acknowledge/`,
    );
    return response.data.event;
  },

  async listRestaurants() {
    const response = await instance.get<{ data: RestaurantOption[] }>('/api/v1/admin/restaurants/', {
      params: { page: 1, page_size: 100, ordering: 'name' },
    });
    return response.data.data;
  },

  async issueTelegramLink() {
    const response = await instance.post<TelegramLink>('/api/v1/admin/telegram-reports/link-token/');
    return response.data;
  },

  async listTelegramSubscriptions() {
    const response = await instance.get<{ data: TelegramSubscription[] }>(
      '/api/v1/admin/telegram-reports/subscriptions/',
    );
    return response.data.data;
  },

  async revokeTelegramSubscription(subscriptionId: string) {
    await instance.delete(`/api/v1/admin/telegram-reports/subscriptions/${encodeURIComponent(subscriptionId)}/`);
  },
};
