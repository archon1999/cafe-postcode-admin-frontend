/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AdminRestaurantPayload } from 'shared/api/admin-types';

import { organizationsRepository } from '../data-access';

import { organizationsKeys } from './keys';
import { useUpdateMyRestaurantSettingsMutation } from './mutations';

vi.mock('shared/api/http/apiClient', () => ({ apiClient: {} }));
vi.mock('../data-access', () => ({
  organizationsRepository: {
    updateMyRestaurantSettings: vi.fn(),
  },
}));
vi.mock('../data-access/repository/setup.repository', () => ({ restaurantSetupRepository: {} }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function queryWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const restaurantPayload: AdminRestaurantPayload = {
  name: 'Qamish Refresh',
  legalName: 'QAMISH MCHJ',
  taxNumber: '312217845',
  phone: '+998 90 777 77 77',
  social: '@qamish-refresh',
  address: "Refresh ko'chasi 15",
  serviceFeeEnabled: true,
  serviceFeeMode: 'percentage' as const,
  serviceFeeHourlyRate: 0,
  serviceFeePercent: 15,
  vatEnabled: true,
  vatPercent: 12,
  markingCheckEnabled: true,
  isActive: true,
};

describe('restaurant configuration mutation invalidation', () => {
  it('invalidates list, detail and self-service restaurant queries after save', async () => {
    vi.spyOn(organizationsRepository, 'updateMyRestaurantSettings').mockResolvedValue({
      id: 'restaurant-1',
    } as never);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateMyRestaurantSettingsMutation(), {
      wrapper: queryWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(restaurantPayload);
    });

    expect(organizationsRepository.updateMyRestaurantSettings).toHaveBeenCalledWith(restaurantPayload);
    expect(invalidate).toHaveBeenCalledTimes(3);
    expect(invalidate).toHaveBeenNthCalledWith(1, { queryKey: organizationsKeys.restaurants() });
    expect(invalidate).toHaveBeenNthCalledWith(2, {
      queryKey: organizationsKeys.restaurantDetail('restaurant-1'),
    });
    expect(invalidate).toHaveBeenNthCalledWith(3, { queryKey: organizationsKeys.myRestaurant() });
  });
});
