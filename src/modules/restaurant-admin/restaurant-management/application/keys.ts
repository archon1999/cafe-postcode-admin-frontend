import { createKeyFactory } from 'shared/api';

const organizationsBaseKeys = createKeyFactory('organizations');
const cashDesksKeys = createKeyFactory('organizations', 'cashDesks');
const cashDeskKeys = createKeyFactory('organizations', 'cashDesk');
const distributionPointsKeys = createKeyFactory('organizations', 'distributionPoints');
const distributionPointKeys = createKeyFactory('organizations', 'distributionPoint');
const prepStationsKeys = createKeyFactory('organizations', 'prepStations');
const prepStationKeys = createKeyFactory('organizations', 'prepStation');
const integrationConfigsKeys = createKeyFactory('organizations', 'integrationConfigs');
const integrationConfigKeys = createKeyFactory('organizations', 'integrationConfig');
const restaurantsKeys = createKeyFactory('organizations', 'restaurants');
const restaurantKeys = createKeyFactory('organizations', 'restaurant');
const hallsKeys = createKeyFactory('organizations', 'halls');

export const organizationsKeys = {
  all: organizationsBaseKeys.all,
  cashDesks: () => cashDesksKeys.all,
  cashDesksList: cashDesksKeys.list,
  cashDeskDetail: cashDeskKeys.id,
  distributionPoints: () => distributionPointsKeys.all,
  distributionPointsList: distributionPointsKeys.list,
  distributionPointDetail: distributionPointKeys.id,
  prepStations: () => prepStationsKeys.all,
  prepStationsList: prepStationsKeys.list,
  prepStationDetail: prepStationKeys.id,
  integrationConfigs: () => integrationConfigsKeys.all,
  integrationConfigsList: integrationConfigsKeys.list,
  integrationConfigDetail: integrationConfigKeys.id,
  restaurants: () => restaurantsKeys.all,
  restaurantsList: restaurantsKeys.list,
  myRestaurant: () => [...restaurantKeys.all, 'me'] as const,
  restaurantDetail: restaurantKeys.id,
  halls: () => hallsKeys.all,
} as const;
