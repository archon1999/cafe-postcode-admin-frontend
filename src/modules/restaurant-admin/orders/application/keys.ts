import { createKeyFactory } from 'shared/api';

const ordersBaseKeys = createKeyFactory('orders');
const orderListKeys = createKeyFactory('orders', 'orders');
const orderKeys = createKeyFactory('orders', 'order');
const itemListKeys = createKeyFactory('orders', 'items');
const itemKeys = createKeyFactory('orders', 'item');
const noteListKeys = createKeyFactory('orders', 'notes');
const noteKeys = createKeyFactory('orders', 'note');
const paymentListKeys = createKeyFactory('orders', 'payments');
const paymentKeys = createKeyFactory('orders', 'payment');
const receiptListKeys = createKeyFactory('orders', 'receipts');
const receiptKeys = createKeyFactory('orders', 'receipt');

export const ordersKeys = {
  all: ordersBaseKeys.all,
  orders: orderListKeys.params,
  orderDetail: orderKeys.id,
  items: itemListKeys.params,
  itemDetail: itemKeys.id,
  notes: noteListKeys.params,
  noteDetail: noteKeys.id,
  payments: paymentListKeys.params,
  paymentDetail: paymentKeys.id,
  receipts: receiptListKeys.params,
  receiptDetail: receiptKeys.id,
} as const;
