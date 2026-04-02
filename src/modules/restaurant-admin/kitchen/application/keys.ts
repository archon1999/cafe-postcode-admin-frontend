import { createKeyFactory } from 'shared/api';

const kitchenBaseKeys = createKeyFactory('kitchen');
const prepStationKeys = createKeyFactory('kitchen', 'prepStations');

export const kitchenKeys = {
  all: kitchenBaseKeys.all,
  list: kitchenBaseKeys.list,
  detail: kitchenBaseKeys.detail,
  prepStations: () => prepStationKeys.all,
} as const;
