import { createKeyFactory } from 'shared/api';

const catalogBaseKeys = createKeyFactory('catalog');
const categoryKeys = createKeyFactory('catalog', 'categories');
const itemKeys = createKeyFactory('catalog', 'items');
const mxikKeys = createKeyFactory('catalog', 'mxik');
const prepStationKeys = createKeyFactory('catalog', 'prepStations');

export const catalogKeys = {
  all: catalogBaseKeys.all,
  categories: () => categoryKeys.all,
  categoriesList: categoryKeys.list,
  categoryDetail: categoryKeys.detail,
  items: () => itemKeys.all,
  itemsList: itemKeys.list,
  itemDetail: itemKeys.detail,
  mxik: () => mxikKeys.all,
  mxikSearch: mxikKeys.search,
  mxikDetail: (code: string, lang?: string) => [...mxikKeys.detail(code), lang ?? 'uz'] as const,
  prepStations: () => prepStationKeys.all,
} as const;
