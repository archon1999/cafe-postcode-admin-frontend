import { createKeyFactory } from 'shared/api';

const organizationsBaseKeys = createKeyFactory('organizations');
const cashDesksKeys = createKeyFactory('organizations', 'cashDesks');
const cashDeskKeys = createKeyFactory('organizations', 'cashDesk');
const devicesKeys = createKeyFactory('organizations', 'devices');
const deviceKeys = createKeyFactory('organizations', 'device');
const distributionPointsKeys = createKeyFactory('organizations', 'distributionPoints');
const distributionPointKeys = createKeyFactory('organizations', 'distributionPoint');
const featureConfigsKeys = createKeyFactory('organizations', 'featureConfigs');
const featureConfigKeys = createKeyFactory('organizations', 'featureConfig');
const prepStationsKeys = createKeyFactory('organizations', 'prepStations');
const prepStationKeys = createKeyFactory('organizations', 'prepStation');
const restaurantsKeys = createKeyFactory('organizations', 'restaurants');
const restaurantKeys = createKeyFactory('organizations', 'restaurant');
const hallsKeys = createKeyFactory('organizations', 'halls');

export const organizationsKeys = {
  all: organizationsBaseKeys.all,
  cashDesks: () => cashDesksKeys.all,
  cashDesksList: cashDesksKeys.list,
  cashDeskDetail: cashDeskKeys.id,
  devices: () => devicesKeys.all,
  devicesList: devicesKeys.list,
  deviceDetail: deviceKeys.id,
  distributionPoints: () => distributionPointsKeys.all,
  distributionPointsList: distributionPointsKeys.list,
  distributionPointDetail: distributionPointKeys.id,
  featureConfigs: () => featureConfigsKeys.all,
  featureConfigsList: featureConfigsKeys.list,
  featureConfigDetail: featureConfigKeys.id,
  prepStations: () => prepStationsKeys.all,
  prepStationsList: prepStationsKeys.list,
  prepStationDetail: prepStationKeys.id,
  restaurants: () => restaurantsKeys.all,
  restaurantsList: restaurantsKeys.list,
  myRestaurant: () => [...restaurantKeys.all, 'me'] as const,
  restaurantDetail: restaurantKeys.id,
  restaurantFeatureConfig: (restaurantId: string) => [...restaurantKeys.id(restaurantId), 'featureConfig'] as const,
  halls: () => hallsKeys.all,
} as const;
