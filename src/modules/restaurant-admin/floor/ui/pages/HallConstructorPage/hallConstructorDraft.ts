import type { AdminHallConstructorTable } from 'shared/api/admin-types';

import type { DraftTable } from './ConstructorTableCard';

export type HallConstructorDraft = {
  gridColumns: number;
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

export function toDraftTable(table: AdminHallConstructorTable): DraftTable {
  return { ...table, localId: table.id };
}

export function serializeHallConstructorDraft(draft: HallConstructorDraft | null): string {
  if (!draft) {
    return '';
  }

  return JSON.stringify({
    gridColumns: draft.gridColumns,
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
        isActive: table.isActive,
      }))
      .sort((left, right) => left.tableNumber - right.tableNumber),
  });
}
