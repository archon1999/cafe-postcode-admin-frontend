export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  categoriesList: (params: Record<string, unknown>) => [...catalogKeys.categories(), 'list', params] as const,
  categoryDetail: (id: string) => [...catalogKeys.categories(), 'detail', id] as const,
  items: () => [...catalogKeys.all, 'items'] as const,
  itemsList: (params: Record<string, unknown>) => [...catalogKeys.items(), 'list', params] as const,
  itemDetail: (id: string) => [...catalogKeys.items(), 'detail', id] as const,
  mxik: () => [...catalogKeys.all, 'mxik'] as const,
  mxikSearch: (params: Record<string, unknown>) => [...catalogKeys.mxik(), 'search', params] as const,
  mxikDetail: (code: string, lang?: string) => [...catalogKeys.mxik(), 'detail', code, lang ?? 'uz'] as const,
  prepStations: () => [...catalogKeys.all, 'prepStations'] as const,
};
