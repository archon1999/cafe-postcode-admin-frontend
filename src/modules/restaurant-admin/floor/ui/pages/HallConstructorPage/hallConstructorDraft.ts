import type { AdminHallConstructorTable } from 'shared/api/admin-types';

import type { DraftTable } from './ConstructorTableCard';

export type HallConstructorDraft = {
  gridColumns: number;
  serviceFeeEnabled: boolean;
  serviceFeeMode: 'percentage' | 'hourly';
  serviceFeePercent: number | string;
  serviceFeeHourlyRate: number | string;
  tables: DraftTable[];
  deletedTableIds: string[];
};

export type HallConstructorDragState = {
  mode: 'move' | 'resize';
  localId: string;
  startX: number;
  startY: number;
  origin: Pick<DraftTable, 'positionX' | 'positionY' | 'width' | 'height'>;
};

export function normalizeServiceFeePercent(value: number | string): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(99, Math.max(0, Math.round(numericValue)));
}

export function normalizeServiceFeeHourlyRate(value: number | string): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : 0;
}

export function toDraftTable(table: AdminHallConstructorTable): DraftTable {
  return {
    ...table,
    serviceFeeEnabled: Boolean(table.serviceFeeEnabled),
    serviceFeeMode: table.serviceFeeMode ?? 'percentage',
    serviceFeePercent: table.serviceFeePercent ?? 0,
    serviceFeeHourlyRate: table.serviceFeeHourlyRate ?? 0,
    localId: table.id,
  };
}

export function serializeHallConstructorDraft(draft: HallConstructorDraft | null): string {
  if (!draft) {
    return '';
  }

  return JSON.stringify({
    gridColumns: draft.gridColumns,
    serviceFeeEnabled: draft.serviceFeeEnabled,
    serviceFeeMode: draft.serviceFeeMode,
    serviceFeePercent: draft.serviceFeePercent,
    serviceFeeHourlyRate: draft.serviceFeeHourlyRate,
    deletedTableIds: [...draft.deletedTableIds].sort(),
    tables: [...draft.tables]
      .map((table) => ({
        id: table.id,
        name: table.name,
        tableNumber: table.tableNumber,
        seatCount: table.seatCount,
        shapeVariant: table.shapeVariant,
        positionX: table.positionX,
        positionY: table.positionY,
        width: table.width,
        height: table.height,
        serviceFeeEnabled: table.serviceFeeEnabled,
        serviceFeeMode: table.serviceFeeMode,
        serviceFeePercent: table.serviceFeePercent,
        serviceFeeHourlyRate: table.serviceFeeHourlyRate,
        isActive: table.isActive,
      }))
      .sort((left, right) => left.tableNumber - right.tableNumber),
  });
}
