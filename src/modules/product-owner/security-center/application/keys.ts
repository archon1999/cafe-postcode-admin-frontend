import type { SecurityEventListQuery } from '../domain';

export const securityCenterKeys = {
  all: ['security-center'] as const,
  monitoring: (businessPartnerId?: string | null) =>
    [...securityCenterKeys.all, 'monitoring', businessPartnerId ?? 'all'] as const,
  migration: () => [...securityCenterKeys.all, 'migration'] as const,
  events: (query: SecurityEventListQuery) => [...securityCenterKeys.all, 'events', query] as const,
  restaurants: () => [...securityCenterKeys.all, 'restaurants'] as const,
  telegramSubscriptions: (restaurantId: string | null) =>
    [...securityCenterKeys.all, 'telegram-subscriptions', restaurantId] as const,
};
