export type FeatureConfigPresetValues = {
  hallEnabled: boolean;
  kitchenEnabled: boolean;
  cashierEnabled: boolean;
  ownerDashboardEnabled: boolean;
  orderEntryMode: 'hall' | 'cashier_builder';
  kitchenMode: 'display' | 'printer' | 'both';
  enabledModules: string[];
  enabledRoles: string[];
};

export const FEATURE_CONFIG_PRESETS: Array<{
  key: 'full_service' | 'fast_food' | 'printer_kitchen';
  values: FeatureConfigPresetValues;
}> = [
  {
    key: 'full_service',
    values: {
      hallEnabled: true,
      kitchenEnabled: true,
      cashierEnabled: true,
      ownerDashboardEnabled: true,
      orderEntryMode: 'hall',
      kitchenMode: 'display',
      enabledModules: ['hall', 'kitchen', 'cashier', 'owner_dashboard'],
      enabledRoles: ['owner', 'admin', 'manager', 'waiter', 'cashier', 'chef', 'barman', 'universal_operator'],
    },
  },
  {
    key: 'fast_food',
    values: {
      hallEnabled: false,
      kitchenEnabled: false,
      cashierEnabled: true,
      ownerDashboardEnabled: true,
      orderEntryMode: 'cashier_builder',
      kitchenMode: 'display',
      enabledModules: ['cashier', 'owner_dashboard'],
      enabledRoles: ['owner', 'admin', 'manager', 'cashier', 'universal_operator'],
    },
  },
  {
    key: 'printer_kitchen',
    values: {
      hallEnabled: true,
      kitchenEnabled: true,
      cashierEnabled: true,
      ownerDashboardEnabled: true,
      orderEntryMode: 'hall',
      kitchenMode: 'printer',
      enabledModules: ['hall', 'kitchen', 'cashier', 'owner_dashboard'],
      enabledRoles: ['owner', 'admin', 'manager', 'waiter', 'cashier', 'universal_operator'],
    },
  },
];
