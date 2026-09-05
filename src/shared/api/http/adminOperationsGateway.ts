import type {
  AdminKitchenTicket,
  AdminCashExpense,
  AdminCashExpensesQueryParams,
  AdminCashExpensesResponse,
  AdminExpenseCategory,
  AdminKitchenTicketsQueryParams,
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
} from '../admin-types';

import { instance } from './axiosInstance.ts';
import { durableFiscalRetry } from './durableFiscalRetry';

export const adminOperationsGateway = {
  getAdminExpenseCategories(params?: { isActive?: boolean }) {
    return instance
      .get<AdminExpenseCategory[]>('/api/v1/admin/billing/expense-categories/', { params })
      .then((response) => response.data);
  },

  createAdminExpenseCategory(payload: { name: string; sortOrder: number; isActive?: boolean }) {
    return instance
      .post<AdminExpenseCategory>('/api/v1/admin/billing/expense-categories/', payload)
      .then((response) => response.data);
  },

  updateAdminExpenseCategory(id: string, payload: { name: string; sortOrder: number; isActive: boolean }) {
    return instance
      .patch<AdminExpenseCategory>(`/api/v1/admin/billing/expense-categories/${id}/`, payload)
      .then((response) => response.data);
  },

  getAdminCashExpenses(params: AdminCashExpensesQueryParams) {
    return instance
      .get<AdminCashExpensesResponse>('/api/v1/admin/billing/expenses/', { params })
      .then((response) => response.data);
  },

  voidAdminCashExpense(id: string, reason: string) {
    return instance
      .post<AdminCashExpense>(`/api/v1/admin/billing/expenses/${id}/void/`, { reason })
      .then((response) => response.data);
  },

  getAdminKitchenTickets(params: AdminKitchenTicketsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminKitchenTicket>>('/api/v1/admin/kitchen/tickets/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          prepStationIdIn: params.prepStationIdIn,
          routedViaIn: params.routedViaIn,
          isPrinted: params.isPrinted,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminKitchenTicketById(id: string) {
    return instance.get<AdminKitchenTicket>(`/api/v1/admin/kitchen/tickets/${id}/`).then((response) => response.data);
  },

  getAdminOrders(params: AdminOrdersQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminOrder>>('/api/v1/admin/sales/orders/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          channelIn: params.channelIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminOrderById(id: string) {
    return instance.get<AdminOrder>(`/api/v1/admin/sales/orders/${id}/`).then((response) => response.data);
  },

  getAdminOrderItems(params: AdminOrderItemsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminOrderItem>>('/api/v1/admin/sales/order-items/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminOrderItemById(id: string) {
    return instance.get<AdminOrderItem>(`/api/v1/admin/sales/order-items/${id}/`).then((response) => response.data);
  },

  getAdminOrderItemNotes(params: AdminOrderItemNotesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminOrderItemNote>>('/api/v1/admin/sales/order-item-notes/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminOrderItemNoteById(id: string) {
    return instance
      .get<AdminOrderItemNote>(`/api/v1/admin/sales/order-item-notes/${id}/`)
      .then((response) => response.data);
  },

  getAdminPayments(params: AdminPaymentsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminPayment>>('/api/v1/admin/billing/payments/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          methodIn: params.methodIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminPaymentById(id: string) {
    return instance.get<AdminPayment>(`/api/v1/admin/billing/payments/${id}/`).then((response) => response.data);
  },

  retryAdminPaymentFiscal(id: string, recoverOnly = false) {
    return durableFiscalRetry<{
      payment: AdminPayment;
      receipt: AdminReceipt;
      result: Record<string, unknown>;
      results?: Record<string, unknown>[];
      receipts?: AdminReceipt[];
    }>(id, recoverOnly);
  },

  getAdminReceipts(params: AdminReceiptsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminReceipt>>('/api/v1/admin/billing/receipts/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          kindIn: params.kindIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminReceiptById(id: string) {
    return instance.get<AdminReceipt>(`/api/v1/admin/billing/receipts/${id}/`).then((response) => response.data);
  },
};
