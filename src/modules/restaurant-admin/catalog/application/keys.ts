import { createKeyFactory } from 'shared/api';

const catalogBaseKeys = createKeyFactory('catalog');
const categoryKeys = createKeyFactory('catalog', 'categories');
const itemKeys = createKeyFactory('catalog', 'items');
const mxikKeys = createKeyFactory('catalog', 'mxik');
const prepStationKeys = createKeyFactory('catalog', 'prepStations');
const modifierGroupKeys = createKeyFactory('catalog', 'modifierGroups');
const itemGroupKeys = createKeyFactory('catalog', 'itemGroups');

export const catalogKeys = {
  all: catalogBaseKeys.all,
  categories: () => categoryKeys.all,
  categoriesList: categoryKeys.list,
  categoryDetail: categoryKeys.detail,
  items: () => itemKeys.all,
  itemsList: itemKeys.list,
  itemDetail: itemKeys.detail,
  itemGroups: () => itemGroupKeys.all,
  itemGroupsList: itemGroupKeys.list,
  mxik: () => mxikKeys.all,
  mxikSearch: mxikKeys.search,
  mxikBarcode: (barcode: string, lang: string) => [...mxikKeys.all, 'barcode', barcode, lang] as const,
  mxikDetail: (code: string, lang?: string) => [...mxikKeys.detail(code), lang ?? 'uz'] as const,
  prepStations: () => prepStationKeys.all,
  modifierGroups: () => modifierGroupKeys.all,
  modifierGroupDetail: modifierGroupKeys.detail,
} as const;
