export const ordersKeys = {
  all: ['orders'] as const,
  orders: (params: Record<string, unknown>) => [...ordersKeys.all, 'orders', params] as const,
  orderDetail: (id: string) => [...ordersKeys.all, 'order', id] as const,
  items: (params: Record<string, unknown>) => [...ordersKeys.all, 'items', params] as const,
  itemDetail: (id: string) => [...ordersKeys.all, 'item', id] as const,
  notes: (params: Record<string, unknown>) => [...ordersKeys.all, 'notes', params] as const,
  noteDetail: (id: string) => [...ordersKeys.all, 'note', id] as const,
  payments: (params: Record<string, unknown>) => [...ordersKeys.all, 'payments', params] as const,
  paymentDetail: (id: string) => [...ordersKeys.all, 'payment', id] as const,
  receipts: (params: Record<string, unknown>) => [...ordersKeys.all, 'receipts', params] as const,
  receiptDetail: (id: string) => [...ordersKeys.all, 'receipt', id] as const,
};
