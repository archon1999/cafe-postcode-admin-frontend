import type { AdminOrderItem } from 'shared/api/admin-types';

export type AggregatedAdminOrderItem = AdminOrderItem & {
  groupKey: string;
  itemIds: string[];
};

function addQuantities(left: number, right: number) {
  return Number((Number(left || 0) + Number(right || 0)).toFixed(3));
}

/**
 * Mirrors POS cart grouping while keeping rows with different operational or
 * pricing details separate so the displayed unit price and total stay valid.
 */
export function aggregateAdminOrderItems(items: AdminOrderItem[] | undefined): AggregatedAdminOrderItem[] {
  const groupedItems = new Map<string, AggregatedAdminOrderItem>();

  for (const item of items ?? []) {
    const groupKey = JSON.stringify([
      item.catalogItem,
      item.note ?? '',
      item.status,
      item.prepStation ?? item.prepStationName ?? '',
      item.saleUnit ?? 'piece',
      Number(item.unitPrice ?? 0),
    ]);
    const existing = groupedItems.get(groupKey);

    if (existing) {
      existing.quantity = addQuantities(existing.quantity, item.quantity);
      existing.lineTotal = Number(existing.lineTotal ?? 0) + Number(item.lineTotal ?? 0);
      existing.notesCount = Number(existing.notesCount ?? 0) + Number(item.notesCount ?? 0);
      existing.itemIds.push(item.id);
      continue;
    }

    groupedItems.set(groupKey, {
      ...item,
      quantity: addQuantities(0, item.quantity),
      lineTotal: Number(item.lineTotal ?? 0),
      groupKey,
      itemIds: [item.id],
    });
  }

  return Array.from(groupedItems.values());
}
