export const organizationsKeys = {
  all: ['organizations'] as const,
  cashDesks: () => [...organizationsKeys.all, 'cashDesks'] as const,
  cashDesksList: (params: Record<string, unknown>) => [...organizationsKeys.cashDesks(), 'list', params] as const,
  cashDeskDetail: (id: string) => [...organizationsKeys.all, 'cashDesk', id] as const,
  devices: () => [...organizationsKeys.all, 'devices'] as const,
  devicesList: (params: Record<string, unknown>) => [...organizationsKeys.devices(), 'list', params] as const,
  deviceDetail: (id: string) => [...organizationsKeys.all, 'device', id] as const,
  distributionPoints: () => [...organizationsKeys.all, 'distributionPoints'] as const,
  distributionPointsList: (params: Record<string, unknown>) =>
    [...organizationsKeys.distributionPoints(), 'list', params] as const,
  distributionPointDetail: (id: string) => [...organizationsKeys.all, 'distributionPoint', id] as const,
  featureConfigs: () => [...organizationsKeys.all, 'featureConfigs'] as const,
  featureConfigsList: (params: Record<string, unknown>) =>
    [...organizationsKeys.featureConfigs(), 'list', params] as const,
  featureConfigDetail: (id: string) => [...organizationsKeys.all, 'featureConfig', id] as const,
  prepStations: () => [...organizationsKeys.all, 'prepStations'] as const,
  prepStationsList: (params: Record<string, unknown>) => [...organizationsKeys.prepStations(), 'list', params] as const,
  prepStationDetail: (id: string) => [...organizationsKeys.all, 'prepStation', id] as const,
  restaurants: () => [...organizationsKeys.all, 'restaurants'] as const,
  restaurantsList: (params: Record<string, unknown>) => [...organizationsKeys.restaurants(), 'list', params] as const,
  restaurantDetail: (id: string) => [...organizationsKeys.all, 'restaurant', id] as const,
  restaurantFeatureConfig: (restaurantId: string) =>
    [...organizationsKeys.all, 'restaurant', restaurantId, 'featureConfig'] as const,
  halls: () => [...organizationsKeys.all, 'halls'] as const,
} as const;
