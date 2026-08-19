import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock('shared/api/http/axiosInstance', () => ({
  instance: { get: getMock, post: vi.fn(), delete: vi.fn() },
}));

import { securityCenterRepository } from './security-center.repository.impl';

beforeEach(() => getMock.mockReset());

describe('securityCenterRepository query contracts', () => {
  it('maps security event filters to the backend snake-case API contract', async () => {
    getMock.mockResolvedValue({
      data: { page: 2, pageSize: 20, count: 0, total: 0, pagesCount: 0, data: [] },
    });

    await securityCenterRepository.listSecurityEvents({
      page: 2,
      pageSize: 20,
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
