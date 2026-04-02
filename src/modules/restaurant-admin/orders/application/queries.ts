import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminOrder,
  AdminOrderItem,
  AdminOrderItemNote,
  AdminOrderItemNotesQueryParams,
  AdminOrderItemsQueryParams,
  AdminOrdersQueryParams,
  AdminPaginatedResponse,
  AdminPayment,
  AdminPaymentsQueryParams,
  AdminReceipt,
  AdminReceiptsQueryParams,
} from 'shared/api/admin-types';

import { ordersRepository } from '../data-access';

import { ordersKeys } from './keys';

export function useGetOrdersQuery(
  params: AdminOrdersQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminOrder>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.orders(params),
    queryFn: () => ordersRepository.getOrders(params),
    ...options,
  });
}

export function useGetOrderByIdQuery(id: string, options?: Omit<UseQueryOptions<AdminOrder>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: ordersKeys.orderDetail(id),
    queryFn: () => ordersRepository.getOrderById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetOrderItemsQuery(
  params: AdminOrderItemsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminOrderItem>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.items(params),
    queryFn: () => ordersRepository.getOrderItems(params),
    ...options,
  });
}

export function useGetOrderItemByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminOrderItem>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.itemDetail(id),
    queryFn: () => ordersRepository.getOrderItemById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetOrderItemNotesQuery(
  params: AdminOrderItemNotesQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminOrderItemNote>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.notes(params),
    queryFn: () => ordersRepository.getOrderItemNotes(params),
    ...options,
  });
}

export function useGetOrderItemNoteByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminOrderItemNote>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.noteDetail(id),
    queryFn: () => ordersRepository.getOrderItemNoteById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetPaymentsQuery(
  params: AdminPaymentsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminPayment>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.payments(params),
    queryFn: () => ordersRepository.getPayments(params),
    ...options,
  });
}

export function useGetPaymentByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminPayment>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.paymentDetail(id),
    queryFn: () => ordersRepository.getPaymentById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetReceiptsQuery(
  params: AdminReceiptsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminReceipt>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.receipts(params),
    queryFn: () => ordersRepository.getReceipts(params),
    ...options,
  });
}

export function useGetReceiptByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminReceipt>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: ordersKeys.receiptDetail(id),
    queryFn: () => ordersRepository.getReceiptById(id),
    enabled: Boolean(id),
    ...options,
  });
}
