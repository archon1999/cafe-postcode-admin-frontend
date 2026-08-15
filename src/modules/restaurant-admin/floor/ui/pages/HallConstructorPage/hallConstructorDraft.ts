import type { AdminHallConstructorTable } from 'shared/api/admin-types';

import type { DraftTable } from './ConstructorTableCard';

export type HallConstructorDraft = {
  gridColumns: number;
  serviceFeeEnabled: boolean;
  serviceFeePercent: number | string;
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

export function toDraftTable(table: AdminHallConstructorTable): DraftTable {
  return {
    ...table,
    serviceFeeEnabled: Boolean(table.serviceFeeEnabled),
    serviceFeePercent: table.serviceFeePercent ?? 0,
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
    serviceFeePercent: draft.serviceFeePercent,
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
        serviceFeePercent: table.serviceFeePercent,
        isActive: table.isActive,
      }))
      .sort((left, right) => left.tableNumber - right.tableNumber),
  });
}
