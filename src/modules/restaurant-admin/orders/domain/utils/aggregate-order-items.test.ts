import { describe, expect, it } from 'vitest';

import type { AdminOrderItem } from 'shared/api/admin-types';

import { aggregateAdminOrderItems } from './aggregate-order-items';

function createItem(overrides: Partial<AdminOrderItem> = {}): AdminOrderItem {
  return {
    id: 'item-1',
    order: 'order-1',
    orderNumber: 1,
    catalogItem: 'lavash-mega',
    catalogItemName: 'Lavash Mega sirom',
    prepStation: 'station-1',
    prepStationName: 'OSHXONA',
    quantity: 1,
    saleUnit: 'piece',
    unitPrice: 44_000,
    lineTotal: 44_000,
    status: 'new',
    note: '',
    notesCount: 0,
    notes: [],
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
    ...overrides,
  };
}

describe('aggregateAdminOrderItems', () => {
  it('groups matching POS lines and sums their quantity and total', () => {
    const result = aggregateAdminOrderItems([
      createItem(),
      createItem({ id: 'item-2', quantity: 2, lineTotal: 88_000, notesCount: 1 }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'item-1',
      quantity: 3,
      lineTotal: 132_000,
      notesCount: 1,
      itemIds: ['item-1', 'item-2'],
    });
  });

  it('keeps rows separate when status, note, station, sale unit, or unit price differs', () => {
    const result = aggregateAdminOrderItems([
      createItem(),
      createItem({ id: 'item-2', status: 'cancelled' }),
      createItem({ id: 'item-3', note: 'Piyozsiz' }),
      createItem({ id: 'item-4', prepStation: 'station-2' }),
      createItem({ id: 'item-5', saleUnit: 'kg' }),
      createItem({ id: 'item-6', unitPrice: 45_000, lineTotal: 45_000 }),
    ]);

    expect(result).toHaveLength(6);
  });

  it('keeps kilogram quantity arithmetic to POS precision', () => {
    const result = aggregateAdminOrderItems([
      createItem({ quantity: 0.125, saleUnit: 'kg', lineTotal: 5_500 }),
      createItem({ id: 'item-2', quantity: 0.2, saleUnit: 'kg', lineTotal: 8_800 }),
    ]);

    expect(result[0].quantity).toBe(0.325);
    expect(result[0].lineTotal).toBe(14_300);
  });
});
