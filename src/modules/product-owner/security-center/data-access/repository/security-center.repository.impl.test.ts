import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock('shared/api/http/axiosInstance', () => ({
  instance: { get: getMock, post: vi.fn(), delete: vi.fn() },
}));

import { securityCenterRepository } from './security-center.repository.impl';

beforeEach(() => getMock.mockReset());

describe('securityCenterRepository query contracts', () => {
  it('loads the operational monitoring overview from its read-only endpoint', async () => {
    getMock.mockResolvedValue({
      data: {
        generatedAt: '2026-08-22T10:00:00.000Z',
        summary: {
          totalBranches: 0,
          agentOnline: 0,
          agentOffline: 0,
          agentMissing: 0,
          activeDevices: 0,
          revokedDevices: 0,
          activePOSTerminals: 0,
          pendingPairings: 0,
          unacknowledgedHigh: 0,
          unacknowledgedCritical: 0,
        },
        branches: [],
      },
    });

    const result = await securityCenterRepository.getMonitoringOverview('partner-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/monitoring/overview/', {
      params: { business_partner_id: 'partner-1' },
    });
    expect(result.generatedAt).toBe('2026-08-22T10:00:00.000Z');
  });

  it('maps security event filters to the backend snake-case API contract', async () => {
    getMock.mockResolvedValue({
      data: { page: 2, pageSize: 20, count: 0, total: 0, pagesCount: 0, data: [] },
    });

    await securityCenterRepository.listSecurityEvents({
      page: 2,
      pageSize: 20,
      businessPartnerId: 'partner-1',
      restaurantId: 'restaurant-1',
      eventType: 'DEVICE_PROOF_FAILED',
      deviceId: 'device-1',
      severity: 'HIGH',
      acknowledged: false,
      from: '2026-08-17T00:00:00Z',
      to: '2026-08-17T23:59:59Z',
      result: 'DENIED',
      search: 'request-1',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/security-events/', {
      params: {
        page: 2,
        page_size: 20,
        business_partner_id: 'partner-1',
        restaurant_id: 'restaurant-1',
        event_type: 'DEVICE_PROOF_FAILED',
        severity: 'HIGH',
        device_id: 'device-1',
        result: 'DENIED',
        acknowledged: false,
        from: '2026-08-17T00:00:00Z',
        to: '2026-08-17T23:59:59Z',
        search: 'request-1',
      },
    });
  });
});
