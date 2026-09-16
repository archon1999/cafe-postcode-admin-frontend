export type { FloorRepository } from './contracts/floor.repository';
export * from './enums';
export {
  GRID_CELL_SIZE,
  GRID_GAP_SIZE,
  GRID_PADDING_SIZE,
  MAX_PRESET_TABLE_SEAT_COUNT,
  MAX_TABLE_SEAT_COUNT,
  MIN_GRID_ROWS,
  MIN_TABLE_SEAT_COUNT,
  TABLE_VARIANTS_BY_SEAT_COUNT,
  canPlaceTable,
  clampTableToGrid,
  findFirstAvailablePlacement,
  getDefaultShapeVariant,
  getNextTableNumber,
  getRequiredGridRows,
  getShapeVariantsForSeatCount,
  getVariantMarkers,
  type ConstructorSeatMarker,
} from './lib/hall-constructor';
export { getTableSessionStatusTranslationKey } from './lib/presenters';
