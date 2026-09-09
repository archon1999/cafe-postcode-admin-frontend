import { useMutation, useQueryClient } from '@tanstack/react-query';

import { securityCenterRepository } from '../data-access';

import { securityCenterKeys } from './keys';

function useInvalidateSecurityCenter() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: securityCenterKeys.all });
}

export function useAcknowledgeSecurityEventMutation() {
  const invalidate = useInvalidateSecurityCenter();
  return useMutation({
    mutationFn: securityCenterRepository.acknowledgeSecurityEvent,
    onSuccess: invalidate,
  });
}

export function useIssueTelegramLinkMutation() {
  return useMutation({ mutationFn: () => securityCenterRepository.issueTelegramLink() });
}

export function useRevokeTelegramSubscriptionMutation(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: securityCenterRepository.revokeTelegramSubscription,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: securityCenterKeys.telegramSubscriptions(restaurantId) }),
  });
}

export function useAcknowledgeSecurityEventsMutation() {
  const invalidate = useInvalidateSecurityCenter();
  return useMutation({ mutationFn: securityCenterRepository.acknowledgeSecurityEvents, onSuccess: invalidate });
}
