import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ordersRepository } from '../data-access';

import { ordersKeys } from './keys';

export function useRetryPaymentFiscalMutation(paymentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ordersRepository.retryPaymentFiscal(paymentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ordersKeys.paymentDetail(paymentId) });
      await queryClient.invalidateQueries({ queryKey: ordersKeys.receipts() });
    },
  });
}
