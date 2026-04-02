export type { FloorRepository } from './contracts/floor.repository';
export * from './enums';
export {
  GRID_CELL_SIZE,
  GRID_GAP_SIZE,
  GRID_PADDING_SIZE,
  MIN_GRID_ROWS,
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
