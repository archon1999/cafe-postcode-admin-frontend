import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ordersRepository } from '../data-access';

import { ordersKeys } from './keys';

export function useRetryPaymentFiscalMutation(paymentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recoverOnly: boolean = false) => ordersRepository.retryPaymentFiscal(paymentId, recoverOnly),
    onSuccess: async (response) => {
      if (!response) return;
      await queryClient.invalidateQueries({ queryKey: ordersKeys.paymentDetail(paymentId) });
      await queryClient.invalidateQueries({ queryKey: ordersKeys.receipts() });
    },
  });
}
