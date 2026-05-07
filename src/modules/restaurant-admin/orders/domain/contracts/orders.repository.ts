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

export interface OrdersRepository {
  getOrders(params: AdminOrdersQueryParams): Promise<AdminPaginatedResponse<AdminOrder>>;
  getOrderById(id: string): Promise<AdminOrder>;
  getOrderItems(params: AdminOrderItemsQueryParams): Promise<AdminPaginatedResponse<AdminOrderItem>>;
  getOrderItemById(id: string): Promise<AdminOrderItem>;
  getOrderItemNotes(params: AdminOrderItemNotesQueryParams): Promise<AdminPaginatedResponse<AdminOrderItemNote>>;
  getOrderItemNoteById(id: string): Promise<AdminOrderItemNote>;
  getPayments(params: AdminPaymentsQueryParams): Promise<AdminPaginatedResponse<AdminPayment>>;
  getPaymentById(id: string): Promise<AdminPayment>;
  retryPaymentFiscal(id: string): Promise<{ payment: AdminPayment; receipt: AdminReceipt; result: Record<string, unknown> }>;
  getReceipts(params: AdminReceiptsQueryParams): Promise<AdminPaginatedResponse<AdminReceipt>>;
  getReceiptById(id: string): Promise<AdminReceipt>;
}
