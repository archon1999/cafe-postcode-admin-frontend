export const ORDER_STATUS_VALUES = ['open', 'submitted', 'ready', 'closed', 'cancelled'] as const;

export const ORDER_CHANNEL_VALUES = ['hall', 'takeaway', 'online', 'delivery'] as const;

export const ORDER_ITEM_STATUS_VALUES = ['new', 'cooking', 'done', 'served', 'cancelled'] as const;

export const PAYMENT_STATUS_VALUES = ['pending', 'succeeded', 'failed'] as const;

export const PAYMENT_METHOD_VALUES = ['cash', 'card', 'qr', 'mixed'] as const;

export const RECEIPT_STATUS_VALUES = ['created', 'sent', 'failed'] as const;

export const RECEIPT_KIND_VALUES = ['prebill', 'fiscal', 'refund'] as const;
