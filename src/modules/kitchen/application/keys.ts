export const kitchenKeys = {
  all: ['kitchen'] as const,
  list: (params: Record<string, unknown>) => [...kitchenKeys.all, 'list', params] as const,
  detail: (id: string) => [...kitchenKeys.all, 'detail', id] as const,
  prepStations: () => [...kitchenKeys.all, 'prepStations'] as const,
};
