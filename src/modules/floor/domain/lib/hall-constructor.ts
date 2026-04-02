import type { AdminHallConstructorTable, AdminTableShapeVariant } from 'shared/api/admin-types';

export const GRID_CELL_SIZE = 104;
export const GRID_GAP_SIZE = 12;
export const GRID_PADDING_SIZE = 12;
export const MIN_GRID_ROWS = 6;

export const TABLE_VARIANTS_BY_SEAT_COUNT: Record<number, AdminTableShapeVariant[]> = {
  2: ['seat2_horizontal', 'seat2_vertical'],
  3: ['seat3_triangle'],
  4: ['seat4_square', 'seat4_horizontal', 'seat4_vertical'],
  5: ['seat5_horizontal', 'seat5_vertical'],
  6: ['seat6_horizontal', 'seat6_vertical'],
};

const DEFAULT_VARIANT_BY_SEAT_COUNT: Record<number, AdminTableShapeVariant> = {
  2: 'seat2_horizontal',
  3: 'seat3_triangle',
  4: 'seat4_square',
  5: 'seat5_horizontal',
  6: 'seat6_horizontal',
};

export type ConstructorSeatMarker = {
  key: string;
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  width?: number | string;
  height?: number | string;
  transform?: string;
};

export function getShapeVariantsForSeatCount(seatCount: number) {
  return TABLE_VARIANTS_BY_SEAT_COUNT[seatCount] ?? TABLE_VARIANTS_BY_SEAT_COUNT[4];
}

export function getDefaultShapeVariant(seatCount: number): AdminTableShapeVariant {
  return DEFAULT_VARIANT_BY_SEAT_COUNT[seatCount] ?? DEFAULT_VARIANT_BY_SEAT_COUNT[4];
}

export function getNextTableNumber(tables: Pick<AdminHallConstructorTable, 'tableNumber'>[]) {
  return tables.reduce((max, table) => Math.max(max, table.tableNumber), 0) + 1;
}

export function getRequiredGridRows(tables: Pick<AdminHallConstructorTable, 'positionY' | 'height'>[]) {
  const maxRows = tables.reduce((max, table) => Math.max(max, table.positionY + table.height), 0);
  return Math.max(maxRows, MIN_GRID_ROWS);
}

export function clampTableToGrid<
  T extends Pick<AdminHallConstructorTable, 'positionX' | 'positionY' | 'width' | 'height'>,
>(table: T, gridColumns: number) {
  const width = Math.max(1, table.width);
  const height = Math.max(1, table.height);
  return {
    ...table,
    positionX: Math.max(0, Math.min(table.positionX, Math.max(gridColumns - width, 0))),
    positionY: Math.max(0, table.positionY),
    width: Math.min(width, gridColumns),
    height,
  };
}

function overlaps(
  left: Pick<AdminHallConstructorTable, 'positionX' | 'positionY' | 'width' | 'height'>,
  right: Pick<AdminHallConstructorTable, 'positionX' | 'positionY' | 'width' | 'height'>,
) {
  return !(
    left.positionX + left.width <= right.positionX ||
    right.positionX + right.width <= left.positionX ||
    left.positionY + left.height <= right.positionY ||
    right.positionY + right.height <= left.positionY
  );
}

export function canPlaceTable(
  tables: AdminHallConstructorTable[],
  candidate: Pick<AdminHallConstructorTable, 'id' | 'positionX' | 'positionY' | 'width' | 'height'>,
  gridColumns: number,
) {
  if (candidate.positionX < 0 || candidate.positionY < 0 || candidate.width < 1 || candidate.height < 1) {
    return false;
  }
  if (candidate.positionX + candidate.width > gridColumns) {
    return false;
  }

  return !tables.some((table) => {
    if (table.id === candidate.id) {
      return false;
    }

    return overlaps(table, candidate);
  });
}

export function findFirstAvailablePlacement(
  tables: AdminHallConstructorTable[],
  gridColumns: number,
  width = 1,
  height = 1,
) {
  const rows = getRequiredGridRows(tables) + 12;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x <= Math.max(gridColumns - width, 0); x += 1) {
      const candidate = {
        id: '__candidate__',
        positionX: x,
        positionY: y,
        width,
        height,
      };

      if (canPlaceTable(tables, candidate, gridColumns)) {
        return { positionX: x, positionY: y };
      }
    }
  }

  return { positionX: 0, positionY: rows };
}

