import type { AdminHallConstructorTable } from 'shared/api/admin-types';

import type { DraftTable } from './ConstructorTableCard';

export type HallConstructorDraft = {
  gridColumns: number;
  serviceFeeEnabled: boolean;
  serviceFeeMode: 'percentage' | 'hourly' | 'formula';
  serviceFeePercent: number | string;
  serviceFeeHourlyRate: number | string;
  serviceFeeFormula?: Record<string, unknown>;
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
    tableNumber: String(table.tableNumber),
    serviceFeeEnabled: Boolean(table.serviceFeeEnabled),
    serviceFeeMode: table.serviceFeeMode ?? 'percentage',
    serviceFeePercent: table.serviceFeePercent ?? 0,
    serviceFeeHourlyRate: table.serviceFeeHourlyRate ?? 0,
    serviceFeeFormula: table.serviceFeeFormula,
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
    serviceFeeFormula: draft.serviceFeeFormula,
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
        serviceFeeFormula: table.serviceFeeFormula,
        isActive: table.isActive,
      }))
      .sort((left, right) =>
        String(left.tableNumber).localeCompare(String(right.tableNumber), 'en', { numeric: true }),
      ),
  });
}
