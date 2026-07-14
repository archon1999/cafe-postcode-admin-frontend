import { createKeyFactory } from 'shared/api';

const organizationsBaseKeys = createKeyFactory('organizations');
const cashDesksKeys = createKeyFactory('organizations', 'cashDesks');
const cashDeskKeys = createKeyFactory('organizations', 'cashDesk');
const prepStationsKeys = createKeyFactory('organizations', 'prepStations');
const prepStationKeys = createKeyFactory('organizations', 'prepStation');
const integrationConfigsKeys = createKeyFactory('organizations', 'integrationConfigs');
const integrationConfigKeys = createKeyFactory('organizations', 'integrationConfig');
const restaurantsKeys = createKeyFactory('organizations', 'restaurants');
const restaurantKeys = createKeyFactory('organizations', 'restaurant');
const hallsKeys = createKeyFactory('organizations', 'halls');
const setupKeys = createKeyFactory('organizations', 'setup');

export const organizationsKeys = {
  all: organizationsBaseKeys.all,
  cashDesks: () => cashDesksKeys.all,
  cashDesksList: cashDesksKeys.list,
  cashDeskDetail: cashDeskKeys.id,
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
  setupReadiness: () => [...setupKeys.all, 'readiness'] as const,
  localAgentStatus: () => [...setupKeys.all, 'local-agent-status'] as const,
  localAgentDiagnostics: () => [...setupKeys.all, 'local-agent-diagnostics'] as const,
  localAgentLogs: () => [...setupKeys.all, 'local-agent-logs'] as const,
} as const;