export function getVariantMarkers(shapeVariant: AdminTableShapeVariant): ConstructorSeatMarker[] {
  switch (shapeVariant) {
    case 'seat2_vertical':
      return [
        { key: 'top', top: 8, left: '50%', width: 36, height: 8, transform: 'translateX(-50%)' },
        { key: 'bottom', bottom: 8, left: '50%', width: 36, height: 8, transform: 'translateX(-50%)' },
      ];
    case 'seat3_triangle':
      return [
        { key: 'left', top: '52%', left: 8, width: 8, height: 30, transform: 'translateY(-50%)' },
        { key: 'right', top: '52%', right: 8, width: 8, height: 30, transform: 'translateY(-50%)' },
        { key: 'bottom', bottom: 8, left: '50%', width: 34, height: 8, transform: 'translateX(-50%)' },
      ];
    case 'seat4_horizontal':
      return [
        { key: 'top-left', top: 8, left: '26%', width: 26, height: 8, transform: 'translateX(-50%)' },
        { key: 'top-right', top: 8, left: '74%', width: 26, height: 8, transform: 'translateX(-50%)' },
        { key: 'bottom-left', bottom: 8, left: '26%', width: 26, height: 8, transform: 'translateX(-50%)' },
        { key: 'bottom-right', bottom: 8, left: '74%', width: 26, height: 8, transform: 'translateX(-50%)' },
      ];
    case 'seat4_vertical':
      return [
        { key: 'left-top', top: '28%', left: 8, width: 8, height: 24, transform: 'translateY(-50%)' },
        { key: 'left-bottom', top: '72%', left: 8, width: 8, height: 24, transform: 'translateY(-50%)' },
        { key: 'right-top', top: '28%', right: 8, width: 8, height: 24, transform: 'translateY(-50%)' },
        { key: 'right-bottom', top: '72%', right: 8, width: 8, height: 24, transform: 'translateY(-50%)' },
      ];
    case 'seat5_horizontal':
      return [
        { key: 'top-left', top: 8, left: '28%', width: 22, height: 8, transform: 'translateX(-50%)' },
        { key: 'top-right', top: 8, left: '72%', width: 22, height: 8, transform: 'translateX(-50%)' },
        { key: 'left', top: '50%', left: 8, width: 8, height: 24, transform: 'translateY(-50%)' },
        { key: 'right', top: '50%', right: 8, width: 8, height: 24, transform: 'translateY(-50%)' },
        { key: 'bottom', bottom: 8, left: '50%', width: 28, height: 8, transform: 'translateX(-50%)' },
      ];
    case 'seat5_vertical':
      return [
        { key: 'left-top', top: '30%', left: 8, width: 8, height: 20, transform: 'translateY(-50%)' },
        { key: 'left-bottom', top: '70%', left: 8, width: 8, height: 20, transform: 'translateY(-50%)' },
        { key: 'top', top: 8, left: '50%', width: 22, height: 8, transform: 'translateX(-50%)' },
        { key: 'bottom', bottom: 8, left: '50%', width: 22, height: 8, transform: 'translateX(-50%)' },
        { key: 'right', top: '50%', right: 8, width: 8, height: 26, transform: 'translateY(-50%)' },
      ];
    case 'seat6_horizontal':
      return [
        { key: 'top-left', top: 8, left: '24%', width: 18, height: 8, transform: 'translateX(-50%)' },
        { key: 'top-center', top: 8, left: '50%', width: 18, height: 8, transform: 'translateX(-50%)' },
        { key: 'top-right', top: 8, left: '76%', width: 18, height: 8, transform: 'translateX(-50%)' },
        { key: 'bottom-left', bottom: 8, left: '24%', width: 18, height: 8, transform: 'translateX(-50%)' },
        { key: 'bottom-center', bottom: 8, left: '50%', width: 18, height: 8, transform: 'translateX(-50%)' },
        { key: 'bottom-right', bottom: 8, left: '76%', width: 18, height: 8, transform: 'translateX(-50%)' },
      ];
    case 'seat6_vertical':
      return [
        { key: 'left-top', top: '24%', left: 8, width: 8, height: 18, transform: 'translateY(-50%)' },
        { key: 'left-middle', top: '50%', left: 8, width: 8, height: 18, transform: 'translateY(-50%)' },
        { key: 'left-bottom', top: '76%', left: 8, width: 8, height: 18, transform: 'translateY(-50%)' },
        { key: 'right-top', top: '24%', right: 8, width: 8, height: 18, transform: 'translateY(-50%)' },
        { key: 'right-middle', top: '50%', right: 8, width: 8, height: 18, transform: 'translateY(-50%)' },
        { key: 'right-bottom', top: '76%', right: 8, width: 8, height: 18, transform: 'translateY(-50%)' },
      ];
    case 'seat4_square':
      return [
        { key: 'top', top: 8, left: '50%', width: 28, height: 8, transform: 'translateX(-50%)' },
        { key: 'bottom', bottom: 8, left: '50%', width: 28, height: 8, transform: 'translateX(-50%)' },
        { key: 'left', top: '50%', left: 8, width: 8, height: 28, transform: 'translateY(-50%)' },
        { key: 'right', top: '50%', right: 8, width: 8, height: 28, transform: 'translateY(-50%)' },
      ];
    case 'seat2_horizontal':
    default:
      return [
        { key: 'left', top: '50%', left: 8, width: 8, height: 28, transform: 'translateY(-50%)' },
        { key: 'right', top: '50%', right: 8, width: 8, height: 28, transform: 'translateY(-50%)' },
      ];
  }
}
