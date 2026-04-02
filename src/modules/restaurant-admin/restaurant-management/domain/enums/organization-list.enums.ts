export const ORGANIZATION_RECORD_STATUS_FILTER_VALUES = ['active', 'inactive'] as const;

export const ORGANIZATION_RESTAURANT_KIND_FILTER_VALUES = ['default', 'regular'] as const;

export const ORGANIZATION_FEATURE_ROLE_VALUES = [
  'admin',
  'owner',
  'manager',
  'waiter',
  'cashier',
  'chef',
  'barman',
  'universal_operator',
] as const;

export const ORGANIZATION_DEVICE_MODE_VALUES = [
  'admin',
  'waiter',
  'cashier',
  'kitchen_display',
  'owner_dashboard',
] as const;

export const ORGANIZATION_DISTRIBUTION_POINT_KIND_VALUES = ['hall', 'online', 'takeaway', 'delivery'] as const;

export const ORGANIZATION_PREP_STATION_KIND_VALUES = ['kitchen', 'bar', 'other'] as const;
