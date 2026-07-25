import type {
  AdminOrderChannel,
  AdminOrderItemStatus,
  AdminOrderStatus,
  AdminPaymentMethod,
  AdminPaymentStatus,
  AdminReceiptKind,
  AdminReceiptStatus,
} from 'shared/api/admin-types';

export function getOrderStatusColor(status: AdminOrderStatus) {
  switch (status) {
    case 'closed':
      return 'success';
    case 'ready':
      return 'info';
    case 'cancelled':
      return 'error';
    case 'submitted':
      return 'warning';
    default:
      return 'default';
  }
}

export function getOrderItemStatusColor(status: AdminOrderItemStatus) {
  switch (status) {
    case 'served':
    case 'done':
      return 'success';
    case 'cooking':
      return 'info';
    case 'cancelled':
      return 'error';
    default:
      return 'warning';
  }
}

export function getPaymentStatusColor(status: AdminPaymentStatus) {
  switch (status) {
    case 'succeeded':
      return 'success';
    case 'failed':
      return 'error';
    default:
      return 'warning';
  }
}

export function getReceiptStatusColor(status: AdminReceiptStatus) {
  switch (status) {
    case 'sent':
      return 'success';
    case 'failed':
      return 'error';
    default:
      return 'warning';
  }
}

export function getOrderChannelTranslationKey(channel: AdminOrderChannel) {
  return `channels.${channel}` as const;
}

export function getPaymentMethodTranslationKey(method: AdminPaymentMethod) {
  return `paymentMethods.${method}` as const;
}

export function getReceiptKindTranslationKey(kind: AdminReceiptKind) {
  return `receiptKinds.${kind}` as const;
}
