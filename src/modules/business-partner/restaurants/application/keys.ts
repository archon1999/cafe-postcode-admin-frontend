import { createKeyFactory } from 'shared/api';
import { normalizeFilters } from 'shared/api/query/normalizeFilters';

const organizationsBaseKeys = createKeyFactory('organizations');
const cashDesksKeys = createKeyFactory('organizations', 'cashDesks');
const cashDeskKeys = createKeyFactory('organizations', 'cashDesk');
const distributionPointsKeys = createKeyFactory('organizations', 'distributionPoints');
const distributionPointKeys = createKeyFactory('organizations', 'distributionPoint');
const prepStationsKeys = createKeyFactory('organizations', 'prepStations');
const prepStationKeys = createKeyFactory('organizations', 'prepStation');
const restaurantsKeys = createKeyFactory('organizations', 'restaurants');
const restaurantKeys = createKeyFactory('organizations', 'restaurant');
const restaurantOverviewKeys = createKeyFactory('organizations', 'restaurantOverview');
const hallsKeys = createKeyFactory('organizations', 'halls');
const restaurantBalanceTransactionsKeys = createKeyFactory('organizations', 'restaurantBalanceTransactions');

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
  restaurants: () => restaurantsKeys.all,
  restaurantsList: restaurantsKeys.list,
  restaurantDetail: restaurantKeys.id,
  restaurantOverview: restaurantOverviewKeys.id,
  restaurantBalanceTransactions: (restaurantId: string) => restaurantBalanceTransactionsKeys.id(restaurantId),
  restaurantBalanceTransactionsList: (restaurantId: string, filters?: Record<string, unknown>) => {
    const normalizedFilters = normalizeFilters(filters ?? {});
    if (!Object.keys(normalizedFilters).length) {
      return [...restaurantBalanceTransactionsKeys.id(restaurantId), 'list'] as const;
    }

    return [...restaurantBalanceTransactionsKeys.id(restaurantId), 'list', normalizedFilters] as const;
  },
  halls: () => hallsKeys.all,
} as const;
