import type {
  AdminOrderItemNotesQueryParams,
  AdminOrderItemsQueryParams,
  AdminOrdersQueryParams,
  AdminPaymentsQueryParams,
  AdminReceiptsQueryParams,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import type { OrdersRepository } from '../../domain';

export const ordersRepository: OrdersRepository = {
  getOrders(params: AdminOrdersQueryParams) {
    return apiClient.getAdminOrders(params);
  },
  getOrderById(id: string) {
    return apiClient.getAdminOrderById(id);
  },
  getOrderItems(params: AdminOrderItemsQueryParams) {
    return apiClient.getAdminOrderItems(params);
  },
  getOrderItemById(id: string) {
    return apiClient.getAdminOrderItemById(id);
  },
  getOrderItemNotes(params: AdminOrderItemNotesQueryParams) {
    return apiClient.getAdminOrderItemNotes(params);
  },
  getOrderItemNoteById(id: string) {
    return apiClient.getAdminOrderItemNoteById(id);
  },
  getPayments(params: AdminPaymentsQueryParams) {
    return apiClient.getAdminPayments(params);
  },
  getPaymentById(id: string) {
    return apiClient.getAdminPaymentById(id);
  },
  retryPaymentFiscal(id: string, recoverOnly = false) {
    return apiClient.retryAdminPaymentFiscal(id, recoverOnly);
  },
  getReceipts(params: AdminReceiptsQueryParams) {
    return apiClient.getAdminReceipts(params);
  },
  getReceiptById(id: string) {
    return apiClient.getAdminReceiptById(id);
  },
};
