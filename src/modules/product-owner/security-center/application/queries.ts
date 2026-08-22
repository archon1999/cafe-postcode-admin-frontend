import { useQuery } from '@tanstack/react-query';

import { securityCenterRepository } from '../data-access';
import type { SecurityEventListQuery } from '../domain';

import { securityCenterKeys } from './keys';

export function useMonitoringOverviewQuery() {
  return useQuery({
    queryKey: securityCenterKeys.monitoring(),
    queryFn: () => securityCenterRepository.getMonitoringOverview(),
    refetchInterval: 30_000,
  });
}

export function useDeviceMigrationSummaryQuery() {
  return useQuery({
    queryKey: securityCenterKeys.migration(),
    queryFn: () => securityCenterRepository.getMigrationSummary(),
    refetchInterval: 30_000,
  });
}

export function useSecurityEventsQuery(query: SecurityEventListQuery) {
  return useQuery({
    queryKey: securityCenterKeys.events(query),
    queryFn: () => securityCenterRepository.listSecurityEvents(query),
    refetchInterval: 15_000,
  });
}

export function useSecurityCenterRestaurantsQuery() {
  return useQuery({
    queryKey: securityCenterKeys.restaurants(),
    queryFn: () => securityCenterRepository.listRestaurants(),
    staleTime: 60_000,
  });
}

export function useTelegramSubscriptionsQuery(restaurantId: string | null) {
  return useQuery({
    queryKey: securityCenterKeys.telegramSubscriptions(restaurantId),
    queryFn: () => securityCenterRepository.listTelegramSubscriptions(),
  });
}
